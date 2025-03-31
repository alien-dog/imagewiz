"""
Migration script to add the is_yearly and package_id columns to the recharge_history table
"""

import os
import sys
from sqlalchemy import inspect, text

# Add the parent directory to the sys.path
script_dir = os.path.dirname(os.path.abspath(__file__))
app_dir = os.path.abspath(os.path.join(script_dir, '..'))
sys.path.insert(0, app_dir)

# Import after path setup
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from app import create_app, db

def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    with db.engine.connect() as conn:
        inspector = inspect(db.engine)
        columns = [col['name'] for col in inspector.get_columns(table_name)]
        return column_name in columns

def alter_table_add_is_yearly():
    """Add is_yearly column to recharge_history table if it doesn't exist"""
    if not column_exists('recharge_history', 'is_yearly'):
        print("Adding 'is_yearly' column to recharge_history table...")
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE recharge_history ADD COLUMN is_yearly BOOLEAN DEFAULT FALSE"))
            conn.commit()
        print("Added 'is_yearly' column to recharge_history table.")
    else:
        print("Column 'is_yearly' already exists in recharge_history table.")

def alter_table_add_package_id():
    """Add package_id column to recharge_history table if it doesn't exist"""
    if not column_exists('recharge_history', 'package_id'):
        print("Adding 'package_id' column to recharge_history table...")
        with db.engine.connect() as conn:
            conn.execute(text("ALTER TABLE recharge_history ADD COLUMN package_id VARCHAR(50)"))
            conn.commit()
        print("Added 'package_id' column to recharge_history table.")
    else:
        print("Column 'package_id' already exists in recharge_history table.")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        print("Starting database migration...")
        alter_table_add_is_yearly()
        alter_table_add_package_id()
        print("Database migration completed successfully!")