"""
Script to seed the CMS with blog posts
"""
import sys
import os
from datetime import datetime
from flask import current_app
from app import db
from app.models.cms import Post, PostTranslation, Tag, Language
from app.models.models import User

# Blog post content
blog_post_data = [
    {
        "slug": "ai-background-removal-guide",
        "title": "The Ultimate Guide to AI-Powered Background Removal: Save Time & Improve Quality",
        "content": """
<h2>Why AI-Powered Background Removal is Revolutionizing Image Editing</h2>

<p>Background removal is one of the most common and time-consuming tasks in image editing. Traditional methods require careful selection, masking, and refinement - often taking minutes per image even for professionals. AI-powered background removal tools like iMagenWiz are changing this reality by delivering professional results in seconds.</p>

<h3>How AI Background Removal Works</h3>

<p>Unlike traditional methods that rely on contrast detection or manual selection, AI background removal uses deep learning models trained on millions of images to understand the visual elements that constitute foreground subjects versus backgrounds. This allows the algorithm to:</p>

<ul>
  <li>Identify complex edges and fine details like hair and transparent objects</li>
  <li>Understand subject context even with challenging backgrounds</li>
  <li>Make intelligent decisions about what should be preserved</li>
  <li>Process images consistently across large batches</li>
</ul>

<h3>Key Benefits for Professionals</h3>

<p>For designers, photographers, e-commerce managers, and marketers, AI background removal offers several advantages:</p>

<ol>
  <li><strong>Time Efficiency:</strong> Process hundreds of images in the time it would take to manually edit just a few</li>
  <li><strong>Consistent Results:</strong> Maintain visual consistency across product catalogs or marketing campaigns</li>
  <li><strong>Reduced Technical Barriers:</strong> Achieve professional results without extensive Photoshop expertise</li>
  <li><strong>Workflow Integration:</strong> Easily incorporate into existing production processes</li>
</ol>

<h3>When to Use AI Background Removal</h3>

<p>While AI background removal excels in many scenarios, it's particularly valuable for:</p>

<ul>
  <li>E-commerce product photography</li>
  <li>Social media marketing content</li>
  <li>Real estate virtual staging</li>
  <li>Portrait enhancement</li>
  <li>Digital catalog creation</li>
</ul>

<h3>Best Practices for Optimal Results</h3>

<p>To get the most from AI background removal tools:</p>

<ol>
  <li>Use well-lit images with reasonable contrast between subject and background</li>
  <li>For complex subjects, higher resolution inputs generally yield better results</li>
  <li>Review results for fine details that might need manual touchups</li>
  <li>Consider your output background - transparent, solid color, or contextual replacement</li>
</ol>

<p>iMagenWiz provides advanced controls to fine-tune these settings for your specific needs.</p>

<h3>The Future of Image Editing</h3>

<p>As AI continues to evolve, we can expect even more impressive capabilities in automated image editing. Background removal is just the beginning - object replacement, style transfer, and intelligent composition tools are all becoming reality through the same underlying technologies.</p>

<p>Start exploring how AI-powered background removal can transform your creative workflow today.</p>
""",
        "meta_title": "AI Background Removal Guide: Save Time & Improve Quality | iMagenWiz",
        "meta_description": "Learn how AI-powered background removal works, best practices for optimal results, and how it can transform your creative workflow. Expert tips from iMagenWiz.",
        "meta_keywords": "AI background removal, image editing, background eraser, transparent background, product photography",
        "tags": ["AI Technology", "Background Removal", "Design Tools", "Photography"]
    },
    {
        "slug": "product-photography-background-removal",
        "title": "Transform Your E-commerce Product Photos with Professional Background Removal",
        "content": """
<h2>Why Background Removal is Critical for E-commerce Success</h2>

<p>In the competitive world of online retail, product presentation can make or break your conversion rates. Studies show that consistent, professional product imagery can increase sales by up to 30%. Background removal is the foundation of professional e-commerce photography.</p>

<h3>The E-commerce Background Standard</h3>

<p>Major marketplaces and platforms have specific requirements for product images:</p>

<ul>
  <li>Amazon requires pure white backgrounds (RGB 255,255,255) for main product images</li>
  <li>Etsy and Shopify stores benefit from consistent background styles</li>
  <li>Fashion retailers often use transparent backgrounds for layering and consistency</li>
  <li>Comparison sites need standardized imagery for fair product presentation</li>
</ul>

<p>Meeting these standards traditionally required professional photography studios or extensive Photoshop work. AI tools have democratized this process.</p>

<p>With iMagenWiz, you can easily extract products and place them on any background of your choice.</p>
""",
        "meta_title": "E-commerce Product Photo Background Removal Guide | iMagenWiz",
        "meta_description": "Boost your e-commerce sales with professional product photography. Learn background removal techniques, creative alternatives, and batch processing for large catalogs.",
        "meta_keywords": "product photography, e-commerce images, white background removal, Amazon product images, Shopify photography",
        "tags": ["E-commerce", "Product Photography", "Background Removal", "Marketing"]
    },
    {
        "slug": "portrait-background-replacement-techniques",
        "title": "Creative Portrait Background Replacement Techniques for Photographers",
        "content": """
<h2>Taking Portrait Photography to the Next Level with Background Replacement</h2>

<p>Portrait photography is about capturing personality and emotion, but sometimes the original shooting environment doesn't match your creative vision. Background replacement allows photographers to transport subjects to entirely new settings without expensive location shoots.</p>

<h3>Beyond Simple Removal: Creative Background Concepts</h3>

<p>Background replacement opens creative possibilities far beyond basic white or solid color backgrounds:</p>

<ul>
  <li><strong>Environmental Portraits:</strong> Place subjects in locations that tell their story</li>
  <li><strong>Abstract and Artistic:</strong> Create surreal or artistic backdrops that evoke emotion</li>
  <li><strong>Seasonal Updates:</strong> Refresh family portraits with seasonal backgrounds</li>
  <li><strong>Brand Consistency:</strong> Maintain consistent branding for corporate headshots</li>
  <li><strong>Historical or Fantasy:</strong> Transport subjects to different time periods or imagined worlds</li>
</ul>

<p>With thoughtful application, background replacement can elevate your portrait photography while maintaining integrity and delivering stunning results for your clients.</p>
""",
        "meta_title": "Portrait Background Replacement Techniques for Photographers | iMagenWiz",
        "meta_description": "Discover creative portrait background replacement techniques. Learn lighting, perspective matching, and AI-assisted tools to create stunning composite images.",
        "meta_keywords": "portrait photography, background replacement, composite images, photo editing, headshot backgrounds",
        "tags": ["Portrait Photography", "Background Replacement", "Photo Editing", "Creative Techniques"]
    },
    {
        "slug": "background-removal-mobile-marketing",
        "title": "Optimizing Background-Removed Images for Mobile Marketing Campaigns",
        "content": """
<h2>Mobile-First Image Optimization for Marketing Success</h2>

<p>With over 60% of web traffic now coming from mobile devices, optimizing your marketing visuals for smaller screens is no longer optional. Background removal plays a crucial role in creating clean, impactful mobile marketing assets.</p>

<h3>Why Background Removal Matters for Mobile</h3>

<p>Mobile screens present unique challenges and opportunities for marketers:</p>

<ul>
  <li>Limited screen real estate requires focused visual communication</li>
  <li>Distracting backgrounds compete with your message on small displays</li>
  <li>Clean, isolated subjects load faster and reduce mobile bandwidth usage</li>
  <li>Removed backgrounds allow flexible image placement in responsive layouts</li>
  <li>Transparent PNGs enable creative overlays and interactions</li>
</ul>

<p>This approach ensures your mobile marketing remains agile and effective in a constantly changing digital landscape.</p>
""",
        "meta_title": "Mobile Marketing Image Optimization with Background Removal | iMagenWiz",
        "meta_description": "Learn how to optimize background-removed images for mobile marketing. Get technical specifications, platform guidelines, and A/B testing strategies for better campaign performance.",
        "meta_keywords": "mobile marketing, background removal, image optimization, social media images, marketing campaign visuals",
        "tags": ["Mobile Marketing", "Social Media", "Background Removal", "Design Optimization"]
    },
    {
        "slug": "ai-image-transparency-quality",
        "title": "How AI Improves Transparency Quality in Complex Image Subjects",
        "content": """
<h2>The Technical Challenge of Perfect Transparency</h2>

<p>Creating perfect transparency in images with complex edges - like hair, fur, glass, or semi-transparent objects - has long been one of the most challenging aspects of image editing. Traditional methods often result in harsh edges, lost detail, or unnatural transitions. AI-powered solutions are changing this landscape.</p>

<h3>Understanding Alpha Channels and Transparency</h3>

<p>Before exploring AI solutions, it's important to understand how transparency works in digital images:</p>

<ul>
  <li>The alpha channel controls pixel transparency values from 0 (transparent) to 255 (opaque)</li>
  <li>Partial transparency values (1-254) create semi-transparent effects</li>
  <li>Complex subjects like hair contain thousands of pixels with varying transparency levels</li>
  <li>Traditional selection tools struggle with automatically identifying these subtle variations</li>
</ul>

<p>As these technologies mature, we can expect even more precise and natural transparency results for the most challenging subjects.</p>
""",
        "meta_title": "AI-Powered Transparency for Complex Image Subjects | iMagenWiz",
        "meta_description": "Discover how AI improves transparency quality for hair, glass, and complex edges. Learn technical specifications and best practices for perfect alpha channels.",
        "meta_keywords": "image transparency, alpha channel, hair masking, background removal, complex edges, glass transparency",
        "tags": ["AI Technology", "Transparency", "Technical Guide", "Image Processing"]
    },
    {
        "slug": "bulk-background-removal-automation",
        "title": "Automating Bulk Background Removal for Enterprise Image Processing",
        "content": """
<h2>Scaling Background Removal for Enterprise Needs</h2>

<p>For enterprises dealing with thousands or millions of images - from e-commerce platforms to media archives - manual background removal is simply not viable. Automation is essential, but maintaining quality at scale presents unique challenges.</p>

<h3>Business Cases for Bulk Background Removal</h3>

<p>Several industries benefit from automated background processing at scale:</p>

<ul>
  <li><strong>E-commerce Marketplaces:</strong> Standardizing product listings across thousands of sellers</li>
  <li><strong>Stock Photo Agencies:</strong> Creating versatile assets for diverse client needs</li>
  <li><strong>Real Estate Platforms:</strong> Processing property images for virtual staging</li>
  <li><strong>Media Archives:</strong> Extracting subjects for documentaries and publications</li>
  <li><strong>Fashion Retailers:</strong> Maintaining consistent catalog presentation</li>
</ul>

<p>With these strategies, enterprises can successfully implement background removal automation that balances quality, cost, and scale.</p>
""",
        "meta_title": "Enterprise Background Removal Automation Guide | iMagenWiz",
        "meta_description": "Learn how to implement automated background removal for large-scale image processing. Discover integration strategies, quality control, and ROI analysis for enterprise needs.",
        "meta_keywords": "bulk background removal, enterprise image processing, automated image editing, image API, e-commerce image automation",
        "tags": ["Enterprise", "Automation", "Bulk Processing", "Integration", "API"]
    }
]

