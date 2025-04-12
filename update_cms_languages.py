"""
Script to update CMS languages to match exactly with the website's supported languages
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

# Languages from frontend/src/i18n/i18n.js
WEBSITE_LANGUAGES = [
  { "code": "en", "name": "English", "nativeName": "English", "flag": "🇬🇧", "is_default": True, "is_active": True },
  { "code": "fr", "name": "French", "nativeName": "Français", "flag": "🇫🇷", "is_default": False, "is_active": True },
  { "code": "es", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "is_default": False, "is_active": True },
  { "code": "de", "name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "is_default": False, "is_active": True },
  { "code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "is_default": False, "is_active": True },
  { "code": "pt", "name": "Portuguese", "nativeName": "Português", "flag": "🇵🇹", "is_default": False, "is_active": True },
  { "code": "ja", "name": "Japanese", "nativeName": "日本語", "flag": "🇯🇵", "is_default": False, "is_active": True },
  { "code": "ko", "name": "Korean", "nativeName": "한국어", "flag": "🇰🇷", "is_default": False, "is_active": True },
  { "code": "ar", "name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "is_default": False, "is_active": True },
  { "code": "vi", "name": "Vietnamese", "nativeName": "Tiếng Việt", "flag": "🇻🇳", "is_default": False, "is_active": True },
  { "code": "th", "name": "Thai", "nativeName": "ไทย", "flag": "🇹🇭", "is_default": False, "is_active": True },
  { "code": "id", "name": "Indonesian", "nativeName": "Bahasa Indonesia", "flag": "🇮🇩", "is_default": False, "is_active": True },
  { "code": "ms", "name": "Malaysian", "nativeName": "Bahasa Melayu", "flag": "🇲🇾", "is_default": False, "is_active": True },
  { "code": "nl", "name": "Dutch", "nativeName": "Nederlands", "flag": "🇳🇱", "is_default": False, "is_active": True },
  { "code": "sv", "name": "Swedish", "nativeName": "Svenska", "flag": "🇸🇪", "is_default": False, "is_active": True },
  { "code": "zh-TW", "name": "Traditional Chinese", "nativeName": "繁體中文", "flag": "🇨🇳", "is_default": False, "is_active": True },
  { "code": "it", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "is_default": False, "is_active": True },
  { "code": "tr", "name": "Turkish", "nativeName": "Türkçe", "flag": "🇹🇷", "is_default": False, "is_active": True },
  { "code": "hu", "name": "Hungarian", "nativeName": "Magyar", "flag": "🇭🇺", "is_default": False, "is_active": True },
  { "code": "pl", "name": "Polish", "nativeName": "Polski", "flag": "🇵🇱", "is_default": False, "is_active": True },
  { "code": "no", "name": "Norwegian", "nativeName": "Norsk", "flag": "🇳🇴", "is_default": False, "is_active": True },
  { "code": "el", "name": "Greek", "nativeName": "Ελληνικά", "flag": "🇬🇷", "is_default": False, "is_active": True }
]

def update_cms_languages():
    """Update languages in the database to match website's supported languages"""
    print("Updating CMS languages to match website's supported languages...")
    
    conn = None
    cur = None
    
    try:
        # Connect directly to the database
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
        
        # First get all current languages
        cur.execute("SELECT code, name, is_default, is_active FROM cms_languages")
        rows = cur.fetchall()
        
        all_languages = {row[0]: row for row in rows}
        print(f"Found {len(all_languages)} languages in the database")
        
        # Get list of website language codes
        website_lang_codes = [lang["code"] for lang in WEBSITE_LANGUAGES]
        print(f"Website has {len(website_lang_codes)} supported languages")
        
        # First, deactivate languages that are not in the website's supported languages
        deactivated_count = 0
        for code, lang in all_languages.items():
            if code not in website_lang_codes:
                cur.execute(
                    "UPDATE cms_languages SET is_active = FALSE WHERE code = %s",
                    (code,)
                )
                deactivated_count += 1
                print(f"Deactivated language: {code} - {lang[1]}")
                
        # Now update or add languages from the website
        updated_count = 0
        added_count = 0
        
        for lang_data in WEBSITE_LANGUAGES:
            code = lang_data["code"]
            name = lang_data["name"]
            is_default = lang_data["is_default"]
            is_active = lang_data["is_active"]
            
            if code in all_languages:
                # Update existing language to ensure it's active and has the right name
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
        print(f"Languages updated successfully: {updated_count} updated, {added_count} added, {deactivated_count} deactivated")
        
    except Exception as e:
        print(f"ERROR: {e}")
        if conn:
            conn.rollback()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    update_cms_languages()