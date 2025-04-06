"""
Direct script to make a user an admin by directly connecting to the database.
"""

import mysql.connector
import os

# Database connection parameters
db_config = {
    "host": "8.130.113.102",
    "user": "root",
    "password": "Ir%86241992",
    "database": "mat_db"
}

def make_user_admin(username):
    """Make a user an admin directly in the database"""
    try:
        # Connect to the database
        conn = mysql.connector.connect(**db_config)
        cursor = conn.cursor()
        
        # Update the user to be an admin
        update_query = "UPDATE users SET is_admin = 1 WHERE username = %s"
        cursor.execute(update_query, (username,))
        
        # Check if the user was found and updated
        if cursor.rowcount == 0:
            print(f"User {username} not found")
            return False
        
        # Commit the changes
        conn.commit()
        print(f"User {username} is now an admin")
        return True
    
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return False
    
    finally:
        if 'conn' in locals() and conn.is_connected():
            cursor.close()
            conn.close()

if __name__ == "__main__":
    username = "testuser2"
    success = make_user_admin(username)
    print(f"Operation {'successful' if success else 'failed'}")