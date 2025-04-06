"""
Script to add blog post content to the CMS
"""
import os
import sys
import json
from datetime import datetime

# Add the current directory to the path so we can import the app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import pymysql and SQLAlchemy dependencies
import pymysql
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from sqlalchemy.ext.declarative import declarative_base

# Import models directly
from app.models.cms import Post, PostTranslation, PostMedia, Tag, Language
from app.models.models import User

# Database setup
mysql_host = os.environ.get('DB_HOST', os.environ.get('MYSQL_HOST', '8.130.113.102'))
mysql_user = os.environ.get('DB_USER', os.environ.get('MYSQL_USER', 'root'))
mysql_password = os.environ.get('DB_PASSWORD', os.environ.get('MYSQL_PASSWORD', 'Ir%86241992'))
mysql_db = os.environ.get('DB_NAME', os.environ.get('MYSQL_DB', 'mat_db'))
mysql_port = os.environ.get('DB_PORT', os.environ.get('MYSQL_PORT', '3306'))

# URL encode the password for special characters
from urllib.parse import quote_plus
mysql_password = quote_plus(mysql_password)

print(f"Connecting to MySQL: {mysql_user}@{mysql_host}:{mysql_port}/{mysql_db}")

# Create the database engine
engine = create_engine(f'mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_db}')
Session = scoped_session(sessionmaker(bind=engine))
db = Session()

# Initialize Base for SQLAlchemy models
Base = declarative_base()
Base.query = Session.query_property()
from app.models.cms import Post, PostTranslation, PostMedia, Tag, Language
from app.models.models import User

