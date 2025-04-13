"""
Script to translate all blog posts to a specific language

This script:
1. Finds all published blog posts with English translations
2. Auto-translates them to the specified target language
3. Marks the translations as auto-translated

Usage:
python translate_blog_to_language.py <language_code>

Example:
python translate_blog_to_language.py it  # Translate all posts to Italian
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

def translate_blog_to_language(target_language_code):
    """Translate all blog posts to the specified language"""
    app = create_app()
    
    with app.app_context():
        print(f"Starting translation process for all blog posts to {target_language_code}...")
        
        # Check if the target language exists
        target_language = Language.query.filter_by(code=target_language_code).first()
        if not target_language:
            print(f"Language with code '{target_language_code}' not found. Please add it first.")
            return
            
        if not target_language.is_active:
            print(f"Warning: Language '{target_language_code}' is not active in the system.")
        
        # Get all published posts
        posts = Post.query.filter_by(status='published').all()
        if not posts:
            print("No published posts found.")
            return
        
        print(f"Found {len(posts)} published posts to translate to {target_language_code}.")
        
        # Initialize translation service
        translation_service = TranslationService()
        
        # Count successful and failed translations
        success_count = 0
        skip_count = 0
        error_count = 0
        
        # Process each post
        for post in posts:
            print(f"\nProcessing post: {post.slug}")
            
            # Get English translation
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if not english_translation:
                print(f"Skipping post {post.slug} - no English translation available")
                skip_count += 1
                continue
            
            # Data to translate
            english_data = {
                'title': english_translation.title,
                'content': english_translation.content,
                'meta_title': english_translation.meta_title,
                'meta_description': english_translation.meta_description,
                'meta_keywords': english_translation.meta_keywords
            }
            
            # Check if a translation already exists
            existing_translation = next((t for t in post.translations if t.language_code == target_language_code), None)
            
            # Skip if there's a manual translation
            if existing_translation and not existing_translation.is_auto_translated:
                print(f"  Skipping - manual translation exists")
                skip_count += 1
                continue
                
            try:
                # Translate the content
                translated_data = translation_service.translate_post_fields(
                    english_data, 
                    from_lang_code='en', 
                    to_lang_code=target_language_code
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
                        print(f"  Updated existing {target_language_code} translation")
                    else:
                        # Create new translation
                        new_translation = PostTranslation(
                            post_id=post.id,
                            language_code=target_language_code,
                            title=translated_data.get('title', ''),
                            content=translated_data.get('content', ''),
                            meta_title=translated_data.get('meta_title', ''),
                            meta_description=translated_data.get('meta_description', ''),
                            meta_keywords=translated_data.get('meta_keywords', ''),
                            is_auto_translated=True
                        )
                        db.session.add(new_translation)
                        print(f"  Created new {target_language_code} translation")
                    
                    # Commit changes for this post
                    db.session.commit()
                    print(f"✅ Successfully translated post: {post.slug}")
                    success_count += 1
                else:
                    print(f"  Translation failed")
                    error_count += 1
            except Exception as e:
                db.session.rollback()
                print(f"❌ Error translating post {post.slug}: {str(e)}")
                error_count += 1
        
        print(f"\nTranslation process completed!")
        print(f"Summary:")
        print(f"  Successfully translated: {success_count} posts")
        print(f"  Skipped (manual or missing): {skip_count} posts")
        print(f"  Failed: {error_count} posts")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Error: Missing target language code")
        print("Usage: python translate_blog_to_language.py <language_code>")
        print("Example: python translate_blog_to_language.py it")
        sys.exit(1)
        
    target_lang = sys.argv[1]
    translate_blog_to_language(target_lang)