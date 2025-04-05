"""
Migration script to add the is_yearly and package_id columns to the recharge_history table
"""

import os
import sys
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# Get database connection from environment variables
DB_HOST = os.environ.get('MYSQL_HOST', '8.130.113.102')
DB_USER = os.environ.get('MYSQL_USER', 'root')
DB_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'Ir%86241992')
DB_NAME = os.environ.get('MYSQL_DB', 'mat_db')
DB_PORT = os.environ.get('MYSQL_PORT', '3306')  # Default MySQL port

# Create database URI with proper escaping
DB_URI = f"mysql+pymysql://{DB_USER}:{quote_plus(DB_PASSWORD)}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Print connection info for debugging (hide password)
print(f"Database migration connecting to: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}")

def column_exists(table_name, column_name):
    """Check if a column exists in a table"""
    try:
        engine = create_engine(DB_URI)
        with engine.connect() as connection:
            query = text(f"""
                SELECT 1 
                FROM information_schema.COLUMNS 
                WHERE TABLE_SCHEMA = '{DB_NAME}' 
                AND TABLE_NAME = '{table_name}' 
                AND COLUMN_NAME = '{column_name}'
            """)
            result = connection.execute(query)
            return bool(result.scalar())
    except Exception as e:
        print(f"Error checking if column exists: {e}")
        return False

def alter_table_add_is_yearly():
    """Add is_yearly column to recharge_history table if it doesn't exist"""
    try:
        if not column_exists("recharge_history", "is_yearly"):
            engine = create_engine(DB_URI)
            with engine.connect() as connection:
                query = text("""
                    ALTER TABLE recharge_history
                    ADD COLUMN is_yearly BOOLEAN DEFAULT FALSE
                """)
                connection.execute(query)
                connection.commit()
                print("Added is_yearly column to recharge_history table")
        else:
            print("is_yearly column already exists in recharge_history table")
    except Exception as e:
        print(f"Error adding is_yearly column: {e}")
        
def alter_table_add_package_id():
    """Add package_id column to recharge_history table if it doesn't exist"""
    try:
        if not column_exists("recharge_history", "package_id"):
            engine = create_engine(DB_URI)
            with engine.connect() as connection:
                query = text("""
                    ALTER TABLE recharge_history
                    ADD COLUMN package_id VARCHAR(50) DEFAULT NULL
                """)
                connection.execute(query)
                connection.commit()
                print("Added package_id column to recharge_history table")
        else:
            print("package_id column already exists in recharge_history table")
    except Exception as e:
        print(f"Error adding package_id column: {e}")

if __name__ == "__main__":
    alter_table_add_is_yearly()
    alter_table_add_package_id()
    print("Migration completed")