"""
Script to translate a single blog post to a specific language

Usage:
python translate_single_post.py <post_slug> <language_code>

Example:
python translate_single_post.py product-photography-tips it
"""

import os
import sys
from datetime import datetime
from flask import Flask

# Add backend directory to system path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Import from backend app now that path is set
from app import create_app, db
from app.models.cms import Post, PostTranslation, Language
from app.services.translation_service import translation_service

def translate_single_post(post_slug, target_language_code):
    """Translate a specific blog post to the specified language"""
    app = create_app()
    
    with app.app_context():
        print(f"Starting translation of post '{post_slug}' to {target_language_code}...")
        
        # Check if the target language exists
        target_language = Language.query.filter_by(code=target_language_code).first()
        if not target_language:
            print(f"Error: Language with code '{target_language_code}' not found.")
            return
            
        if not target_language.is_active:
            print(f"Warning: Language '{target_language_code}' is not active in the system.")
        
        # Get the post by slug
        post = Post.query.filter_by(slug=post_slug).first()
        if not post:
            print(f"Error: Post with slug '{post_slug}' not found.")
            return
        
        # Check if translation service is available
        if not translation_service.is_available():
            print("Error: Translation service is not available. Please check DEEPSEEK_API_KEY.")
            return
        
        # Get English translation
        english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
        if not english_translation:
            print(f"Error: No English translation available for post '{post_slug}'.")
            return
        
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
            print(f"Skipping - manual translation exists")
            return
            
        try:
            print(f"Translating content from English to {target_language_code}...")
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
                    print(f"Updated existing {target_language_code} translation")
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
                    print(f"Created new {target_language_code} translation")
                
                # Commit changes
                db.session.commit()
                print(f"✅ Successfully translated post '{post_slug}' to {target_language_code}")
                
                # Display basic translation results
                print("\nTranslation Results:")
                print(f"Original title: {english_data['title']}")
                print(f"Translated title: {translated_data.get('title', '')}")
                print("...")  # Not showing full content for brevity
            else:
                print(f"❌ Translation failed")
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error translating post: {str(e)}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Error: Missing required arguments")
        print("Usage: python translate_single_post.py <post_slug> <language_code>")
        print("Example: python translate_single_post.py product-photography-tips it")
        sys.exit(1)
        
    post_slug = sys.argv[1]
    target_lang = sys.argv[2]
    translate_single_post(post_slug, target_lang)