"""
Simple script to check blog posts in the database
"""
from app import create_app, db
from app.models.cms import Post, PostTranslation

app = create_app()

with app.app_context():
    # Check for published posts
    posts = Post.query.filter_by(status='published').all()
    print(f"Found {len(posts)} published posts")
    
    # Print post details
    for post in posts:
        print(f"Post ID: {post.id}")
        print(f"  Slug: {post.slug}")
        print(f"  Status: {post.status}")
        print(f"  Translations: {len(post.translations)}")
        
        # Get English translation
        en_translation = next((t for t in post.translations if t.language_code == 'en'), None)
        if en_translation:
            print(f"  Title (EN): {en_translation.title}")
        else:
            print("  No English translation found")
        
        print()
        
    # Check all translations
    translations = PostTranslation.query.all()
    print(f"Found {len(translations)} total translations")