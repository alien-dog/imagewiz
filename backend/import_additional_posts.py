"""
Script to import additional blog posts into the CMS using the Flask ORM with PostgreSQL
"""
import os
import sys
from datetime import datetime, timedelta

# Add the current directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set environment variable to use PostgreSQL
os.environ['DATABASE_URL'] = os.environ.get('DATABASE_URL') or 'postgresql://postgres:postgres@localhost:5432/postgres'

# Import Flask app and database models
from app import create_app, db
from app.models.cms import Post, PostTranslation, Tag, Language
from app.models.models import User

# Sample blog posts data
ADDITIONAL_POSTS = [
    {
        "slug": "ai-image-editing-workflow",
        "status": "published",
        "featured_image": "/static/uploads/blog/ai-editing-workflow.jpg",
        "tags": ["AI Technology", "Workflow", "Productivity"],
        "translations": {
            "en": {
                "title": "Streamlining Your Image Editing Workflow with AI",
                "content": """
<h1>Streamlining Your Image Editing Workflow with AI</h1>
<p>In the competitive world of digital content creation, efficiency is key. AI-powered image editing tools can drastically reduce your editing time while maintaining or even improving quality. Here's how to integrate AI into your image editing workflow.</p>

<h2>The Traditional Image Editing Bottleneck</h2>
<p>Traditional image editing workflows often involve multiple time-consuming steps:</p>
<ul>
  <li>Manual selection and masking</li>
  <li>Background removal and replacement</li>
  <li>Color correction and enhancement</li>
  <li>Retouching and object removal</li>
  <li>Resizing and format conversion</li>
</ul>

<p>These processes can take hours for even experienced professionals, creating a significant bottleneck in content production.</p>

<h2>The AI-Enhanced Workflow</h2>
<p>Here's how an AI-enhanced workflow transforms this process:</p>

<h3>1. Automated Background Removal</h3>
<p>AI tools can now remove backgrounds in seconds with remarkable accuracy, even with complex subjects like hair or transparent objects. This process alone can save hours of manual masking.</p>

<h3>2. Smart Object Selection</h3>
<p>AI can identify and select specific objects within an image, making it easy to edit or extract just the elements you need without affecting the rest of the image.</p>

<h3>3. Intelligent Retouching</h3>
<p>From skin smoothing to object removal, AI can intelligently retouch images while preserving natural textures and filling in removed areas with contextually appropriate content.</p>

<h3>4. Automated Color Grading</h3>
<p>AI can analyze images and suggest or apply color corrections that enhance the visual appeal while maintaining a natural look.</p>

<h3>5. Batch Processing</h3>
<p>With AI, you can apply consistent edits across hundreds or thousands of images simultaneously, ensuring a cohesive look while saving countless hours.</p>

<h2>Setting Up Your AI Workflow</h2>

<h3>Step 1: Audit Your Current Process</h3>
<p>Identify the most time-consuming aspects of your current workflow to determine where AI can make the biggest impact.</p>

<h3>Step 2: Select the Right AI Tools</h3>
<p>Choose AI tools that integrate well with your existing software and address your specific needs. iMagenWiz offers comprehensive AI image editing capabilities that can be easily incorporated into your workflow.</p>

<h3>Step 3: Create Templates and Presets</h3>
<p>Develop templates and presets for common editing tasks to further streamline your process once AI has handled the heavy lifting.</p>

<h3>Step 4: Implement Batch Processing</h3>
<p>Set up batch processing for recurring tasks to maximize efficiency. Most AI tools allow you to process multiple images using the same parameters.</p>

<h3>Step 5: Review and Refine</h3>
<p>While AI is powerful, a final human review ensures the quality meets your standards. This review process is much faster than doing all the editing manually.</p>

<h2>Real-World Time Savings</h2>
<p>Businesses that implement AI in their image editing workflows report time savings of 70-90% compared to traditional methods. A product photography session that once required 8 hours of post-processing can now be completed in under an hour.</p>

<p>By integrating AI tools into your image editing workflow, you can dramatically increase productivity while maintaining high-quality results, giving you more time to focus on the creative aspects of your work.</p>
                """,
                "meta_title": "Streamlining Your Image Editing Workflow with AI | iMagenWiz",
                "meta_description": "Learn how to integrate AI-powered tools into your image editing workflow to save time, increase productivity, and improve results.",
                "meta_keywords": "AI image editing, workflow optimization, productivity, background removal"
            }
        }
    },
    {
        "slug": "image-processing-for-social-media",
        "status": "published",
        "featured_image": "/static/uploads/blog/social-media-images.jpg",
        "tags": ["Social Media", "Image Optimization", "Marketing"],
        "translations": {
            "en": {
                "title": "Image Processing Best Practices for Social Media Success",
                "content": """
<h1>Image Processing Best Practices for Social Media Success</h1>
<p>Visual content is the driving force behind engagement on social media platforms. Research shows that posts with images receive 2.3 times more engagement than those without. However, not all images perform equally well. The right image processing techniques can significantly boost your social media performance.</p>

<h2>Platform-Specific Image Optimization</h2>
<p>Each social media platform has unique requirements and user expectations:</p>

<h3>Instagram</h3>
<ul>
  <li><strong>Resolution:</strong> 1080 x 1080 pixels for square posts</li>
  <li><strong>Style:</strong> High contrast, vibrant colors perform best</li>
  <li><strong>Background:</strong> Clean, uncluttered backgrounds with subject focus</li>
</ul>

<h3>Facebook</h3>
<ul>
  <li><strong>Resolution:</strong> 1200 x 630 pixels for link shares</li>
  <li><strong>Style:</strong> Bright, clear images with minimal text</li>
  <li><strong>Background:</strong> Contextual backgrounds that tell a story</li>
</ul>

<h3>LinkedIn</h3>
<ul>
  <li><strong>Resolution:</strong> 1200 x 627 pixels for link shares</li>
  <li><strong>Style:</strong> Professional, clean, and informative</li>
  <li><strong>Background:</strong> Subtle, non-distracting backgrounds</li>
</ul>

<h3>Twitter</h3>
<ul>
  <li><strong>Resolution:</strong> 1200 x 675 pixels for image posts</li>
  <li><strong>Style:</strong> High contrast with bold elements</li>
  <li><strong>Background:</strong> Simple backgrounds that work in small formats</li>
</ul>

<h2>Universal Image Processing Techniques</h2>
<p>Regardless of platform, these image processing techniques will improve your social media visuals:</p>

<h3>1. Consistent Color Grading</h3>
<p>Develop a consistent color palette that aligns with your brand and apply it across all your images. This creates visual cohesion and strengthens brand recognition.</p>

<h3>2. Strategic Background Removal</h3>
<p>For product-focused content, removing backgrounds creates a clean, professional look and ensures your subject stands out. This is particularly effective for e-commerce and service showcases.</p>

<h3>3. Proper Image Compression</h3>
<p>Optimize file sizes for faster loading without sacrificing quality. Most platforms compress images automatically, but pre-compressing gives you more control over the final appearance.</p>

<h3>4. Rule of Thirds Composition</h3>
<p>Structure your images using the rule of thirds to create balanced, visually appealing compositions that draw the viewer's eye to key elements.</p>

<h3>5. Text Overlay Optimization</h3>
<p>When adding text to images, ensure high contrast between text and background. Consider adding semi-transparent overlays to improve text readability.</p>

<h2>Automated Image Processing for Consistency</h2>
<p>Maintaining consistency across numerous social media posts can be challenging. AI-powered image processing tools can help by:</p>

<ul>
  <li>Automatically applying your brand's color grading</li>
  <li>Removing backgrounds with one click</li>
  <li>Resizing images for different platforms</li>
  <li>Suggesting optimal crops based on subject matter</li>
  <li>Enhancing image quality consistently</li>
</ul>

<h2>Measuring Image Performance</h2>
<p>Track which images perform best by monitoring:</p>

<ul>
  <li>Engagement rates (likes, comments, shares)</li>
  <li>Click-through rates for linked content</li>
  <li>Audience growth and retention</li>
  <li>Conversion rates for call-to-action posts</li>
</ul>

<p>Use this data to refine your image processing approach and continuously improve your social media visual strategy.</p>

<p>By implementing these image processing best practices, you'll create social media content that not only looks professional but also drives meaningful engagement and helps achieve your marketing objectives.</p>
                """,
                "meta_title": "Image Processing Best Practices for Social Media Success | iMagenWiz",
                "meta_description": "Learn platform-specific image optimization techniques and universal image processing best practices to maximize your social media engagement and impact.",
                "meta_keywords": "social media images, image optimization, image processing, visual content"
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

def get_admin_user():
    """Get admin user for authorship"""
    admin = User.query.filter_by(username="testuser2").first()
    if not admin:
        print("Admin user 'testuser2' not found")
        sys.exit(1)
    return admin

def import_additional_posts():
    """Import additional blog posts to the CMS"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get admin user
            admin = get_admin_user()
            print(f"Using author: {admin.username} (ID: {admin.id})")
            
            # Import each blog post
            imported_count = 0
            skipped_count = 0
            
            # Get count of existing posts to space out publishing dates
            existing_posts_count = Post.query.count()
            base_date = datetime.utcnow() - timedelta(days=existing_posts_count + len(ADDITIONAL_POSTS))
            
            for i, post_data in enumerate(ADDITIONAL_POSTS):
                # Check if post already exists by slug
                existing_post = Post.query.filter_by(slug=post_data["slug"]).first()
                if existing_post:
                    print(f"Post already exists: {post_data['slug']}, skipping")
                    skipped_count += 1
                    continue
                
                # Create tags
                tags = create_tags(post_data["tags"])
                
                # Create post with staggered publish dates
                publish_date = base_date + timedelta(days=existing_posts_count + i)
                post = Post(
                    slug=post_data["slug"],
                    featured_image=post_data["featured_image"],
                    author_id=admin.id,
                    status=post_data["status"],
                    published_at=publish_date
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
                print(f"Added post: {post_data['slug']} (published: {publish_date})")
            
            # Commit all changes
            db.session.commit()
            
            print(f"\nImport complete: {imported_count} posts imported, {skipped_count} skipped")
            
        except Exception as e:
            db.session.rollback()
            print(f"Error importing blog posts: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    import_additional_posts()