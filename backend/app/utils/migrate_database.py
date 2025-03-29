"""
Migration script to add missing columns to the database
"""
import os
import pymysql
from urllib.parse import quote_plus
from dotenv import load_dotenv
import sys

# Load environment variables from .env file
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))

def alter_table_add_is_admin():
    """Add is_admin column to users table if it doesn't exist"""
    # Get database connection parameters from environment
    mysql_user = os.environ.get('DB_USER')
    mysql_password = os.environ.get('DB_PASSWORD', '')
    mysql_host = os.environ.get('DB_HOST')
    mysql_db = os.environ.get('DB_NAME')
    
    print(f"Connecting to MySQL database at {mysql_host} with user {mysql_user}")
    
    # Connect to the database
    try:
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_db
        )
    except Exception as e:
        print(f"Failed to connect to MySQL server: {str(e)}")
        sys.exit(1)
    
    try:
        with connection.cursor() as cursor:
            # Check if the column exists
            cursor.execute("""
                SELECT COUNT(*)
                FROM information_schema.COLUMNS
                WHERE 
                    TABLE_SCHEMA = %s AND
                    TABLE_NAME = 'users' AND
                    COLUMN_NAME = 'is_admin'
            """, (mysql_db,))
            
            result = cursor.fetchone()
            if result[0] == 0:
                # Column doesn't exist, add it
                print("Adding is_admin column to users table...")
                cursor.execute("""
                    ALTER TABLE users
                    ADD COLUMN is_admin BOOLEAN DEFAULT FALSE
                """)
                connection.commit()
                print("is_admin column added successfully.")
            else:
                print("is_admin column already exists.")
                
    except Exception as e:
        print(f"Error during migration: {str(e)}")
    finally:
        connection.close()

if __name__ == "__main__":
    alter_table_add_is_admin()