"""
Script to seed the CMS database with blog posts
"""
from app import create_app
from app.cms.seed import seed_cms

if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_cms()