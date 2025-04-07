"""
Script to seed the database with supported languages
"""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.cms import Language
from sqlalchemy import text

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    print("DATABASE_URL environment variable not set")
    sys.exit(1)

engine = create_engine(DATABASE_URL)
Session = sessionmaker(bind=engine)
session = Session()

def seed_languages():
    """Seed languages into the database"""
    # Define languages to add
    languages = [
        {"code": "en", "name": "English", "is_default": True, "is_active": True},
        {"code": "fr", "name": "Français", "is_default": False, "is_active": True},
        {"code": "es", "name": "Español", "is_default": False, "is_active": True},
        {"code": "de", "name": "Deutsch", "is_default": False, "is_active": True},
        {"code": "ru", "name": "Русский", "is_default": False, "is_active": True},
        {"code": "pt", "name": "Português", "is_default": False, "is_active": True},
        {"code": "ja", "name": "日本語", "is_default": False, "is_active": True},
        {"code": "ko", "name": "한국어", "is_default": False, "is_active": True},
        {"code": "ar", "name": "العربية", "is_default": False, "is_active": True},
        {"code": "vi", "name": "Tiếng Việt", "is_default": False, "is_active": True},
        {"code": "th", "name": "ไทย", "is_default": False, "is_active": True},
        {"code": "id", "name": "Bahasa Indonesia", "is_default": False, "is_active": True},
        {"code": "ms", "name": "Bahasa Melayu", "is_default": False, "is_active": True},
        {"code": "nl", "name": "Nederlands", "is_default": False, "is_active": True},
        {"code": "sv", "name": "Svenska", "is_default": False, "is_active": True},
        {"code": "zh-TW", "name": "繁體中文", "is_default": False, "is_active": True},
    ]

    # Add languages to database if they don't exist
    for lang_data in languages:
        existing_lang = session.query(Language).filter_by(code=lang_data["code"]).first()
        
        if not existing_lang:
            new_lang = Language(
                code=lang_data["code"],
                name=lang_data["name"],
                is_default=lang_data["is_default"],
                is_active=lang_data["is_active"]
            )
            session.add(new_lang)
            print(f"Added language: {lang_data['name']} ({lang_data['code']})")
        else:
            print(f"Language already exists: {existing_lang.name} ({existing_lang.code})")
            # Update default status if needed
            if lang_data["is_default"] and not existing_lang.is_default:
                # Reset all default flags
                session.execute(text("UPDATE cms_languages SET is_default = FALSE"))
                existing_lang.is_default = True
                print(f"Set {existing_lang.name} as default language")

    # Commit changes
    session.commit()
    print("Language seeding completed successfully")

if __name__ == "__main__":
    seed_languages()