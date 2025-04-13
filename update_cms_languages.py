"""
Script to update CMS languages to match exactly with the website's supported languages
"""

import os
import sys
from flask import Flask
import json

# Add backend directory to system path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Import from backend app now that path is set
from app import create_app, db
from app.models.cms import Language

def update_cms_languages():
    """Update languages in the database to match website's supported languages"""
    # Create Flask app with proper context
    app = create_app()
    
    with app.app_context():
        print("Starting CMS language update process...")
        
        # The supported languages in our application
        supported_languages = [
            {"code": "en", "name": "English", "nativeName": "English", "flag": "🇬🇧", "active": True, "rtl": False},
            {"code": "fr", "name": "French", "nativeName": "Français", "flag": "🇫🇷", "active": True, "rtl": False},
            {"code": "es", "name": "Spanish", "nativeName": "Español", "flag": "🇪🇸", "active": True, "rtl": False},
            {"code": "de", "name": "German", "nativeName": "Deutsch", "flag": "🇩🇪", "active": True, "rtl": False},
            {"code": "ru", "name": "Russian", "nativeName": "Русский", "flag": "🇷🇺", "active": True, "rtl": False},
            {"code": "pt", "name": "Portuguese", "nativeName": "Português", "flag": "🇵🇹", "active": True, "rtl": False},
            {"code": "ja", "name": "Japanese", "nativeName": "日本語", "flag": "🇯🇵", "active": True, "rtl": False},
            {"code": "ko", "name": "Korean", "nativeName": "한국어", "flag": "🇰🇷", "active": True, "rtl": False},
            {"code": "ar", "name": "Arabic", "nativeName": "العربية", "flag": "🇸🇦", "active": True, "rtl": True},
            {"code": "vi", "name": "Vietnamese", "nativeName": "Tiếng Việt", "flag": "🇻🇳", "active": True, "rtl": False},
            {"code": "th", "name": "Thai", "nativeName": "ไทย", "flag": "🇹🇭", "active": True, "rtl": False},
            {"code": "id", "name": "Indonesian", "nativeName": "Bahasa Indonesia", "flag": "🇮🇩", "active": True, "rtl": False},
            {"code": "ms", "name": "Malaysian", "nativeName": "Bahasa Melayu", "flag": "🇲🇾", "active": True, "rtl": False},
            {"code": "nl", "name": "Dutch", "nativeName": "Nederlands", "flag": "🇳🇱", "active": True, "rtl": False},
            {"code": "sv", "name": "Swedish", "nativeName": "Svenska", "flag": "🇸🇪", "active": True, "rtl": False},
            {"code": "zh-TW", "name": "Traditional Chinese", "nativeName": "繁體中文", "flag": "🇹🇼", "active": True, "rtl": False},
            {"code": "it", "name": "Italian", "nativeName": "Italiano", "flag": "🇮🇹", "active": True, "rtl": False},
            {"code": "tr", "name": "Turkish", "nativeName": "Türkçe", "flag": "🇹🇷", "active": True, "rtl": False},
            {"code": "hu", "name": "Hungarian", "nativeName": "Magyar", "flag": "🇭🇺", "active": True, "rtl": False},
            {"code": "pl", "name": "Polish", "nativeName": "Polski", "flag": "🇵🇱", "active": True, "rtl": False},
        ]
        
        print(f"Processing {len(supported_languages)} supported languages...")
        
        # Track changes
        added = 0
        updated = 0
        unchanged = 0
        
        # Update or create each supported language
        for lang_data in supported_languages:
            code = lang_data["code"]
            
            # Check if language exists
            lang = Language.query.get(code)
            
            if lang:
                # Update existing language
                changed = False
                if lang.name != lang_data["name"]:
                    lang.name = lang_data["name"]
                    changed = True
                
                if lang.native_name != lang_data["nativeName"]:
                    lang.native_name = lang_data["nativeName"]
                    changed = True
                    
                if lang.flag != lang_data["flag"]:
                    lang.flag = lang_data["flag"]
                    changed = True
                    
                if lang.is_rtl != lang_data["rtl"]:
                    lang.is_rtl = lang_data["rtl"]
                    changed = True
                    
                if lang.is_active != lang_data["active"]:
                    lang.is_active = lang_data["active"]
                    changed = True
                
                if changed:
                    print(f"✏️ Updated language: {code} - {lang_data['name']}")
                    updated += 1
                else:
                    print(f"✓ Language already up-to-date: {code} - {lang_data['name']}")
                    unchanged += 1
            else:
                # Create new language
                new_lang = Language(
                    code=code,
                    name=lang_data["name"],
                    native_name=lang_data["nativeName"],
                    flag=lang_data["flag"],
                    is_rtl=lang_data["rtl"],
                    is_active=lang_data["active"]
                )
                db.session.add(new_lang)
                print(f"➕ Added new language: {code} - {lang_data['name']}")
                added += 1
        
        # Commit all changes
        try:
            db.session.commit()
            print("\nLanguage update completed successfully!")
            print(f"Summary:")
            print(f"  Added: {added}")
            print(f"  Updated: {updated}")
            print(f"  Unchanged: {unchanged}")
            print(f"  Total: {added + updated + unchanged}")
        except Exception as e:
            db.session.rollback()
            print(f"Error committing changes: {str(e)}")
            return False
        
        return True

if __name__ == "__main__":
    update_cms_languages()