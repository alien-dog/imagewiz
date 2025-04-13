"""
Script to check which languages have blog post translations
"""

import os
import sys
from flask import Flask

# Add backend directory to system path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Import from backend app now that path is set
from app import create_app, db
from app.models.cms import Post, PostTranslation, Language

def check_blog_translations():
    """Check which languages have blog post translations"""
    # Create Flask app with proper context
    app = create_app()
    
    with app.app_context():
        print("Checking blog post translations...")
        
        # Get all active languages
        languages = Language.query.filter_by(is_active=True).all()
        if not languages:
            print("No active languages found.")
            return
        
        lang_codes = [lang.code for lang in languages]
        print(f"Found {len(languages)} active languages: {', '.join(lang_codes)}")
        
        # Get all published posts
        posts = Post.query.filter_by(status='published').all()
        if not posts:
            print("No published posts found.")
            return
        
        print(f"Found {len(posts)} published posts.")
        
        # Create a table for displaying results
        print("\nTranslation Status:")
        print("=" * 80)
        print(f"{'Post Title':<40} | {'Available Languages':<35}")
        print("-" * 80)
        
        # Check each post for translations
        for post in posts:
            # Get English translation for the title
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            title = english_translation.title if english_translation else f"Post {post.id}"
            
            # Get all translations for this post
            translation_lang_codes = [t.language_code for t in post.translations]
            
            # Find missing translations
            missing_translations = set(lang_codes) - set(translation_lang_codes)
            
            print(f"{title[:37] + '...' if len(title) > 40 else title:<40} | {', '.join(translation_lang_codes):<35}")
        
        print("=" * 80)
        
        # Summary stats
        print("\nSummary Statistics:")
        fully_translated = 0
        partially_translated = 0
        
        for post in posts:
            translation_count = len(post.translations)
            if translation_count == len(languages):
                fully_translated += 1
            elif translation_count > 1:  # At least one translation besides default
                partially_translated += 1
        
        print(f"Total posts: {len(posts)}")
        print(f"Fully translated (all languages): {fully_translated}")
        print(f"Partially translated: {partially_translated}")
        print(f"No translations: {len(posts) - fully_translated - partially_translated}")

if __name__ == "__main__":
    check_blog_translations()