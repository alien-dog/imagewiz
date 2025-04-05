"""
Migration script to add is_yearly and package_id columns to recharge_history table
"""
from flask import Flask
from sqlalchemy import text
from app import db

def run_migration():
    """
    Add is_yearly and package_id columns to recharge_history table if they don't exist
    Returns whether the migration was run successfully
    """
    print("Running recharge_history table migration to add is_yearly and package_id columns...")
    
    try:
        # Check if is_yearly column exists
        is_yearly_exists = False
        try:
            print("Checking if column exists: is_yearly")
            db.session.execute(text("SELECT is_yearly FROM recharge_history LIMIT 1"))
            is_yearly_exists = True
        except Exception as e:
            print(f"Error checking if column exists: {e}")
            pass
            
        # Check if package_id column exists
        package_id_exists = False
        try:
            print("Checking if column exists: package_id")
            db.session.execute(text("SELECT package_id FROM recharge_history LIMIT 1"))
            package_id_exists = True
        except Exception as e:
            print(f"Error checking if column exists: {e}")
            pass
            
        # Perform migrations for missing columns
        if not is_yearly_exists:
            print("Adding is_yearly column to recharge_history table...")
            db.session.execute(text("ALTER TABLE recharge_history ADD COLUMN is_yearly BOOLEAN DEFAULT false"))
            print("is_yearly column added successfully!")
            
        if not package_id_exists:
            print("Adding package_id column to recharge_history table...")
            db.session.execute(text("ALTER TABLE recharge_history ADD COLUMN package_id VARCHAR(50)"))
            print("package_id column added successfully!")
            
        # Commit the changes if we made any
        if not is_yearly_exists or not package_id_exists:
            db.session.commit()
            print("Migration completed successfully!")
            return True
        else:
            print("No migration needed, all columns already exist.")
            return True
            
    except Exception as e:
        print(f"Migration failed: {e}")
        db.session.rollback()
        return False
        
def check_columns_exist():
    """
    Check if the columns exist in the recharge_history table
    """
    try:
        # Try to check if is_yearly column exists
        is_yearly_exists = False
        try:
            db.session.execute(text("SELECT is_yearly FROM recharge_history LIMIT 1"))
            is_yearly_exists = True
        except Exception:
            pass
            
        # Try to check if package_id column exists
        package_id_exists = False
        try:
            db.session.execute(text("SELECT package_id FROM recharge_history LIMIT 1"))
            package_id_exists = True
        except Exception:
            pass
            
        return {
            "is_yearly_exists": is_yearly_exists,
            "package_id_exists": package_id_exists
        }
    except Exception as e:
        print(f"Error checking columns: {e}")
        return {
            "is_yearly_exists": False,
            "package_id_exists": False,
            "error": str(e)
        }