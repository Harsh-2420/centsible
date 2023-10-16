from flask import Flask, render_template, jsonify, Response, request
from flask_cors import CORS, cross_origin
import json
import pandas as pd
import numpy as np
import os
import sqlite3

app = Flask(__name__)
cors=CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'


# Process CSV
def read_and_clean_data():
    headers = ["transaction_date", "reference_number", "CAD", "transaction_name"]
    amex = pd.read_csv("./data/amex.csv", header=None,  usecols=[0, 1, 2, 3])
    amex.columns = headers

    rbc = pd.read_csv("./data/rbc.csv", header=None,  usecols=[0, 1, 2, 3,4,5,6,7], skiprows=[0])
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

def process_transactions_debit_credit(combined_df):
    # Filtering by month (July for Now)
    for curr_month in range(1, 13):
        if curr_month == 8:
            curr_df = combined_df[combined_df['transaction_date'].dt.month == curr_month]
    
    curr_df['group_tags'] = curr_df['transaction_name'].apply(match_tags)
    curr_df = curr_df.sort_values('transaction_date')
    curr_df['transaction_date'] = curr_df['transaction_date'].dt.strftime('%Y-%m-%dT%H:%M:%SZ')
    curr_df.loc[curr_df['account_type'] == 'Amex', 'CAD'] = -curr_df.loc[curr_df['account_type'] == 'Amex', 'CAD']
    curr_df.loc[curr_df['account_type'] == 'MasterCard', 'CAD'] = -curr_df.loc[curr_df['account_type'] == 'MasterCard', 'CAD']
    curr_df.insert(0, 'id', range(1, len(curr_df) + 1))
    return curr_df

@app.route('/', methods=['GET'])
def index():
    # df = File Upload ----> this needs to be passed to read_and_clean_data()
    combined_df = read_and_clean_data()
    curr_data = process_transactions_debit_credit(combined_df)
    COMBINED_DF = curr_data
    return jsonify(curr_data.to_dict(orient='records'))


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
