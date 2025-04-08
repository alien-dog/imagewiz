"""
Simple script to add a test blog post directly to the database
"""
import os
import sys
import pymysql
from datetime import datetime

# Use environment variables for database connection
DB_HOST = os.environ.get('PGHOST', '8.130.113.102')
DB_USER = os.environ.get('PGUSER', 'root')
DB_PASS = os.environ.get('PGPASSWORD', '')
DB_NAME = os.environ.get('PGDATABASE', 'mat_db')

print(f"Connecting to MySQL: {DB_USER}@{DB_HOST}/{DB_NAME}")

# Connect directly to MySQL
connection = pymysql.connect(
    host=DB_HOST,
    user=DB_USER,
    password=DB_PASS,
    database=DB_NAME,
    charset='utf8mb4',
    cursorclass=pymysql.cursors.DictCursor
)

def add_test_blog_post():
    try:
        with connection.cursor() as cursor:
            # Get admin user
            cursor.execute("SELECT id FROM users WHERE username = 'testuser2' LIMIT 1")
            admin = cursor.fetchone()
            
            if not admin:
                print("Admin user 'testuser2' not found")
                return
                
            author_id = admin['id']
            print(f"Using author ID: {author_id}")
            
            # Ensure English language exists
            cursor.execute("SELECT code FROM cms_languages WHERE code = 'en'")
            if not cursor.fetchone():
                print("Creating English language")
                cursor.execute(
                    "INSERT INTO cms_languages (code, name, is_default, is_active) VALUES (%s, %s, %s, %s)",
                    ('en', 'English', True, True)
                )
                
            # Ensure French language exists
            cursor.execute("SELECT code FROM cms_languages WHERE code = 'fr'")
            if not cursor.fetchone():
                print("Creating French language")
                cursor.execute(
                    "INSERT INTO cms_languages (code, name, is_default, is_active) VALUES (%s, %s, %s, %s)",
                    ('fr', 'French', False, True)
                )
            
            # Check if post already exists
            cursor.execute("SELECT id FROM cms_posts WHERE slug = 'ai-background-removal-guide'")
            if cursor.fetchone():
                print("Post already exists, skipping creation")
                return
                
            # Create post
            now = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
            cursor.execute(
                """
                INSERT INTO cms_posts 
                (slug, featured_image, author_id, status, created_at, updated_at, published_at) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    'ai-background-removal-guide',
                    'https://images.unsplash.com/photo-1563089145-599997674d42?w=600',
                    author_id,
                    'published',
                    now,
                    now,
                    now
                )
            )
            post_id = cursor.lastrowid
            print(f"Created post with ID: {post_id}")
            
            # Create tags
            tags = []
            for tag_name in ["AI Technology", "Background Removal", "Image Editing"]:
                # Check if tag exists
                cursor.execute("SELECT id FROM cms_tags WHERE name = %s", (tag_name,))
                tag = cursor.fetchone()
                
                if not tag:
                    # Create tag
                    slug = tag_name.lower().replace(' ', '-')
                    cursor.execute(
                        "INSERT INTO cms_tags (name, slug) VALUES (%s, %s)",
                        (tag_name, slug)
                    )
                    tag_id = cursor.lastrowid
                    print(f"Created tag: {tag_name} (ID: {tag_id})")
                else:
                    tag_id = tag['id']
                    print(f"Using existing tag: {tag_name} (ID: {tag_id})")
                    
                tags.append(tag_id)
            
            # Add tags to post
            for tag_id in tags:
                cursor.execute(
                    "INSERT INTO cms_post_tags (post_id, tag_id) VALUES (%s, %s)",
                    (post_id, tag_id)
                )
                
            # Add English translation
            cursor.execute(
                """
                INSERT INTO cms_post_translations 
                (post_id, language_code, title, content, meta_title, meta_description, meta_keywords) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    post_id,
                    'en',
                    'Complete Guide to AI Background Removal',
                    """
<h1>Complete Guide to AI Background Removal</h1>
<p>Learn how to efficiently remove backgrounds from your images using our advanced AI technology.</p>

<h2>Why Background Removal Matters</h2>
<p>Professional-looking images with clean backgrounds can significantly improve your marketing materials, e-commerce listings, and social media presence. Our AI-powered background removal tool makes this process quick and simple.</p>

<h2>Step-by-Step Guide</h2>
<ol>
  <li><strong>Upload your image</strong> - Simply drag and drop your image onto our upload area or click to browse your files.</li>
  <li><strong>Let our AI do the work</strong> - Our advanced AI will automatically detect the subject and remove the background.</li>
  <li><strong>Download your result</strong> - Download your image with the background removed as a PNG with transparency.</li>
</ol>

<h2>Tips for Best Results</h2>
<ul>
  <li>Use images with good contrast between subject and background</li>
  <li>Ensure proper lighting in your original photo</li>
  <li>For complex subjects, try our HD processing option</li>
</ul>

<h2>Applications for Background-Free Images</h2>
<p>Background-free images can be used for:</p>
<ul>
  <li>E-commerce product listings</li>
  <li>Marketing materials and advertisements</li>
  <li>Social media content</li>
  <li>Digital design and compositing</li>
  <li>Professional portfolios</li>
</ul>

<p>Start using our AI background removal tool today and transform your images in seconds!</p>
                    """,
                    'Complete Guide to AI Background Removal | iMagenWiz',
                    'Learn how to efficiently remove backgrounds from your images using advanced AI technology.',
                    'background removal, AI, image editing, transparent background, e-commerce'
                )
            )
            print("Added English translation")
            
            # Add French translation
            cursor.execute(
                """
                INSERT INTO cms_post_translations 
                (post_id, language_code, title, content, meta_title, meta_description, meta_keywords) 
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    post_id,
                    'fr',
                    'Guide Complet pour la Suppression d\'Arrière-plan avec IA',
                    """
<h1>Guide Complet pour la Suppression d'Arrière-plan avec IA</h1>
<p>Apprenez à supprimer efficacement les arrière-plans de vos images grâce à notre technologie d'IA avancée.</p>

<h2>Pourquoi la Suppression d'Arrière-plan est Importante</h2>
<p>Des images d'aspect professionnel avec des arrière-plans propres peuvent considérablement améliorer vos supports marketing, vos annonces e-commerce et votre présence sur les réseaux sociaux. Notre outil de suppression d'arrière-plan alimenté par l'IA rend ce processus rapide et simple.</p>

<h2>Guide Étape par Étape</h2>
<ol>
  <li><strong>Téléchargez votre image</strong> - Glissez-déposez simplement votre image sur notre zone de téléchargement ou cliquez pour parcourir vos fichiers.</li>
  <li><strong>Laissez notre IA faire le travail</strong> - Notre IA avancée détectera automatiquement le sujet et supprimera l'arrière-plan.</li>
  <li><strong>Téléchargez votre résultat</strong> - Téléchargez votre image avec l'arrière-plan supprimé au format PNG avec transparence.</li>
</ol>

<h2>Conseils pour de Meilleurs Résultats</h2>
<ul>
  <li>Utilisez des images avec un bon contraste entre le sujet et l'arrière-plan</li>
  <li>Assurez un éclairage approprié dans votre photo originale</li>
  <li>Pour les sujets complexes, essayez notre option de traitement HD</li>
</ul>

<h2>Applications pour les Images sans Arrière-plan</h2>
<p>Les images sans arrière-plan peuvent être utilisées pour :</p>
<ul>
  <li>Annonces de produits e-commerce</li>
  <li>Matériels marketing et publicités</li>
  <li>Contenu pour réseaux sociaux</li>
  <li>Conception numérique et compositing</li>
  <li>Portfolios professionnels</li>
</ul>

<p>Commencez à utiliser notre outil de suppression d'arrière-plan IA dès aujourd'hui et transformez vos images en quelques secondes !</p>
                    """,
                    'Guide Complet pour la Suppression d\'Arrière-plan avec IA | iMagenWiz',
                    'Apprenez à supprimer efficacement les arrière-plans de vos images grâce à notre technologie d\'IA avancée.',
                    'suppression d\'arrière-plan, IA, édition d\'image, arrière-plan transparent, e-commerce'
                )
            )
            print("Added French translation")
            
            # Commit the changes
            connection.commit()
            print("Successfully created blog post")
            
    except Exception as e:
        connection.rollback()
        print(f"Error: {e}")
    finally:
        connection.close()

if __name__ == "__main__":
    add_test_blog_post()