def seed_cms():
    try:
        # Create default language if it doesn't exist
        english = Language.query.filter_by(code='en').first()
        if not english:
            english = Language(code='en', name='English', is_default=True, is_active=True)
            db.session.add(english)
            db.session.commit()
            print("Created English language")
        
        # Get admin user
        admin = User.query.filter_by(is_admin=True).first()
        if not admin:
            # If no admin user exists, use the first user we find
            admin = User.query.first()
            if not admin:
                print("No users found in database. Please create a user first.")
                return False
        
        # Create tags
        all_tags = set()
        for post in blog_post_data:
            for tag_name in post.get("tags", []):
                all_tags.add(tag_name)
        
        tags_dict = {}
        for tag_name in all_tags:
            # Check if tag exists
            tag = Tag.query.filter_by(name=tag_name).first()
            if not tag:
                # Generate slug from name
                slug = tag_name.lower().replace(' ', '-')
                # Remove special characters
                import re
                slug = re.sub(r'[^a-z0-9-]', '', slug)
                
                # Create new tag
                tag = Tag(name=tag_name, slug=slug)
                db.session.add(tag)
                db.session.commit()
                print(f"Created tag: {tag_name}")
            
            tags_dict[tag_name] = tag
        
        # Create blog posts
        for post_data in blog_post_data:
            # Skip if post already exists
            existing_post = Post.query.filter_by(slug=post_data["slug"]).first()
            if existing_post:
                print(f"Post with slug '{post_data['slug']}' already exists.")
                continue
            
            # Create post
            post = Post(
                slug=post_data["slug"],
                author_id=admin.id,
                status="published",
                published_at=datetime.utcnow()
            )
            
            # Add tags
            for tag_name in post_data.get("tags", []):
                post.tags.append(tags_dict[tag_name])
            
            # Create English translation
            translation = PostTranslation(
                language_code="en",
                title=post_data["title"],
                content=post_data["content"],
                meta_title=post_data.get("meta_title", post_data["title"]),
                meta_description=post_data.get("meta_description", ""),
                meta_keywords=post_data.get("meta_keywords", "")
            )
            
            post.translations.append(translation)
            
            # Save to database
            db.session.add(post)
            db.session.commit()
            print(f"Created blog post: {post_data['title']}")
        
        return True
    
    except Exception as e:
        print(f"Error seeding CMS: {str(e)}")
        db.session.rollback()
        return False

# This function can be called from a Flask CLI command or directly
if __name__ == "__main__":
    from app import create_app
    app = create_app()
    with app.app_context():
        success = seed_cms()
        if success:
            print("CMS seeding completed successfully")