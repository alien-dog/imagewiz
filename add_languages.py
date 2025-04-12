"""
Script to add all languages to the CMS
"""
import sys
import os
import logging
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

sys.path.insert(0, os.getcwd())

from backend.app import create_app
from backend.app.models.cms import Language
from backend.app import db

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
    """Add languages to the database"""
    app = create_app()
    with app.app_context():
        print("Adding languages to the CMS database...")
        
        existing_languages = {lang.code: lang for lang in Language.query.all()}
        print(f"Found {len(existing_languages)} existing languages: {', '.join(existing_languages.keys())}")
        
        added_count = 0
        updated_count = 0
        
        for lang_data in LANGUAGES:
            code = lang_data["code"]
            if code in existing_languages:
                # Update existing language
                lang = existing_languages[code]
                lang.name = lang_data["name"]
                lang.is_default = lang_data["is_default"]
                lang.is_active = lang_data["is_active"]
                updated_count += 1
                print(f"Updated language: {code} - {lang_data['name']}")
            else:
                # Add new language
                lang = Language(
                    code=code,
                    name=lang_data["name"],
                    is_default=lang_data["is_default"],
                    is_active=lang_data["is_active"]
                )
                db.session.add(lang)
                added_count += 1
                print(f"Added language: {code} - {lang_data['name']}")
        
        db.session.commit()
        print(f"Languages successfully added/updated: {added_count} added, {updated_count} updated")

if __name__ == "__main__":
    add_languages()