"""
Script to check CMS posts in the database
"""
from app import create_app
from app.models.cms import Post, PostTranslation, Tag, Language
from app.models.models import User

app = create_app()

def check_cms_posts():
    """Check CMS posts in the database"""
    with app.app_context():
        # Check total counts
        total_posts = Post.query.count()
        published_posts = Post.query.filter_by(status='published').count()
        print(f"Total posts: {total_posts}")
        print(f"Published posts: {published_posts}")
        
        # List all posts with details
        posts = Post.query.all()
        print("\nListing all posts:")
        for post in posts:
            print(f"ID: {post.id}, Slug: {post.slug}, Status: {post.status}")
            print(f"  Author ID: {post.author_id}, Created: {post.created_at}, Published: {post.published_at}")
            
            # Check translations
            translations = PostTranslation.query.filter_by(post_id=post.id).all()
            print(f"  Translations: {len(translations)}")
            for trans in translations:
                print(f"    Language: {trans.language_code}, Title: {trans.title}")
            
            # Check tags
            print(f"  Tags: {', '.join([tag.name for tag in post.tags])}")
            print("-" * 50)
        
        # Check languages
        languages = Language.query.all()
        print("\nAvailable languages:")
        for lang in languages:
            print(f"Code: {lang.code}, Name: {lang.name}, Default: {lang.is_default}, Active: {lang.is_active}")
        
        # Check tags
        tags = Tag.query.all()
        print("\nAvailable tags:")
        for tag in tags:
            print(f"ID: {tag.id}, Name: {tag.name}, Slug: {tag.slug}")

if __name__ == "__main__":
    check_cms_posts()