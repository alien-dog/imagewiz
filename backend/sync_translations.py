#!/usr/bin/env python3
"""
Script to synchronize translations from English to other languages without using OpenAI API.
This is a temporary solution when the OpenAI API quota is exceeded.
"""

import os
import sys
from app import create_app, db
from app.models.cms import Post, PostTranslation, Language
from flask import current_app

def sync_translations():
    """
    Sync translations by copying English content to other languages
    and marking them as auto-translated.
    """
    app = create_app()
    with app.app_context():
        print("Starting translation sync without OpenAI API...")
        
        # Get all active languages
        all_languages = Language.query.filter_by(is_active=True).all()
        language_codes = [lang.code for lang in all_languages if lang.code != 'en']
        print(f"Found {len(language_codes)} target languages: {', '.join(language_codes)}")
        
        # Get all posts with English translations
        posts = Post.query.join(PostTranslation).filter(
            PostTranslation.language_code == 'en'
        ).all()
        
        print(f"Found {len(posts)} posts with English content to synchronize")
        
        total_created = 0
        total_updated = 0
        
        # Process each post
        for post in posts:
            # Get English translation
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if not english_translation:
                print(f"Post {post.id} ({post.slug}) has no English content despite filter - skipping")
                continue
                
            # Prepare English translation data
            english_data = {
                'title': english_translation.title,
                'content': english_translation.content,
                'meta_title': english_translation.meta_title,
                'meta_description': english_translation.meta_description,
                'meta_keywords': english_translation.meta_keywords
            }
            
            # For each target language
            for lang_code in language_codes:
                # Check if translation exists
                existing_translation = next((t for t in post.translations if t.language_code == lang_code), None)
                
                if existing_translation:
                    # Update existing translation
                    existing_translation.title = f"[{lang_code.upper()}] {english_data['title']}"
                    existing_translation.content = english_data['content']
                    existing_translation.meta_title = english_data['meta_title']
                    existing_translation.meta_description = english_data['meta_description']
                    existing_translation.meta_keywords = english_data['meta_keywords']
                    existing_translation.is_auto_translated = True
                    total_updated += 1
                    print(f"Updated translation for post {post.id} in {lang_code}")
                else:
                    # Create new translation
                    new_translation = PostTranslation(
                        post_id=post.id,
                        language_code=lang_code,
                        title=f"[{lang_code.upper()}] {english_data['title']}",
                        content=english_data['content'],
                        meta_title=english_data['meta_title'],
                        meta_description=english_data['meta_description'],
                        meta_keywords=english_data['meta_keywords'],
                        is_auto_translated=True
                    )
                    db.session.add(new_translation)
                    total_created += 1
                    print(f"Created new translation for post {post.id} in {lang_code}")
        
        # Commit all changes
        db.session.commit()
        
        print(f"Synchronization complete: {total_created} translations created, {total_updated} translations updated")

if __name__ == "__main__":
    sync_translations()