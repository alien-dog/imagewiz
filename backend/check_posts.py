"""
Simple script to check blog posts in the database
"""
from app import create_app, db
from app.models.cms import Post

app = create_app()

with app.app_context():
    posts = Post.query.all()
    print(f'Total posts: {len(posts)}')
    for post in posts:
        post_title = post.translations[0].title if post.translations else "No title"
        print(f'  - {post.slug} ({post_title})')