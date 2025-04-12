"""
Script to add all languages to the CMS

This script directly connects to the PostgreSQL database to add or update
language records for the iMagenWiz CMS.
"""
import sys
import os
import logging
import psycopg2
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get database connection info from environment
DB_USER = os.environ.get('PGUSER')
DB_PASSWORD = os.environ.get('PGPASSWORD')
DB_HOST = os.environ.get('PGHOST')
DB_PORT = os.environ.get('PGPORT')
DB_NAME = os.environ.get('PGDATABASE')
DATABASE_URL = os.environ.get('DATABASE_URL')

LANGUAGES = [
    {"code": "en", "name": "English", "is_default": True, "is_active": True},
    {"code": "ar", "name": "Arabic", "is_default": False, "is_active": True},
    {"code": "bg", "name": "Bulgarian", "is_default": False, "is_active": True},
    {"code": "ca", "name": "Catalan", "is_default": False, "is_active": True},
    {"code": "cs", "name": "Czech", "is_default": False, "is_active": True},
    {"code": "da", "name": "Danish", "is_default": False, "is_active": True},
    {"code": "de", "name": "German", "is_default": False, "is_active": True},
    {"code": "el", "name": "Greek", "is_default": False, "is_active": True},
    {"code": "es", "name": "Spanish", "is_default": False, "is_active": True},
    {"code": "fi", "name": "Finnish", "is_default": False, "is_active": True},
    {"code": "fr", "name": "French", "is_default": False, "is_active": True},
    {"code": "he", "name": "Hebrew", "is_default": False, "is_active": True},
    {"code": "hi", "name": "Hindi", "is_default": False, "is_active": True},
    {"code": "hu", "name": "Hungarian", "is_default": False, "is_active": True},
    {"code": "id", "name": "Indonesian", "is_default": False, "is_active": True},
    {"code": "it", "name": "Italian", "is_default": False, "is_active": True},
    {"code": "ja", "name": "Japanese", "is_default": False, "is_active": True},
    {"code": "ko", "name": "Korean", "is_default": False, "is_active": True},
    {"code": "nl", "name": "Dutch", "is_default": False, "is_active": True},
    {"code": "pl", "name": "Polish", "is_default": False, "is_active": True},
    {"code": "pt", "name": "Portuguese", "is_default": False, "is_active": True},
    {"code": "ro", "name": "Romanian", "is_default": False, "is_active": True},
    {"code": "ru", "name": "Russian", "is_default": False, "is_active": True},
    {"code": "sk", "name": "Slovak", "is_default": False, "is_active": True},
    {"code": "sv", "name": "Swedish", "is_default": False, "is_active": True},
    {"code": "th", "name": "Thai", "is_default": False, "is_active": True},
    {"code": "tr", "name": "Turkish", "is_default": False, "is_active": True},
    {"code": "uk", "name": "Ukrainian", "is_default": False, "is_active": True},
    {"code": "vi", "name": "Vietnamese", "is_default": False, "is_active": True},
    {"code": "zh-CN", "name": "Simplified Chinese", "is_default": False, "is_active": True},
    {"code": "zh-TW", "name": "Traditional Chinese", "is_default": False, "is_active": True},
]

def add_languages():
    """Add languages to the database using direct SQL queries"""
    print("Adding languages to the CMS database...")
    
    # Connect directly to the database
    try:
        conn = None
        if DATABASE_URL:
            conn = psycopg2.connect(DATABASE_URL)
            print(f"Connected to database using DATABASE_URL")
        else:
            conn = psycopg2.connect(
                host=DB_HOST,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                port=DB_PORT
            )
            print(f"Connected to database using individual credentials")
        
        # Create a cursor
        cur = conn.cursor()
        
        # First get existing languages
        cur.execute("SELECT code, name, is_default, is_active FROM cms_languages")
        rows = cur.fetchall()
        
        existing_languages = {row[0]: row for row in rows}
        print(f"Found {len(existing_languages)} existing languages: {', '.join(existing_languages.keys())}")
        
        added_count = 0
        updated_count = 0
        
        # Process each language
        for lang_data in LANGUAGES:
            code = lang_data["code"]
            name = lang_data["name"]
            is_default = lang_data["is_default"]
            is_active = lang_data["is_active"]
            
            if code in existing_languages:
                # Update existing language
                cur.execute(
                    "UPDATE cms_languages SET name = %s, is_default = %s, is_active = %s WHERE code = %s",
                    (name, is_default, is_active, code)
                )
                updated_count += 1
                print(f"Updated language: {code} - {name}")
            else:
                # Add new language
                cur.execute(
                    "INSERT INTO cms_languages (code, name, is_default, is_active) VALUES (%s, %s, %s, %s)",
                    (code, name, is_default, is_active)
                )
                added_count += 1
                print(f"Added language: {code} - {name}")
        
        # Commit the transaction
        conn.commit()
        print(f"Languages successfully added/updated: {added_count} added, {updated_count} updated")
        
    except Exception as e:
        print(f"ERROR: {e}")
        if conn:
            conn.rollback()
    finally:
        if conn:
            if cur:
                cur.close()
            conn.close()

if __name__ == "__main__":
    add_languages()