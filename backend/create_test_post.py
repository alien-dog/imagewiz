"""
Script to create a test blog post with the correct database settings
"""
import os
import pymysql
from datetime import datetime

def create_test_post():
    """Create a test blog post with a direct database connection"""
    # Database settings from the logs
    db_host = os.environ.get('DB_HOST', '8.130.113.102')
    db_user = os.environ.get('DB_USER', 'root')
    db_password = os.environ.get('DB_PASSWORD', '')
    db_name = os.environ.get('DB_NAME', 'mat_db')
    
    print(f"Connecting to MySQL: {db_user}@{db_host}/{db_name}")
    
    try:
        # Connect to the database
        connection = pymysql.connect(
            host=db_host,
            user=db_user,
            password=db_password,
            database=db_name,
            charset='utf8mb4',
            cursorclass=pymysql.cursors.DictCursor
        )
        
        with connection.cursor() as cursor:
            # Check if admin user exists
            cursor.execute("SELECT id FROM users WHERE username = %s", ("testuser2",))
            user = cursor.fetchone()
            
            if not user:
                print("Admin user 'testuser2' not found. Using the first user in the database.")
                cursor.execute("SELECT id FROM users LIMIT 1")
                user = cursor.fetchone()
                
            if not user:
                print("No users found in the database. Cannot create a post without an author.")
                return False
                
            author_id = user['id']
            print(f"Using author ID: {author_id}")
            
            # Check if default language exists
            cursor.execute("SELECT code FROM cms_languages WHERE is_default = 1")
            default_language = cursor.fetchone()
            
            if not default_language:
                print("No default language found. Adding English as default.")
                cursor.execute(
                    "INSERT INTO cms_languages (code, name, is_default, is_active) VALUES (%s, %s, %s, %s)",
                    ("en", "English", 1, 1)
                )
                connection.commit()
                default_language = {"code": "en"}
            
            language_code = default_language['code']
            print(f"Using language code: {language_code}")
            
            # Check if the post already exists
            cursor.execute("SELECT id FROM cms_posts WHERE slug = %s", ("welcome-to-imagenwiz",))
            existing_post = cursor.fetchone()
            
            if existing_post:
                print(f"Post with slug 'welcome-to-imagenwiz' already exists with ID: {existing_post['id']}")
                post_id = existing_post['id']
                
                # Update the post status to published
                cursor.execute(
                    "UPDATE cms_posts SET status = %s, published_at = %s WHERE id = %s",
                    ("published", datetime.utcnow(), post_id)
                )
                connection.commit()
                
                # Check if translation exists
                cursor.execute(
                    "SELECT id FROM cms_post_translations WHERE post_id = %s AND language_code = %s",
                    (post_id, language_code)
                )
                existing_translation = cursor.fetchone()
                
                if existing_translation:
                    print(f"Translation for post already exists. Updating content.")
                    cursor.execute(
                        """UPDATE cms_post_translations 
                           SET title = %s, content = %s, meta_title = %s, meta_description = %s 
                           WHERE post_id = %s AND language_code = %s""",
                        (
                            "Welcome to iMagenWiz - Your AI Image Processing Platform",
                            "<h1>Welcome to iMagenWiz!</h1><p>We're excited to introduce you to our advanced AI-powered image processing platform. Whether you're a designer, marketer, or business owner, our tools can help you create stunning visuals with just a few clicks.</p><h2>What We Offer</h2><p>Our platform provides intelligent visual manipulation and enhancement tools, with a focus on intuitive user experience and cutting-edge image transformation technologies.</p><h3>Key Features</h3><ul><li>Background removal with precision AI</li><li>Image enhancement and optimization</li><li>Creative filters and effects</li><li>Batch processing capabilities</li></ul><p>Stay tuned for more updates and tutorials on how to make the most of our services!</p>",
                            "Welcome to iMagenWiz - AI Image Processing Platform",
                            "Discover how iMagenWiz's AI-powered tools can transform your image processing workflow with intelligent automation and cutting-edge technology.",
                            post_id,
                            language_code
                        )
                    )
                else:
                    print(f"Creating new translation for existing post.")
                    cursor.execute(
                        """INSERT INTO cms_post_translations 
                           (post_id, language_code, title, content, meta_title, meta_description) 
                           VALUES (%s, %s, %s, %s, %s, %s)""",
                        (
                            post_id,
                            language_code,
                            "Welcome to iMagenWiz - Your AI Image Processing Platform",
                            "<h1>Welcome to iMagenWiz!</h1><p>We're excited to introduce you to our advanced AI-powered image processing platform. Whether you're a designer, marketer, or business owner, our tools can help you create stunning visuals with just a few clicks.</p><h2>What We Offer</h2><p>Our platform provides intelligent visual manipulation and enhancement tools, with a focus on intuitive user experience and cutting-edge image transformation technologies.</p><h3>Key Features</h3><ul><li>Background removal with precision AI</li><li>Image enhancement and optimization</li><li>Creative filters and effects</li><li>Batch processing capabilities</li></ul><p>Stay tuned for more updates and tutorials on how to make the most of our services!</p>",
                            "Welcome to iMagenWiz - AI Image Processing Platform",
                            "Discover how iMagenWiz's AI-powered tools can transform your image processing workflow with intelligent automation and cutting-edge technology."
                        )
                    )
                
                connection.commit()
            else:
                # Create a new post
                print("Creating new post...")
                now = datetime.utcnow()
                cursor.execute(
                    """INSERT INTO cms_posts 
                       (slug, featured_image, author_id, status, created_at, updated_at, published_at) 
                       VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                    (
                        "welcome-to-imagenwiz",
                        None,
                        author_id,
                        "published",
                        now,
                        now,
                        now
                    )
                )
                post_id = cursor.lastrowid
                print(f"Created new post with ID: {post_id}")
                
                # Create translation
                cursor.execute(
                    """INSERT INTO cms_post_translations 
                       (post_id, language_code, title, content, meta_title, meta_description) 
                       VALUES (%s, %s, %s, %s, %s, %s)""",
                    (
                        post_id,
                        language_code,
                        "Welcome to iMagenWiz - Your AI Image Processing Platform",
                        "<h1>Welcome to iMagenWiz!</h1><p>We're excited to introduce you to our advanced AI-powered image processing platform. Whether you're a designer, marketer, or business owner, our tools can help you create stunning visuals with just a few clicks.</p><h2>What We Offer</h2><p>Our platform provides intelligent visual manipulation and enhancement tools, with a focus on intuitive user experience and cutting-edge image transformation technologies.</p><h3>Key Features</h3><ul><li>Background removal with precision AI</li><li>Image enhancement and optimization</li><li>Creative filters and effects</li><li>Batch processing capabilities</li></ul><p>Stay tuned for more updates and tutorials on how to make the most of our services!</p>",
                        "Welcome to iMagenWiz - AI Image Processing Platform",
                        "Discover how iMagenWiz's AI-powered tools can transform your image processing workflow with intelligent automation and cutting-edge technology."
                    )
                )
                
                connection.commit()
                print("Post created successfully!")
                
                # Create a tag for the post if it doesn't exist
                cursor.execute("SELECT id FROM cms_tags WHERE slug = %s", ("getting-started",))
                tag = cursor.fetchone()
                
                if not tag:
                    print("Creating 'Getting Started' tag...")
                    cursor.execute(
                        "INSERT INTO cms_tags (name, slug) VALUES (%s, %s)",
                        ("Getting Started", "getting-started")
                    )
                    tag_id = cursor.lastrowid
                else:
                    tag_id = tag['id']
                
                # Add tag to post
                cursor.execute(
                    "INSERT INTO cms_post_tags (post_id, tag_id) VALUES (%s, %s)",
                    (post_id, tag_id)
                )
                
                connection.commit()
                print(f"Added tag to post.")
            
            return True
            
    except Exception as e:
        print(f"Error creating test post: {e}")
        return False
    finally:
        if 'connection' in locals() and connection:
            connection.close()

if __name__ == "__main__":
    create_test_post()