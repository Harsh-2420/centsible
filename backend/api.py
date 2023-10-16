from flask import Flask, render_template, jsonify, request
from flask_cors import CORS
import pandas as pd
import sqlite3

app = Flask(__name__)
CORS(app)

# SQLite Database Connection
def get_db_connection():
    conn = sqlite3.connect('transactions.db')
    conn.row_factory = sqlite3.Row
    return conn

# Create or initialize the database if it doesn't exist
def initialize_database():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY,
            transaction_date TEXT,
            CAD REAL,
            transaction_name TEXT,
            account_type TEXT,
            cheque_number TEXT,
            USD REAL,
            group_tags TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Data Cleaning and Processing
def read_and_clean_data():
    # Your data cleaning code goes here
    pass

# API Route to Process CSV Data
@app.route('/process_csv', methods=['POST'])
def process_csv():
    try:
        initialize_database()
        combined_df = read_and_clean_data()  # Your data cleaning function
        conn = get_db_connection()
        cursor = conn.cursor()

        # Retrieve data from the database
        cursor.execute('SELECT * FROM transactions')
        db_data = cursor.fetchall()
        db_df = pd.DataFrame(db_data)

        # Combine new data with existing data and remove duplicates
        updated_df = pd.concat([db_df, combined_df])
        updated_df = updated_df.drop_duplicates(subset=['id'])
        
        # Insert the updated data into the database
        cursor.execute("DELETE FROM transactions")
        for index, row in updated_df.iterrows():
            cursor.execute('''
                INSERT INTO transactions (id, transaction_date, CAD, transaction_name, account_type, cheque_number, USD, group_tags)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (row['id'], row['transaction_date'], row['CAD'], row['transaction_name'], row['account_type'], row['cheque_number'], row['USD'], row['group_tags']))
        conn.commit()
        conn.close()

        return jsonify({'message': 'Data processed successfully.'})
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run()
