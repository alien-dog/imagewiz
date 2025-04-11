"""
Script to import blog posts into the CMS using the Flask ORM with PostgreSQL
"""
import os
import sys
from datetime import datetime

# Add the current directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set environment variable to use PostgreSQL
os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/postgres'

# Import Flask app and database models
from app import create_app, db
from app.models.cms import Post, PostTranslation, Tag, Language
from app.models.models import User

# Sample blog posts data
BLOG_POSTS = [
    {
        "slug": "ai-image-processing-guide",
        "status": "published",
        "featured_image": "/static/uploads/blog/ai-background-removal.jpg",
        "tags": ["AI Technology", "Image Processing", "Tutorial"],
        "translations": {
            "en": {
                "title": "The Ultimate Guide to AI Image Processing",
                "content": """
<h1>The Ultimate Guide to AI Image Processing</h1>
<p>In today's digital world, image processing has become increasingly important for various applications, from e-commerce to social media. AI-powered image processing has revolutionized how we edit and enhance images.</p>

<h2>What is AI Image Processing?</h2>
<p>AI image processing uses artificial intelligence algorithms to analyze and modify images automatically. These algorithms can identify objects, remove backgrounds, enhance colors, and much more without manual intervention.</p>

<h2>Key Benefits of AI Image Processing</h2>
<ul>
  <li><strong>Speed</strong>: Process hundreds of images in minutes instead of hours</li>
  <li><strong>Consistency</strong>: Get uniform results across all your images</li>
  <li><strong>Quality</strong>: Achieve professional-grade results without expert skills</li>
  <li><strong>Cost-effective</strong>: Reduce the need for professional photo editing services</li>
</ul>

<h2>Common AI Image Processing Applications</h2>
<h3>Background Removal</h3>
<p>AI can accurately detect and remove backgrounds from images, making it perfect for product photography, portraits, and creating transparent PNG images.</p>

<h3>Image Enhancement</h3>
<p>AI algorithms can automatically adjust brightness, contrast, and colors to make images look more professional and appealing.</p>

<h3>Object Detection and Recognition</h3>
<p>AI can identify objects within images, which is useful for categorizing products, detecting faces, and organizing photo libraries.</p>

<h2>Getting Started with AI Image Processing</h2>
<p>To begin using AI image processing:</p>
<ol>
  <li>Create an account on iMagenWiz</li>
  <li>Upload your image to the platform</li>
  <li>Select the processing option you need</li>
  <li>Download your processed image in seconds</li>
</ol>

<p>With our advanced AI technology, you can transform your images quickly and efficiently, saving time and resources while achieving professional results.</p>
                """,
                "meta_title": "The Ultimate Guide to AI Image Processing | iMagenWiz",
                "meta_description": "Learn everything about AI image processing, from background removal to image enhancement, and how it can revolutionize your digital content.",
                "meta_keywords": "AI image processing, background removal, image enhancement, AI technology"
            }
        }
    },
    {
        "slug": "product-photography-tips",
        "status": "published",
        "featured_image": "/static/uploads/blog/product-photography-tips.jpg",
        "tags": ["Photography", "E-commerce", "Tips & Tricks"],
        "translations": {
            "en": {
                "title": "10 Essential Product Photography Tips for E-commerce Success",
                "content": """
<h1>10 Essential Product Photography Tips for E-commerce Success</h1>
<p>High-quality product photography is crucial for e-commerce success. Studies show that 75% of online shoppers rely on product photos when deciding whether to make a purchase. Here are ten essential tips to improve your product photography and boost sales.</p>

<h2>1. Use Natural Lighting When Possible</h2>
<p>Natural light produces the most accurate colors and reduces harsh shadows. Set up your photography area near a large window with indirect sunlight for best results.</p>

<h2>2. Invest in a Simple White Background</h2>
<p>A clean white background keeps the focus on your product and creates a professional look. It also makes it easier to remove the background later if needed.</p>

<h2>3. Shoot from Multiple Angles</h2>
<p>Provide customers with a complete view of your product by photographing it from multiple angles: front, back, sides, top, and bottom when relevant.</p>

<h2>4. Include Detailed Close-ups</h2>
<p>Capture close-up shots that highlight important details, textures, and features that customers would want to inspect before buying.</p>

<h2>5. Show Scale with Props</h2>
<p>Help customers understand the size of your product by including familiar objects in some photos for scale reference.</p>

<h2>6. Use Consistent Style Across Products</h2>
<p>Maintain consistency in lighting, background, and composition across all product photos to create a cohesive and professional-looking online store.</p>

<h2>7. Optimize Image Size and Format</h2>
<p>Balance image quality with load time by optimizing file sizes. Use JPG for most product photos and PNG for images requiring transparency.</p>

<h2>8. Include Lifestyle Images</h2>
<p>Show your products in use or in context to help customers visualize how they might use or wear the item.</p>

<h2>9. Remove Backgrounds for Versatility</h2>
<p>Use AI background removal tools to create clean product images that can be placed on any background or used in various marketing materials.</p>

<h2>10. Edit for Consistency and Accuracy</h2>
<p>Edit your photos to ensure accurate colors and remove distractions, but avoid over-editing that might misrepresent your product.</p>

<p>By implementing these photography tips, you'll create professional product images that build trust with customers and drive sales for your e-commerce business.</p>
                """,
                "meta_title": "10 Essential Product Photography Tips for E-commerce Success | iMagenWiz",
                "meta_description": "Learn 10 essential product photography tips to create professional product images that build trust and drive sales for your e-commerce business.",
                "meta_keywords": "product photography, e-commerce, photography tips, background removal"
            }
        }
    },
    {
        "slug": "background-removal-applications",
        "status": "published",
        "featured_image": "/static/uploads/blog/background-removal-applications.jpg",
        "tags": ["Background Removal", "Design", "Marketing"],
        "translations": {
            "en": {
                "title": "5 Creative Applications for Background Removal in Marketing",
                "content": """
<h1>5 Creative Applications for Background Removal in Marketing</h1>
<p>Background removal is a powerful technique that can transform ordinary images into versatile marketing assets. Here are five creative ways to use background removal to enhance your marketing efforts.</p>

<h2>1. Create Clean Product Catalogs</h2>
<p>Remove backgrounds from product images to create a clean, consistent look across your entire product catalog. This professional presentation helps customers focus on the products themselves without distracting backgrounds.</p>

<h3>Key Benefits:</h3>
<ul>
  <li>Professional, consistent presentation</li>
  <li>Improved focus on product details</li>
  <li>Easier integration into different marketing materials</li>
</ul>

<h2>2. Design Composite Marketing Images</h2>
<p>Once you've removed backgrounds, you can place products in different settings or create composite images that tell a story. This is particularly useful for social media posts, advertisements, and email marketing campaigns.</p>

<h3>Ideas for Composite Images:</h3>
<ul>
  <li>Place products in aspirational settings</li>
  <li>Create themed seasonal promotional images</li>
  <li>Combine multiple products in lifestyle scenes</li>
</ul>

<h2>3. Develop Transparent PNG Assets</h2>
<p>Background removal allows you to create transparent PNG files that can be overlaid on any background. These versatile assets are essential for web designers, marketers, and social media managers.</p>

<h3>Uses for Transparent PNGs:</h3>
<ul>
  <li>Website hero sections with text overlays</li>
  <li>Social media graphics that work on any background</li>
  <li>Digital ads with integrated product images</li>
</ul>

<h2>4. Create Before and After Demonstrations</h2>
<p>For products that transform or improve something, background removal helps create powerful before and after comparisons that highlight your product's effectiveness.</p>

<h3>Effective for:</h3>
<ul>
  <li>Beauty and skincare products</li>
  <li>Home improvement tools and services</li>
  <li>Fitness programs and equipment</li>
</ul>

<h2>5. Design Clean Social Media Templates</h2>
<p>Background-removed images are perfect for creating templates for social media posts, stories, and ads that maintain brand consistency while allowing for content variation.</p>

<h3>Template Applications:</h3>
<ul>
  <li>Product announcement templates</li>
  <li>Sale and promotion frameworks</li>
  <li>Customer testimonial layouts</li>
</ul>

<p>By implementing these background removal applications in your marketing strategy, you'll create more professional, versatile, and impactful visual content that resonates with your audience and drives engagement.</p>
                """,
                "meta_title": "5 Creative Applications for Background Removal in Marketing | iMagenWiz",
                "meta_description": "Discover five creative ways to use background removal to enhance your marketing materials, from product catalogs to social media templates.",
                "meta_keywords": "background removal, marketing, product photography, transparent PNG"
            }
        }
    }
]

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