# Blog posts data with SEO best practices
blog_posts = [
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

<h3>Beyond White: Creative Background Options</h3>

<p>While white backgrounds remain the standard for many platforms, consider these creative alternatives:</p>

<ol>
  <li><strong>Contextual Settings:</strong> Place products in lifestyle environments that suggest use cases</li>
  <li><strong>Gradient Backgrounds:</strong> Create depth and focus with subtle color gradients</li>
  <li><strong>Complementary Colors:</strong> Use color theory to make products pop with contrasting backgrounds</li>
  <li><strong>Pattern Backgrounds:</strong> Subtle patterns can add interest without distracting</li>
</ol>

<p>With iMagenWiz, you can easily extract products and place them on any background of your choice.</p>

<h3>Best Practices for Product Photography</h3>

<p>To get the cleanest background removal results:</p>

<ul>
  <li>Use even, diffused lighting to minimize harsh shadows</li>
  <li>Create natural separation between product and original background</li>
  <li>Capture at the highest reasonable resolution</li>
  <li>Consider shooting on a neutral background to simplify processing</li>
  <li>Include all product variations with consistent positioning</li>
</ul>

<h3>Batch Processing for Large Catalogs</h3>

<p>For e-commerce businesses with extensive product catalogs, batch processing capabilities are essential. iMagenWiz allows you to:</p>

<ul>
  <li>Process hundreds of images with consistent settings</li>
  <li>Apply the same background treatment across product lines</li>
  <li>Save custom presets for future product shoots</li>
  <li>Export in multiple formats simultaneously</li>
</ul>

<h3>Optimizing Images for Web Performance</h3>

<p>After background removal, proper image optimization ensures fast loading times without sacrificing quality:</p>

<ol>
  <li>Export in the appropriate format (PNG for transparency, JPEG for opaque backgrounds)</li>
  <li>Compress images appropriately for web use</li>
  <li>Consider responsive image sizes for different devices</li>
  <li>Include proper ALT text for accessibility and SEO</li>
</ol>

<p>Implementing these best practices will not only improve your product presentation but also enhance your overall e-commerce performance.</p>
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

<h3>Technical Considerations for Natural Results</h3>

<p>Creating believable composite images requires attention to several key factors:</p>

<ol>
  <li><strong>Lighting Direction:</strong> Ensure the lighting on your subject matches the direction and quality of light in the background</li>
  <li><strong>Color Temperature:</strong> Adjust color grading to match the ambient color of the new environment</li>
  <li><strong>Perspective and Scale:</strong> Match the camera angle and subject size to maintain realistic perspective</li>
  <li><strong>Edge Refinement:</strong> Pay special attention to hair and transparent elements for natural transitions</li>
  <li><strong>Shadow Casting:</strong> Add realistic ground shadows to anchor the subject in the new environment</li>
</ol>

<h3>Portrait Lighting for Easy Background Replacement</h3>

<p>When shooting with background replacement in mind:</p>

<ul>
  <li>Use rim lighting to create clear separation between subject and background</li>
  <li>Consider shooting against a green or blue screen for complex subjects</li>
  <li>Document your lighting setup to recreate similar lighting for the new background</li>
  <li>Capture additional profile lighting shots for complex 3D objects</li>
</ul>

<h3>AI-Assisted Refinement Tools</h3>

<p>Modern AI tools like iMagenWiz can help refine composite images:</p>

<ul>
  <li>Automatic hair and edge refinement for natural transitions</li>
  <li>Smart color matching between subject and new background</li>
  <li>Intelligent shadow generation based on background lighting</li>
  <li>Noise and texture matching to blend subject into environment</li>
</ul>

<h3>Ethical Considerations in Image Manipulation</h3>

<p>While background replacement provides creative freedom, consider these ethical guidelines:</p>

<ol>
  <li>Be transparent with clients about image manipulation</li>
  <li>Consider the context and potential implications of placing subjects in specific environments</li>
  <li>Maintain appropriate boundaries with portrait subjects, especially for promotional use</li>
  <li>Follow industry standards for disclosure in journalistic or documentary work</li>
</ol>

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

<h3>Optimizing for Different Mobile Platforms</h3>

<p>Each social and advertising platform has specific requirements:</p>

<ol>
  <li><strong>Instagram:</strong> Square and vertical formats with room for text overlays</li>
  <li><strong>Facebook Ads:</strong> Minimal text, focus on product/subject clarity</li>
  <li><strong>Pinterest:</strong> Vertical orientation with clean, pin-friendly composition</li>
  <li><strong>Google Display Network:</strong> Multiple aspect ratios from same source image</li>
  <li><strong>Email Marketing:</strong> Lightweight, fast-loading images with impactful composition</li>
</ol>

<p>Background removal facilitates easy adaptation of your core visuals across these diverse requirements.</p>

<h3>Technical Specifications for Mobile Marketing Images</h3>

<p>For optimal mobile performance after background removal:</p>

<ul>
  <li><strong>File Format:</strong> PNG-8 for simple transparency, PNG-24 for complex edges like hair</li>
  <li><strong>Resolution:</strong> 72-150 DPI depending on target platforms</li>
  <li><strong>Dimensions:</strong> Prepare 2-3 size variants for responsive delivery</li>
  <li><strong>File Size:</strong> Keep under 200KB for optimal loading, under 100KB for ads</li>
  <li><strong>Color Profile:</strong> sRGB for consistent cross-device appearance</li>
</ul>

<h3>Creating Visual Hierarchy Without Backgrounds</h3>

<p>When backgrounds are removed, other design elements become crucial:</p>

<ol>
  <li>Use size and scale to indicate importance</li>
  <li>Apply subtle shadows to create depth and separation</li>
  <li>Consider directional cues to guide eye movement</li>
  <li>Use consistent padding around subjects for balanced composition</li>
  <li>Implement color contrast to highlight key elements</li>
</ol>

<h3>A/B Testing Background Treatment</h3>

<p>Different background approaches can significantly impact campaign performance:</p>

<ul>
  <li>Test transparent vs. solid color backgrounds</li>
  <li>Compare contextual backgrounds against minimalist options</li>
  <li>Evaluate different color backgrounds for emotional response</li>
  <li>Measure engagement with gradient vs. flat backgrounds</li>
</ul>

<p>iMagenWiz makes it easy to create multiple versions of your marketing assets for comprehensive testing.</p>

<h3>Future-Proofing Your Visual Assets</h3>

<p>Maintain an asset library of background-removed images to:</p>

<ul>
  <li>Quickly adapt to new platform requirements</li>
  <li>Refresh campaigns with seasonal backgrounds</li>
  <li>Create consistent visuals across evolving marketing channels</li>
  <li>Respond rapidly to emerging mobile platforms and formats</li>
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

<h3>How AI Revolutionizes Transparency Detection</h3>

<p>Modern AI background removal systems like iMagenWiz use sophisticated neural networks to:</p>

<ol>
  <li><strong>Semantic Understanding:</strong> Recognize the subject matter beyond just pixel values</li>
  <li><strong>Edge Prediction:</strong> Infer natural transparency gradients based on trained patterns</li>
  <li><strong>Detail Preservation:</strong> Maintain fine structures like individual hair strands</li>
  <li><strong>Material Recognition:</strong> Adapt transparency handling to different materials (glass, fabric, fur)</li>
  <li><strong>Optical Adjustment:</strong> Account for light refraction, reflection, and colored lighting effects</li>
</ol>

<h3>Challenging Transparency Scenarios</h3>

<p>Even advanced AI systems face challenges with certain subjects. Here's how modern systems address them:</p>

<ul>
  <li><strong>Blonde or Light Hair:</strong> Enhanced contrast detection and pattern recognition</li>
  <li><strong>Glass Objects:</strong> Reflection and refraction modeling</li>
  <li><strong>Fine Mesh or Lace:</strong> Pattern-based hole detection and preservation</li>
  <li><strong>Smoke or Fog:</strong> Density-based gradient transparency mapping</li>
  <li><strong>Transparent Liquids:</strong> Refraction pattern analysis and edge detection</li>
</ul>

<h3>Optimizing Your Images for AI Transparency Processing</h3>

<p>To get the best results when processing images with transparent elements:</p>

<ol>
  <li>Maximize contrast between subject and background when shooting</li>
  <li>Use even, diffused lighting to minimize harsh shadows</li>
  <li>Capture at higher resolution to provide more data for the AI to analyze</li>
  <li>Consider background color choices that contrast with semi-transparent areas</li>
  <li>For extremely challenging subjects, consider multi-pass processing for different areas</li>
</ol>

<h3>Technical Specifications for Preserving Transparency</h3>

<p>After processing, preserve your transparency quality with these specifications:</p>

<ul>
  <li><strong>File Format:</strong> Use PNG-24 for maximum transparency fidelity</li>
  <li><strong>Matting Refinement:</strong> Consider edge refinement for challenging transitions</li>
  <li><strong>Alpha Channel Bit Depth:</strong> Maintain 8-bit alpha channels for subtle gradients</li>
  <li><strong>Compression:</strong> Use lossless compression to avoid transparency artifacts</li>
  <li><strong>Color Profile:</strong> Embed color profiles to maintain consistent appearance</li>
</ul>

<h3>The Future of AI Transparency Processing</h3>

<p>Emerging research in deep learning continues to improve transparency handling:</p>

<ul>
  <li>Context-aware background reconstruction for partially transparent areas</li>
  <li>Multi-frame analysis for video transparency</li>
  <li>Material-specific transparency algorithms</li>
  <li>Depth-aware transparency processing</li>
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

<h3>Enterprise-Scale Processing Architecture</h3>

<p>Implementing background removal at scale requires robust infrastructure:</p>

<ol>
  <li><strong>API-Based Processing:</strong> Integration with existing content management systems</li>
  <li><strong>Queue Management:</strong> Prioritization and scheduling for large batch jobs</li>
  <li><strong>Parallel Processing:</strong> Distributed workloads across multiple processing instances</li>
  <li><strong>Error Handling:</strong> Automated flagging of problematic images for review</li>
  <li><strong>Metadata Management:</strong> Tracking processing parameters and version control</li>
</ol>

<p>iMagenWiz's enterprise API solutions address these requirements with scalable, robust architecture.</p>

<h3>Quality Control in Automated Workflows</h3>

<p>Maintaining quality while processing thousands of images requires strategic approaches:</p>

<ul>
  <li>Implement confidence scoring to flag low-confidence results for review</li>
  <li>Create category-specific processing profiles (furniture vs. apparel vs. electronics)</li>
  <li>Establish automated QA sampling at statistically significant rates</li>
  <li>Deploy A/B testing for algorithm improvements</li>
  <li>Implement feedback loops from manual reviews to improve automation</li>
</ul>

<h3>Integration with Enterprise Systems</h3>

<p>Background removal automation should integrate seamlessly with:</p>

<ol>
  <li><strong>Product Information Management (PIM) Systems:</strong> Linking processed images to product data</li>
  <li><strong>Digital Asset Management (DAM) Platforms:</strong> Organizing and distributing processed assets</li>
  <li><strong>Content Delivery Networks (CDNs):</strong> Optimizing delivery of processed images</li>
  <li><strong>E-commerce Platforms:</strong> Direct integration with Shopify, Magento, WooCommerce</li>
  <li><strong>Marketing Automation Tools:</strong> Supporting dynamic content generation</li>
</ol>

<h3>Cost-Benefit Analysis of Automation</h3>

<p>When evaluating background removal automation, consider these factors:</p>

<ul>
  <li><strong>Labor Costs:</strong> Manual editing time at scale (typically 2-5 minutes per image)</li>
  <li><strong>Throughput Requirements:</strong> Processing volume and deadlines</li>
  <li><strong>Quality Thresholds:</strong> Acceptable quality levels for your specific use case</li>
  <li><strong>Integration Costs:</strong> Engineering resources for system integration</li>
  <li><strong>Training and Oversight:</strong> Resources needed to manage automated systems</li>
</ul>

<p>For most enterprises processing more than 1,000 images monthly, automation delivers clear ROI.</p>

<h3>Future-Proofing Your Image Processing Pipeline</h3>

<p>As AI continues to evolve, your automation approach should:</p>

<ul>
  <li>Implement versioning for both images and processing algorithms</li>
  <li>Build flexibility to adopt improved AI models as they emerge</li>
  <li>Establish clear KPIs to measure and compare processing quality over time</li>
  <li>Document processing decisions for transparency and compliance</li>
  <li>Create escalation paths for edge cases and special requirements</li>
</ul>

<p>With these strategies, enterprises can successfully implement background removal automation that balances quality, cost, and scale.</p>
""",
        "meta_title": "Enterprise Background Removal Automation Guide | iMagenWiz",
        "meta_description": "Learn how to implement automated background removal for large-scale image processing. Discover integration strategies, quality control, and ROI analysis for enterprise needs.",
        "meta_keywords": "bulk background removal, enterprise image processing, automated image editing, image API, e-commerce image automation",
        "tags": ["Enterprise", "Automation", "Bulk Processing", "Integration", "API"]
    }
]

def create_tags(tags_list):
    """Create tags if they don't exist and return a dictionary of tag name to tag object"""
    tags_dict = {}
    for tag_name in tags_list:
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
    
    return tags_dict

def ensure_language_exists():
    """Ensure English language exists in the database"""
    language = Language.query.filter_by(code='en').first()
    if not language:
        language = Language(code='en', name='English', is_default=True, is_active=True)
        db.session.add(language)
        db.session.commit()
        print("Created English language")
    return language

def ensure_admin_user_exists():
    """Ensure an admin user exists for authorship"""
    from app.models.models import User
    admin = User.query.filter_by(is_admin=True).first()
    if not admin:
        # This is just a fallback, in a real system we'd want to use a real admin
        admin = User.query.first()
    return admin

def create_blog_posts():
    """Create blog posts from the defined content"""
    # Ensure English language exists
    language = ensure_language_exists()
    
    # Get admin user for authorship
    admin = ensure_admin_user_exists()
    
    # Create all the unique tags
    all_tags = set()
    for post in blog_posts:
        all_tags.update(post.get('tags', []))
    
    tags_dict = create_tags(all_tags)
    
    # Create blog posts
    for post_data in blog_posts:
        # Check if post already exists
        existing_post = Post.query.filter_by(slug=post_data['slug']).first()
        if existing_post:
            print(f"Post already exists: {post_data['slug']}")
            continue
        
        # Create new post
        new_post = Post(
            slug=post_data['slug'],
            featured_image=None,  # No featured image for now
            author_id=admin.id,
            status='published',
            published_at=datetime.utcnow()
        )
        
        # Add tags
        for tag_name in post_data.get('tags', []):
            new_post.tags.append(tags_dict[tag_name])
        
        # Create translation
        translation = PostTranslation(
            language_code='en',
            title=post_data['title'],
            content=post_data['content'],
            meta_title=post_data.get('meta_title', post_data['title']),
            meta_description=post_data.get('meta_description', ''),
            meta_keywords=post_data.get('meta_keywords', '')
        )
        
        new_post.translations.append(translation)
        
        # Save to database
        db.session.add(new_post)
        db.session.commit()
        print(f"Created blog post: {post_data['title']}")

if __name__ == '__main__':
    try:
        create_blog_posts()
        print("Blog posts created successfully")
    except Exception as e:
        print(f"Error creating blog posts: {e}")
    finally:
        db.close()