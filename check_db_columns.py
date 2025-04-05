"""
Script to check the database tables and columns
"""
import os
import pymysql
from urllib.parse import quote_plus

def check_recharge_history_table():
    """Check the structure of the recharge_history table"""
    print("Checking recharge_history table...")
    
    # MySQL connection parameters
    mysql_host = os.environ.get('DB_HOST', os.environ.get('MYSQL_HOST', '8.130.113.102'))
    mysql_user = os.environ.get('DB_USER', os.environ.get('MYSQL_USER', 'root'))
    mysql_password = os.environ.get('DB_PASSWORD', os.environ.get('MYSQL_PASSWORD', 'Ir%86241992'))
    mysql_db = os.environ.get('DB_NAME', os.environ.get('MYSQL_DB', 'mat_db'))
    mysql_port = int(os.environ.get('DB_PORT', os.environ.get('MYSQL_PORT', '3306')))
    
    print(f"Connecting to MySQL: {mysql_user}@{mysql_host}:{mysql_port}/{mysql_db}")
    
    try:
        # Connect to the database
        conn = pymysql.connect(
            host=mysql_host,
            user=mysql_user,
            password=mysql_password,
            database=mysql_db,
            port=mysql_port
        )
        
        cursor = conn.cursor()
        
        # Query to get table columns
        query = "DESCRIBE recharge_history"
        cursor.execute(query)
        
        # Collect column names
        columns = [row[0] for row in cursor.fetchall()]
        
        print("Columns in recharge_history table:")
        for col in columns:
            print(f"- {col}")
        
        # Check for specific columns
        print(f"is_yearly column exists: {'is_yearly' in columns}")
        print(f"package_id column exists: {'package_id' in columns}")
        
        # Count rows
        cursor.execute("SELECT COUNT(*) FROM recharge_history")
        row_count = cursor.fetchone()[0]
        print(f"Total rows in recharge_history table: {row_count}")
        
        # Check recent payments
        cursor.execute("""
            SELECT recharge_history.*, users.username 
            FROM recharge_history 
            JOIN users ON recharge_history.user_id = users.id 
            ORDER BY recharge_history.created_at DESC 
            LIMIT 5
        """)
        
        recent_payments = cursor.fetchall()
        
        if recent_payments:
            print("\nRecent payments:")
            # Get column names for better display
            cursor.execute("DESCRIBE recharge_history")
            column_names = [row[0] for row in cursor.fetchall()]
            column_names.append("username")  # Add the joined column
            
            for payment in recent_payments:
                print("\nPayment details:")
                for i, value in enumerate(payment):
                    # Skip very long values like stripe_payment_id
                    if column_names[i] == "stripe_payment_id" and value:
                        value = value[:10] + "..." if len(str(value)) > 10 else value
                    
                    # Format values nicely
                    if value is None:
                        value = "NULL"
                    
                    print(f"  {column_names[i]}: {value}")
        else:
            print("No recent payments found")
        
        # Close the connection
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_recharge_history_table()