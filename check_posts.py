"""
Script to check blog posts in the database
"""
import sys
import os
import pymysql

# Direct connection to database to check blog posts
DB_HOST = '8.130.113.102'
DB_USER = 'root'
DB_PASS = 'mysuperstrongpassword'
DB_NAME = 'mat_db'

def check_blog_posts():
    """Check blog posts in the database using direct SQL queries"""
    print(f"Connecting to MySQL database: {DB_USER}@{DB_HOST}/{DB_NAME}")
    
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASS,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Count total posts
            cursor.execute("SELECT COUNT(*) as count FROM cms_posts")
            total_posts = cursor.fetchone()['count']
            
            # Count published posts
            cursor.execute("SELECT COUNT(*) as count FROM cms_posts WHERE status = 'published'")
            published_posts = cursor.fetchone()['count']
            
            # Count draft posts
            cursor.execute("SELECT COUNT(*) as count FROM cms_posts WHERE status = 'draft'")
            draft_posts = cursor.fetchone()['count']
            
            print(f'Total posts: {total_posts}')
            print(f'Published posts: {published_posts}')
            print(f'Draft posts: {draft_posts}')
            print('Post details:')
            
            # Get all posts
            cursor.execute("""
                SELECT p.id, p.slug, p.status, p.featured_image, p.author_id, 
                       p.created_at, p.published_at
                FROM cms_posts p
                ORDER BY p.id
            """)
            posts = cursor.fetchall()
            
            for post in posts:
                post_id = post['id']
                
                # Get translations
                cursor.execute("""
                    SELECT t.language_code, t.title 
                    FROM cms_post_translations t 
                    WHERE t.post_id = %s
                """, (post_id,))
                translations = cursor.fetchall()
                trans_langs = [t['language_code'] for t in translations]
                
                # Get tags
                cursor.execute("""
                    SELECT t.name 
                    FROM cms_tags t 
                    JOIN cms_post_tags pt ON t.id = pt.tag_id 
                    WHERE pt.post_id = %s
                """, (post_id,))
                tags = cursor.fetchall()
                
                print(f'ID: {post_id}, Slug: {post["slug"]}, Status: {post["status"]}, Translation count: {len(translations)}')
                print(f'  Languages: {trans_langs}')
                print(f'  Featured image: {post["featured_image"]}')
                print(f'  Created: {post["created_at"]}, Published: {post["published_at"]}')
                for translation in translations:
                    print(f'  {translation["language_code"]}: {translation["title"]}')
                for tag in tags:
                    print(f'  Tag: {tag["name"]}')
                print()
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        connection.close() if 'connection' in locals() else None

if __name__ == '__main__':
    check_blog_posts()