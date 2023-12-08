from flask import Flask, render_template, jsonify, Response, request, session
from flask_session import Session
from flask_cors import CORS, cross_origin
import json
import pandas as pd
import numpy as np
import os
import sqlite3
from datetime import datetime, timedelta

app = Flask(__name__)
cors=CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config["SESSION_PERMANENT"] = False
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SECRET_KEY'] = 'centsible'
Session(app)


def has_file(directory_path, file_name):
    """
    Check if file exists in a given directory
    """
    file_path = os.path.join(directory_path, file_name)
    return os.path.isfile(file_path)

def combine_existing_and_uploaded_data(directory_path, file_name_to_check, new_data):
    """
    Parse Existing data (old_data) and combine with the new_data. 
    Return a dataframe that has the existing data (tagged and edited by user) and new data (tagged)
    """
    # Check if a csv already exists with old user data
    if has_file(directory_path, file_name_to_check):
        # Read in Existing Data from data_store
        old_data = pd.read_csv(os.path.join(directory_path, file_name_to_check))

        # Format Existing Data
        old_data = old_data.drop('Unnamed: 0', axis=1)
        old_data['transaction_date'] = pd.to_datetime(old_data['transaction_date']).dt.tz_localize(None)

        # From the New Uploaded Data, filter out the dates that have already been covered in existing data (and potential user edits)
        max_old_date = max(old_data['transaction_date']) - timedelta(days=1)
        filtered_new_data = new_data[new_data['transaction_date'] > max_old_date]

        # Process / Tag New Uploaded Data
        new_processed_data = process_transactions_debit_credit(filtered_new_data)
        new_processed_data['transaction_date'] = pd.to_datetime(new_processed_data['transaction_date']).dt.tz_localize(None)

        # Merge old data with new processed data
        all_merged_transactions = pd.merge(
            old_data,
            new_processed_data,
            on=['transaction_date', 'CAD', 'transaction_name'],
            how='outer',
            indicator=True
        )
        
        # Identify Data that has already been edited by the user and combine with new (non-edited) data
        old_data_post_merge = all_merged_transactions[all_merged_transactions['_merge'].isin(['both', 'left_only'])]
        new_data_post_merge = all_merged_transactions[all_merged_transactions['_merge'].isin(['right_only'])]

        old_data_post_merge = old_data_post_merge.drop(['id_y', 'account_type_y', 'cheque_number_y', 'USD_y', 'group_tags_y', '_merge'], axis=1).rename(columns={
            'id_x': 'id',
            'account_type_x': 'account_type',
            'cheque_number_x': 'cheque_number',	
            'USD_x': 'USD', 
            'group_tags_x': 'group_tags'
        })

        new_data_post_merge = new_data_post_merge.drop(['id_x', 'account_type_x', 'cheque_number_x', 'USD_x', 'group_tags_x', '_merge'], axis=1).rename(columns={
            'id_y': 'id',
            'account_type_y': 'account_type',
            'cheque_number_y': 'cheque_number',	
            'USD_y': 'USD', 
            'group_tags_y': 'group_tags'
        })
        combined_current_df = pd.concat([old_data_post_merge,new_data_post_merge], ignore_index=True).drop(['id'], axis=1)
        combined_current_df['id'] = range(1, len(combined_current_df) + 1)
    else:
        # Processing of new data for all months available
        print("No existing file found")
        combined_current_df = process_transactions_debit_credit(new_data)
    return combined_current_df

def process_uploaded_data(amex, rbc, splitwise):
    """
    Combine all the new data that has been uploaded

    - Rename the headers for Amex and RBC 
    - Update Transaction Date Types for Amex and RBC
    - Combine the 2 together into a "combined_df"
    """
    headers = ["transaction_date", "reference_number", "CAD", "transaction_name"]
    amex.columns = headers

    headers = ["account_type",	"account_number",	"transaction_date",	"cheque_number",	"Description 1", "Description 2",	"CAD",	"USD"] 
    rbc.columns = headers
    splitwise_tags = ['personal', 'yet to split', 'split complete']
    
    # Cleaning
    rbc['transaction_name'] = rbc['Description 1'].str.cat(rbc['Description 2'], sep=' ', na_rep='')

    amex['transaction_date'] = pd.to_datetime(amex['transaction_date'])
    rbc['transaction_date'] = pd.to_datetime(rbc['transaction_date'])

    amex['account_type'] = 'Amex'

    rbc_temp = rbc.drop(['Description 1', 'Description 2', 'account_number'], axis=1)
    amex_temp = amex.drop(['reference_number'], axis=1)
    combined_df = pd.concat([amex_temp, rbc_temp], ignore_index=True, sort=False)
    return combined_df

def match_tags(text):
    """
    Helper function for the tagging procedure - Has all the hardcoded values for tags.
    
    Refer to process_transactions_debit_credit for the main function.
    """
    group_tags = {
    'Income': ['PAYROLL', 'DEPOSIT INTEREST', 'BONUS DEPOSIT INTEREST', 'PROV/LOCAL GVT PYMT CANADA'],
    'Entertainment':['Spotify', 'Netflix', 'LCBO', 'CINEPLEX', 'Cafe'], 
    'Bills':['Bell', 'Rent', 'INTERNATIONAL REMIT', "INT'L REMIT FEE", 'Insurance', 'Goodlife', 'Utilities', 'Electricity', 'membership fee installment', 'Square One Insu'], 
    'Groceries':['Walmart', 'Rabba', 'Shoppers Drug Mart', 'Freshco', 'Dollorama'], 
    'Restaurants':['Uber Eats','CLUCK CLUCKS', 'Pizza'], 
    'Miscellaneous':['Men Zone'], 
    'Travel':['Uber', 'Presto']
    }
    for tag, values in group_tags.items():
        for value in values:
            if value.lower() in text.lower():
                return tag
    return 'Uncategorized'

