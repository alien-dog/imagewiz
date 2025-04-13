"""
Simple script to list all blog posts
"""

import os
import sys

# Add backend directory to system path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

# Import from backend app now that path is set
from app import create_app, db
from app.models.cms import Post

def list_posts():
    """List all blog posts with their slugs and available translations"""
    app = create_app()
    
    with app.app_context():
        posts = Post.query.all()
        
        print(f"Found {len(posts)} blog posts:")
        print("=" * 80)
        
        for post in posts:
            # Get English title if available
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            title = english_translation.title if english_translation else "No English title"
            
            # Get available translations
            translation_langs = [t.language_code for t in post.translations]
            
            print(f"Slug: {post.slug}")
            print(f"Title: {title}")
            print(f"Languages: {', '.join(translation_langs)}")
            print("-" * 80)

if __name__ == "__main__":
    list_posts()