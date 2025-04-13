"""
Script to auto-translate all blog posts to all supported languages

This script:
1. Finds all published blog posts with English translations
2. Auto-translates them to all supported languages
3. Marks the translations as auto-translated

Run this script when you need to generate translations for blog content
in all supported languages.
"""

import os
import sys
from datetime import datetime
from flask import Flask
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '.')))

# Import from the backend application
from backend.app import create_app
from backend.app.models import db, Post, PostTranslation, Language
from backend.app.services.translation_service import TranslationService

def auto_translate_all_blog_posts():
    """Auto-translate all blog posts to all supported languages"""
    app = create_app()
    
    with app.app_context():
        print("Starting auto-translation process for all blog posts...")
        
        # Get all active languages
        languages = Language.query.filter_by(is_active=True).all()
        if not languages:
            print("No active languages found. Please add languages first.")
            return
        
        lang_codes = [lang.code for lang in languages]
        print(f"Found {len(languages)} active languages: {', '.join(lang_codes)}")
        
        # Get all published posts
        posts = Post.query.filter_by(status='published').all()
        if not posts:
            print("No published posts found.")
            return
        
        print(f"Found {len(posts)} published posts to translate.")
        
        # Initialize translation service
        translation_service = TranslationService()
        
        # Process each post
        for post in posts:
            print(f"\nProcessing post: {post.slug}")
            
            # Get English translation
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if not english_translation:
                print(f"Skipping post {post.slug} - no English translation available")
                continue
            
            # Data to translate
            english_data = {
                'title': english_translation.title,
                'content': english_translation.content,
                'meta_title': english_translation.meta_title,
                'meta_description': english_translation.meta_description,
                'meta_keywords': english_translation.meta_keywords
            }
            
            # Get all existing translations
            existing_lang_codes = {t.language_code for t in post.translations}
            print(f"  Post has existing translations in: {', '.join(existing_lang_codes)}")
            
            # For each language, translate if needed
            for lang in languages:
                if lang.code == 'en':
                    # Skip English as it's the source language
                    continue
                
                existing_translation = next((t for t in post.translations if t.language_code == lang.code), None)
                
                # Only translate if:
                # 1. No translation exists, or
                # 2. Translation exists but was auto-generated (allow updating)
                if not existing_translation or existing_translation.is_auto_translated:
                    print(f"  Translating to {lang.code}...")
                    
                    try:
                        # Translate the content
                        translated_data = translation_service.translate_post_fields(
                            english_data, 
                            from_lang_code='en', 
                            to_lang_code=lang.code
                        )
                        
                        if translated_data:
                            if existing_translation:
                                # Update existing translation
                                existing_translation.title = translated_data.get('title', existing_translation.title)
                                existing_translation.content = translated_data.get('content', existing_translation.content)
                                existing_translation.meta_title = translated_data.get('meta_title', existing_translation.meta_title)
                                existing_translation.meta_description = translated_data.get('meta_description', existing_translation.meta_description)
                                existing_translation.meta_keywords = translated_data.get('meta_keywords', existing_translation.meta_keywords)
                                existing_translation.is_auto_translated = True
                                existing_translation.updated_at = datetime.utcnow()
                                print(f"    Updated existing {lang.code} translation")
                            else:
                                # Create new translation
                                new_translation = PostTranslation(
                                    post_id=post.id,
                                    language_code=lang.code,
                                    title=translated_data.get('title', ''),
                                    content=translated_data.get('content', ''),
                                    meta_title=translated_data.get('meta_title', ''),
                                    meta_description=translated_data.get('meta_description', ''),
                                    meta_keywords=translated_data.get('meta_keywords', ''),
                                    is_auto_translated=True
                                )
                                db.session.add(new_translation)
                                print(f"    Created new {lang.code} translation")
                        else:
                            print(f"    Translation failed for {lang.code}")
                    except Exception as e:
                        print(f"    Error translating to {lang.code}: {str(e)}")
                else:
                    print(f"  Skipping {lang.code} - manual translation exists")
            
            # Commit changes for this post
            try:
                db.session.commit()
                print(f"✅ Successfully processed translations for post: {post.slug}")
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error saving translations for post {post.slug}: {str(e)}")
        
        print("\nAuto-translation process completed!")

if __name__ == "__main__":
    auto_translate_all_blog_posts()