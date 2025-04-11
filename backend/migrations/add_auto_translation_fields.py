"""
Migration script to add auto-translation fields to the PostTranslation model
"""
import logging
from sqlalchemy import Column, Boolean, DateTime
from datetime import datetime
from flask import current_app
from app import db

logger = logging.getLogger('flask.app')

def run_migration():
    """
    Adds is_auto_translated and last_updated_at columns to the cms_post_translations table
    """
    try:
        logger.info("Running migration to add auto-translation fields to PostTranslation model")
        
        # Check if is_auto_translated column exists
        exists = False
        try:
            with db.engine.connect() as conn:
                conn.execute("SELECT is_auto_translated FROM cms_post_translations LIMIT 1")
                exists = True
        except Exception:
            exists = False
            
        if exists:
            logger.info("is_auto_translated column already exists in cms_post_translations table")
        else:
            logger.info("Adding is_auto_translated column to cms_post_translations table")
            with db.engine.connect() as conn:
                conn.execute("ALTER TABLE cms_post_translations ADD COLUMN is_auto_translated BOOLEAN DEFAULT FALSE")
            logger.info("is_auto_translated column added successfully")
        
        # Check if last_updated_at column exists
        exists = False
        try:
            with db.engine.connect() as conn:
                conn.execute("SELECT last_updated_at FROM cms_post_translations LIMIT 1")
                exists = True
        except Exception:
            exists = False
            
        if exists:
            logger.info("last_updated_at column already exists in cms_post_translations table")
        else:
            logger.info("Adding last_updated_at column to cms_post_translations table")
            with db.engine.connect() as conn:
                # Add column with default value of current timestamp
                conn.execute("ALTER TABLE cms_post_translations ADD COLUMN last_updated_at TIMESTAMP DEFAULT NOW()")
            logger.info("last_updated_at column added successfully")
            
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