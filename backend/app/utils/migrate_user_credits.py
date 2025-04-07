"""
Migration script to add credits column to users table
"""
import os
import pymysql
from pymysql.cursors import DictCursor

def run_migration():
    """
    Add credits column to users table if it doesn't exist
    Returns True if migration was successful, False otherwise
    """
    # Get database config from environment
    mysql_user = os.environ.get('DB_USER')
    mysql_password = os.environ.get('DB_PASSWORD', '')
    mysql_host = os.environ.get('DB_HOST')
    mysql_db = os.environ.get('DB_NAME')
    
    print(f"Running user credits column migration...")
    
    try:
        connection = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_db,
            cursorclass=DictCursor
        )
        
        with connection.cursor() as cursor:
            # Check if credits column exists in users table
            cursor.execute("""
            SELECT COUNT(*) as count 
            FROM information_schema.COLUMNS 
            WHERE TABLE_SCHEMA = %s
            AND TABLE_NAME = 'users'
            AND COLUMN_NAME = 'credits'
            """, (mysql_db,))
            
            result = cursor.fetchone()
            
            if result['count'] == 0:
                print("Adding 'credits' column to users table...")
                cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN credits INT NOT NULL DEFAULT 0
                """)
                connection.commit()
                print("✅ Added 'credits' column to users table")
                return True
            else:
                print("'credits' column already exists in users table.")
                return True
            
    except Exception as e:
        print(f"❌ Error running migration: {str(e)}")
        return False
    finally:
        if 'connection' in locals() and connection.open:
            connection.close()

if __name__ == "__main__":
    run_migration()