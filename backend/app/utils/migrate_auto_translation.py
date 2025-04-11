"""
Migration script to add auto-translation fields to the PostTranslation model
"""
import logging
import psycopg2
import os
from datetime import datetime

logger = logging.getLogger('flask.app')

def run_migration():
    """
    Adds is_auto_translated and last_updated_at columns to the cms_post_translations table
    """
    try:
        logger.info("Running migration to add auto-translation fields to PostTranslation model")
        
        # Connect directly to the database
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        conn.autocommit = True
        cursor = conn.cursor()
        
        try:
            # Check if columns exist
            cursor.execute("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'cms_post_translations' 
            AND column_name IN ('is_auto_translated', 'last_updated_at');
            """)
            
            existing_columns = [col[0] for col in cursor.fetchall()]
            
            # Add is_auto_translated column if it doesn't exist
            if 'is_auto_translated' not in existing_columns:
                logger.info("Adding is_auto_translated column to cms_post_translations table")
                cursor.execute("ALTER TABLE cms_post_translations ADD COLUMN is_auto_translated BOOLEAN DEFAULT FALSE;")
                logger.info("is_auto_translated column added successfully")
            else:
                logger.info("is_auto_translated column already exists in cms_post_translations table")
            
            # Add last_updated_at column if it doesn't exist
            if 'last_updated_at' not in existing_columns:
                logger.info("Adding last_updated_at column to cms_post_translations table")
                cursor.execute("ALTER TABLE cms_post_translations ADD COLUMN last_updated_at TIMESTAMP DEFAULT NOW();")
                logger.info("last_updated_at column added successfully")
            else:
                logger.info("last_updated_at column already exists in cms_post_translations table")
            
        except Exception as e:
            logger.error(f"Error executing SQL: {str(e)}")
            return False
        finally:
            cursor.close()
            conn.close()
            
        return True
    except Exception as e:
        logger.error(f"Error in migration: {str(e)}")
        return False

if __name__ == "__main__":
    # This allows the script to be run directly for testing
    from app import create_app
    app = create_app()
    with app.app_context():
        run_migration()