def import_blog_posts():
    """Import blog posts to the CMS"""
    app = create_app()
    
    with app.app_context():
        try:
            # Ensure English language exists
            ensure_language_exists("en", "English", True)
            
            # Get admin user
            admin = get_admin_user()
            print(f"Using author: {admin.username} (ID: {admin.id})")
            
            # Import each blog post
            imported_count = 0
            skipped_count = 0
            
            for post_data in BLOG_POSTS:
                # Check if post already exists by slug
                existing_post = Post.query.filter_by(slug=post_data["slug"]).first()
                if existing_post:
                    print(f"Post already exists: {post_data['slug']}, skipping")
                    skipped_count += 1
                    continue
                
                # Create tags
                tags = create_tags(post_data["tags"])
                
                # Create post
                post = Post(
                    slug=post_data["slug"],
                    featured_image=post_data["featured_image"],
                    author_id=admin.id,
                    status=post_data["status"],
                    published_at=datetime.utcnow()
                )
                
                # Add tags
                for tag in tags:
                    post.tags.append(tag)
                
                # Add translations
                for lang_code, translation_data in post_data["translations"].items():
                    # Add translation
                    translation = PostTranslation(
                        language_code=lang_code,
                        title=translation_data["title"],
                        content=translation_data["content"],
                        meta_title=translation_data.get("meta_title", translation_data["title"]),
                        meta_description=translation_data.get("meta_description", ""),
                        meta_keywords=translation_data.get("meta_keywords", "")
                    )
                    post.translations.append(translation)
                
                # Save post
                db.session.add(post)
                imported_count += 1
                print(f"Added post: {post_data['slug']}")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\nImport complete: {imported_count} posts imported, {skipped_count} skipped")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error importing blog posts: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import_blog_posts()