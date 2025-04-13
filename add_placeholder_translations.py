"""
Script to add placeholder translations for blog posts

This script creates basic placeholder translations for blog posts
for languages that don't have any content yet. This ensures the
blog is accessible in all languages while full translations are being processed.
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

def add_placeholder_translations():
    """Add placeholder translations for missing languages"""
    app = create_app()
    
    with app.app_context():
        print("Adding placeholder translations for blog posts...")
        
        # Get all active languages
        languages = Language.query.filter_by(is_active=True).all()
        if not languages:
            print("No active languages found.")
            return
        
        # Get all published posts
        posts = Post.query.filter_by(status='published').all()
        if not posts:
            print("No published posts found.")
            return
        
        print(f"Found {len(posts)} posts and {len(languages)} languages")
        
        # Track changes
        added = 0
        skipped = 0
        
        # Process each post
        for post in posts:
            # Get English translation for reference
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if not english_translation:
                print(f"Skipping post {post.slug} - no English translation found")
                continue
                
            # Get existing translations
            existing_langs = {t.language_code for t in post.translations}
            
            # For each language that doesn't have a translation
            for language in languages:
                if language.code in existing_langs:
                    # Skip if translation already exists
                    skipped += 1
                    continue
                
                # Create a placeholder translation based on English
                new_translation = PostTranslation(
                    post_id=post.id,
                    language_code=language.code,
                    title=english_translation.title,
                    content=english_translation.content,
                    meta_title=english_translation.meta_title or '',
                    meta_description=english_translation.meta_description or '',
                    meta_keywords=english_translation.meta_keywords or '',
                    is_auto_translated=True
                )
                
                db.session.add(new_translation)
                print(f"Added placeholder translation for {post.slug} in {language.code}")
                added += 1
            
            # Commit changes for this post
            try:
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error saving translations for {post.slug}: {str(e)}")
        
        print("\nPlaceholder translations completed!")
        print(f"Added: {added}")
        print(f"Skipped (already exists): {skipped}")
        print(f"Total: {added + skipped}")

if __name__ == "__main__":
    add_placeholder_translations()