def process_transactions_debit_credit(curr_df):
    """
    Tagging Procedure:

    This function takes the dataframe and applies the automated tagging procedure to it. Return the new dataframe.
    """    
    # Apply Group Tags 
    curr_df['group_tags'] = curr_df['transaction_name'].apply(match_tags)
    
    # Sorting by Date and Formatting it
    curr_df = curr_df.sort_values('transaction_date')
    curr_df['transaction_date'] = curr_df['transaction_date'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    
    # Setting all expenses to negative and incomes to positive
    curr_df.loc[curr_df['account_type'] == 'Amex', 'CAD'] = -curr_df.loc[curr_df['account_type'] == 'Amex', 'CAD']
    curr_df.loc[curr_df['account_type'] == 'MasterCard', 'CAD'] = -curr_df.loc[curr_df['account_type'] == 'MasterCard', 'CAD']
    
    # Adding ID to all rows
    curr_df.insert(0, 'id', range(1, len(curr_df) + 1))
    return curr_df




@app.route('/process_transaction_files', methods=['GET'])
def process_transaction_files():
    """
    This is called after file upload:    
    - It pulls data from the latest uploaded file and the last modified file. The combined result is sent out
    """
    # Parse Data -> Replace with uploaded file:
    amex_df = session.get('amex_df', []) if 'amex_df' in session else None
    rbc_df = session.get('rbc_df', []) if 'rbc_df' in session else None
    splitwise_df = session.get('splitwise_df', []) if 'splitwise_df' in session else None

    test_variable = session.get('test_variable')
    print('#'*30, test_variable)
    print('#'*30, amex_df, rbc_df)
    # print('#'*30,'index_test /process', session.get('index_test'))

    if amex_df == None:
        amex_df = pd.read_csv('./data/amex.csv', header=None,  usecols=[0, 1, 2, 3])
        rbc_df = pd.read_csv('./data/rbc.csv', header=None,  usecols=[0, 1, 2, 3,4,5,6,7], skiprows=[0])

    # Existing Data Store Check Values Setup
    directory_path = './data_store/'
    file_name_to_check = 'combined_transactions_store.csv'

    # Combine and process all the uploaded data
    new_data = process_uploaded_data(amex_df, rbc_df, splitwise_df)

    # Parse Existing data and combine with the new_data. 
    # Return a dataframe that has the existing data (tagged and edited by user) and new data (tagged)
    curr_transaction_data = combine_existing_and_uploaded_data(directory_path, file_name_to_check, new_data)

    return jsonify(curr_transaction_data.to_dict(orient='records'))

# @app.route('/', methods=['GET'])
# def index():
#     session['index_test'] = 'Hello, World!'
#     print('#'*30,'index_test /', session.get('index_test'))


@app.route('/upload', methods=['GET', 'POST'])
def file_upload():
    """
    Step 1 in the project:
    Accept the files from React and send the files over to index function where they will be processed.
    """
    # Ensure all three files are provided
    if 'amex' not in request.files or 'rbc' not in request.files:
        return jsonify({'error': 'Correct Files not provided | Flask | file_upload()'}), 200

    amex_file = request.files['amex']
    rbc_file = request.files['rbc']
    
    if 'splitwise' in request.files:
        splitwise_file = request.files['splitwise']
        if splitwise_file and splitwise_file.filename.endswith('.csv'):
            splitwise_df = pd.read_csv(splitwise_file)
            session['splitwise_df'] = splitwise_df
            

    # Check if the file is provided and has a valid extension (you can customize this based on your file types)
    if amex_file and amex_file.filename.endswith('.csv'):
        amex_df = pd.read_csv(amex_file, header=None,  usecols=[0, 1, 2, 3])
        session['amex_df'] = amex_df
        session['test_variable'] = 'Hello, World!'
        print('#'*30,'sessionCheck', session.get('test_variable'))
        # print('#'*30, 'uploaded amex to session', amex_df)

    if rbc_file and rbc_file.filename.endswith('.csv'):
        rbc_df = pd.read_csv(rbc_file, header=None,  usecols=[0, 1, 2, 3,4,5,6,7], skiprows=[0])
        session['rbc_df'] = rbc_df



    # Continue with your processing or return a response
    return jsonify({'message': 'Files uploaded and processed successfully | Flask | file_upload()'}), 200

# Process Update | Group Tags
@app.route('/group_tags_update', methods=['POST'])
def group_tags_update():
    data = request.get_json()
    if 'id' in data and 'group_tags' in data:
        print(data)
        pass
        # Process the data as needed
        # For example, you can update the group tags for the provided ID
        # Here, we simply return the received data
        return jsonify(data)
    else:
        return jsonify({'error': 'Invalid data'})



if __name__ == '__main__':
    COMBINED_DF = pd.DataFrame()
    app.run()
