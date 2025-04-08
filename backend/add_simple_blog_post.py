"""
Simple script to add a blog post directly using Flask ORM
"""
import os
import sys
from datetime import datetime
import pymysql

# Set the remote database connection info
print("Connecting to MySQL: root@8.130.113.102/mat_db")
os.environ['DATABASE_URL'] = 'mysql+pymysql://root@8.130.113.102/mat_db'

from app import create_app, db
from app.models.cms import Post, PostTranslation, Tag, Language
from app.models.models import User

app = create_app()

def create_tags(tag_names):
    """Create tags if they don't exist and return a list of tag objects"""
    tags = []
    for tag_name in tag_names:
        # Check if tag exists
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            # Generate slug from name
            slug = tag_name.lower().replace(' ', '-')
            # Create tag
            tag = Tag(name=tag_name, slug=slug)
            db.session.add(tag)
            print(f"Created tag: {tag_name}")
        tags.append(tag)
    return tags

def ensure_language_exists(code, name, is_default=False):
    """Ensure language exists"""
    language = Language.query.filter_by(code=code).first()
    if not language:
        language = Language(code=code, name=name, is_default=is_default, is_active=True)
        db.session.add(language)
        print(f"Created language: {name} ({code})")
    return language

def get_admin_user():
    """Get admin user for authorship"""
    admin = User.query.filter_by(username="testuser2").first()
    if not admin:
        print("Admin user 'testuser2' not found")
        sys.exit(1)
    return admin

def add_blog_post():
    """Add a sample blog post"""
    with app.app_context():
        try:
            # Ensure languages exist
            ensure_language_exists("en", "English", True)
            ensure_language_exists("fr", "French", False)
            
            # Get admin user
            admin = get_admin_user()
            print(f"Using author: {admin.username} (ID: {admin.id})")
            
            # Create tags
            tags = create_tags(["AI Technology", "Background Removal", "Tutorial"])
            
            # Check if post already exists
            existing_post = Post.query.filter_by(slug="quick-guide-background-removal").first()
            if existing_post:
                print("Post already exists, skipping")
                return
            
            # Create post
            post = Post(
                slug="quick-guide-background-removal",
                featured_image="https://images.unsplash.com/photo-1563089145-599997674d42?w=600",
                author_id=admin.id,
                status="published",
                published_at=datetime.utcnow()
            )
            
            # Add tags
            for tag in tags:
                post.tags.append(tag)
            
            # Add English translation
            en_translation = PostTranslation(
                language_code="en",
                title="Quick Guide to Background Removal",
                content="""
<h1>Quick Guide to Background Removal</h1>
<p>Learn how to quickly remove backgrounds from your images using AI technology.</p>
<h2>Steps to Remove Backgrounds</h2>
<ol>
  <li>Upload your image</li>
  <li>Let our AI process it</li>
  <li>Download the result</li>
</ol>
<p>It's that simple!</p>
                """,
                meta_title="Quick Guide to Background Removal | iMagenWiz",
                meta_description="Learn how to quickly remove backgrounds from your images using AI technology.",
                meta_keywords="background removal, AI, quick guide, image editing"
            )
            post.translations.append(en_translation)
            
            # Add French translation
            fr_translation = PostTranslation(
                language_code="fr",
                title="Guide Rapide pour la Suppression d'Arrière-plan",
                content="""
<h1>Guide Rapide pour la Suppression d'Arrière-plan</h1>
<p>Apprenez comment supprimer rapidement les arrière-plans de vos images en utilisant la technologie IA.</p>
<h2>Étapes pour Supprimer les Arrière-plans</h2>
<ol>
  <li>Téléchargez votre image</li>
  <li>Laissez notre IA la traiter</li>
  <li>Téléchargez le résultat</li>
</ol>
<p>C'est aussi simple que ça!</p>
                """,
                meta_title="Guide Rapide pour la Suppression d'Arrière-plan | iMagenWiz",
                meta_description="Apprenez comment supprimer rapidement les arrière-plans de vos images en utilisant la technologie IA.",
                meta_keywords="suppression d'arrière-plan, IA, guide rapide, édition d'image"
            )
            post.translations.append(fr_translation)
            
            # Save post
            db.session.add(post)
            db.session.commit()
            
            print(f"Successfully created blog post: {post.id}")
        except Exception as e:
            db.session.rollback()
            print(f"Error adding blog post: {e}")

if __name__ == "__main__":
    add_blog_post()