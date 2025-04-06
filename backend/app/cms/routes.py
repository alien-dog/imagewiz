import os
import uuid
from datetime import datetime
from flask import request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from app import db
from app.models.models import User
from app.models.cms import Post, PostTranslation, PostMedia, Tag, Language
from sqlalchemy import or_, and_
from . import bp

# Define allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'pdf', 'doc', 'docx'}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def check_admin_access():
    """Check if the current user has admin access"""
    user_id = get_jwt_identity()
    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        return None
        
    user = User.query.get(user_id)
    
    if not user or not user.is_admin:
        return None
    
    return user

# Language management
@bp.route('/languages', methods=['GET'])
def get_languages():
    """Get all supported languages"""
    languages = Language.query.all()
    return jsonify([lang.to_dict() for lang in languages]), 200

@bp.route('/languages', methods=['POST'])
@jwt_required()
def add_language():
    """Add a new language"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('code') or not data.get('name'):
        return jsonify({"error": "Language code and name are required"}), 400
    
    # Check if language already exists
    existing_language = Language.query.get(data['code'])
    if existing_language:
        return jsonify({"error": "Language already exists"}), 400
    
    # Set as default if it's the first language
    is_default = not Language.query.first()
    
    # Create new language
    new_language = Language(
        code=data['code'],
        name=data['name'],
        is_default=data.get('is_default', is_default),
        is_active=data.get('is_active', True)
    )
    
    # If this language is set as default, update any existing default languages
    if new_language.is_default:
        default_languages = Language.query.filter_by(is_default=True).all()
        for lang in default_languages:
            lang.is_default = False
    
    db.session.add(new_language)
    db.session.commit()
    
    return jsonify(new_language.to_dict()), 201

@bp.route('/languages/<code>', methods=['PUT'])
@jwt_required()
def update_language(code):
    """Update a language"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    language = Language.query.get(code)
    if not language:
        return jsonify({"error": "Language not found"}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        language.name = data['name']
    if 'is_active' in data:
        language.is_active = data['is_active']
    if 'is_default' in data and data['is_default']:
        # Update any existing default languages
        default_languages = Language.query.filter_by(is_default=True).all()
        for lang in default_languages:
            lang.is_default = False
        language.is_default = True
    
    db.session.commit()
    
    return jsonify(language.to_dict()), 200

@bp.route('/languages/<code>', methods=['DELETE'])
@jwt_required()
def delete_language(code):
    """Delete a language"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    language = Language.query.get(code)
    if not language:
        return jsonify({"error": "Language not found"}), 404
    
    # Don't allow deleting the default language
    if language.is_default:
        return jsonify({"error": "Cannot delete the default language"}), 400
    
    # Check if language is in use
    translations = PostTranslation.query.filter_by(language_code=code).first()
    if translations:
        return jsonify({"error": "Language is in use and cannot be deleted"}), 400
    
    db.session.delete(language)
    db.session.commit()
    
    return jsonify({"message": "Language deleted successfully"}), 200

# Tag management
@bp.route('/tags', methods=['GET'])
def get_tags():
    """Get all tags"""
    tags = Tag.query.all()
    return jsonify([tag.to_dict() for tag in tags]), 200

@bp.route('/tags', methods=['POST'])
@jwt_required()
def add_tag():
    """Add a new tag"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('name'):
        return jsonify({"error": "Tag name is required"}), 400
    
    # Generate slug from name if not provided
    if not data.get('slug'):
        # Convert to lowercase, replace spaces with hyphens
        slug = data['name'].lower().replace(' ', '-')
        # Remove special characters
        import re
        slug = re.sub(r'[^a-z0-9-]', '', slug)
    else:
        slug = data['slug']
    
    # Check if tag already exists
    existing_tag = Tag.query.filter(or_(Tag.name == data['name'], Tag.slug == slug)).first()
    if existing_tag:
        return jsonify({"error": "Tag already exists"}), 400
    
    # Create new tag
    new_tag = Tag(
        name=data['name'],
        slug=slug
    )
    
    db.session.add(new_tag)
    db.session.commit()
    
    return jsonify(new_tag.to_dict()), 201

@bp.route('/tags/<int:tag_id>', methods=['PUT'])
@jwt_required()
def update_tag(tag_id):
    """Update a tag"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({"error": "Tag not found"}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'name' in data:
        tag.name = data['name']
    if 'slug' in data:
        tag.slug = data['slug']
    
    db.session.commit()
    
    return jsonify(tag.to_dict()), 200

@bp.route('/tags/<int:tag_id>', methods=['DELETE'])
@jwt_required()
def delete_tag(tag_id):
    """Delete a tag"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    tag = Tag.query.get(tag_id)
    if not tag:
        return jsonify({"error": "Tag not found"}), 404
    
    db.session.delete(tag)
    db.session.commit()
    
    return jsonify({"message": "Tag deleted successfully"}), 200

# Post management
@bp.route('/posts', methods=['GET'])
def get_posts():
    """Get all posts with optional filters"""
    # Get query parameters
    status = request.args.get('status')
    language = request.args.get('language')
    tag = request.args.get('tag')
    search = request.args.get('search')
    
    # Base query
    query = Post.query
    
    # Apply filters
    if status:
        query = query.filter(Post.status == status)
    
    if tag:
        query = query.join(Post.tags).filter(Tag.slug == tag)
    
    if search:
        search_term = f"%{search}%"
        # Search in translations
        query = query.join(PostTranslation).filter(
            or_(
                PostTranslation.title.like(search_term),
                PostTranslation.content.like(search_term)
            )
        )
    
    # Execute query
    posts = query.order_by(Post.created_at.desc()).all()
    
    # Format results
    result = []
    for post in posts:
        post_dict = post.to_dict(include_translations=True, language=language)
        result.append(post_dict)
    
    return jsonify(result), 200

@bp.route('/posts/<int:post_id>', methods=['GET'])
def get_post(post_id):
    """Get a specific post"""
    language = request.args.get('language')
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    return jsonify(post.to_dict(include_translations=True, language=language)), 200

@bp.route('/posts/by-slug/<slug>', methods=['GET'])
def get_post_by_slug(slug):
    """Get a specific post by slug"""
    language = request.args.get('language')
    
    post = Post.query.filter_by(slug=slug).first()
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    return jsonify(post.to_dict(include_translations=True, language=language)), 200

@bp.route('/posts', methods=['POST'])
@jwt_required()
def create_post():
    """Create a new post"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    data = request.get_json()
    
    # Validate required fields
    if not data or not data.get('slug'):
        return jsonify({"error": "Post slug is required"}), 400
    
    # Check if slug already exists
    existing_post = Post.query.filter_by(slug=data['slug']).first()
    if existing_post:
        return jsonify({"error": "Post with this slug already exists"}), 400
    
    # Create new post
    new_post = Post(
        slug=data['slug'],
        featured_image=data.get('featured_image'),
        author_id=user.id,
        status=data.get('status', 'draft')
    )
    
    # Set published_at date if status is published
    if new_post.status == 'published' and not data.get('published_at'):
        new_post.published_at = datetime.utcnow()
    elif data.get('published_at'):
        try:
            new_post.published_at = datetime.fromisoformat(data['published_at'])
        except (ValueError, TypeError):
            pass
    
    # Add tags if provided
    if data.get('tags'):
        for tag_id in data['tags']:
            tag = Tag.query.get(tag_id)
            if tag:
                new_post.tags.append(tag)
    
    # Add translations if provided
    if data.get('translations'):
        for trans_data in data['translations']:
            language_code = trans_data.get('language_code')
            title = trans_data.get('title')
            content = trans_data.get('content')
            
            if language_code and title and content:
                translation = PostTranslation(
                    language_code=language_code,
                    title=title,
                    content=content,
                    meta_title=trans_data.get('meta_title', title),
                    meta_description=trans_data.get('meta_description', ''),
                    meta_keywords=trans_data.get('meta_keywords', '')
                )
                new_post.translations.append(translation)
    
    db.session.add(new_post)
    db.session.commit()
    
    return jsonify(new_post.to_dict()), 201

@bp.route('/posts/<int:post_id>', methods=['PUT'])
@jwt_required()
def update_post(post_id):
    """Update a post"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'slug' in data:
        # Check if slug already exists for another post
        existing_post = Post.query.filter(and_(Post.slug == data['slug'], Post.id != post_id)).first()
        if existing_post:
            return jsonify({"error": "Post with this slug already exists"}), 400
        post.slug = data['slug']
    
    if 'featured_image' in data:
        post.featured_image = data['featured_image']
    
    if 'status' in data:
        old_status = post.status
        post.status = data['status']
        
        # Set published_at date if status is changing to published
        if old_status != 'published' and post.status == 'published' and not post.published_at:
            post.published_at = datetime.utcnow()
    
    if 'published_at' in data:
        try:
            post.published_at = datetime.fromisoformat(data['published_at'])
        except (ValueError, TypeError):
            pass
    
    # Update tags if provided
    if 'tags' in data:
        # Clear existing tags
        post.tags = []
        
        # Add new tags
        for tag_id in data['tags']:
            tag = Tag.query.get(tag_id)
            if tag:
                post.tags.append(tag)
    
    # Update translations if provided
    if 'translations' in data:
        for trans_data in data['translations']:
            language_code = trans_data.get('language_code')
            
            if not language_code:
                continue
            
            # Find existing translation or create new one
            translation = next((t for t in post.translations if t.language_code == language_code), None)
            
            if translation:
                # Update existing translation
                if 'title' in trans_data:
                    translation.title = trans_data['title']
                if 'content' in trans_data:
                    translation.content = trans_data['content']
                if 'meta_title' in trans_data:
                    translation.meta_title = trans_data['meta_title']
                if 'meta_description' in trans_data:
                    translation.meta_description = trans_data['meta_description']
                if 'meta_keywords' in trans_data:
                    translation.meta_keywords = trans_data['meta_keywords']
            else:
                # Create new translation
                title = trans_data.get('title')
                content = trans_data.get('content')
                
                if title and content:
                    new_translation = PostTranslation(
                        language_code=language_code,
                        title=title,
                        content=content,
                        meta_title=trans_data.get('meta_title', title),
                        meta_description=trans_data.get('meta_description', ''),
                        meta_keywords=trans_data.get('meta_keywords', '')
                    )
                    post.translations.append(new_translation)
    
    db.session.commit()
    
    return jsonify(post.to_dict()), 200

@bp.route('/posts/<int:post_id>', methods=['DELETE'])
@jwt_required()
def delete_post(post_id):
    """Delete a post"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Delete the post (cascading will delete translations and media)
    db.session.delete(post)
    db.session.commit()
    
    return jsonify({"message": "Post deleted successfully"}), 200

@bp.route('/posts/<int:post_id>/translations/<language_code>', methods=['DELETE'])
@jwt_required()
def delete_translation(post_id, language_code):
    """Delete a specific translation"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    translation = PostTranslation.query.filter_by(post_id=post_id, language_code=language_code).first()
    if not translation:
        return jsonify({"error": "Translation not found"}), 404
    
    db.session.delete(translation)
    db.session.commit()
    
    return jsonify({"message": "Translation deleted successfully"}), 200

# Media management
@bp.route('/posts/<int:post_id>/media', methods=['POST'])
@jwt_required()
def upload_media(post_id):
    """Upload media for a post"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser also
    # submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file and allowed_file(file.filename):
        # Secure filename and add unique ID to prevent collisions
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Determine file type
        file_ext = filename.rsplit('.', 1)[1].lower()
        if file_ext in ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']:
            file_type = 'image'
        elif file_ext in ['pdf']:
            file_type = 'document'
        else:
            file_type = 'other'
        
        # Create uploads directory for CMS if it doesn't exist
        cms_upload_folder = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cms')
        os.makedirs(cms_upload_folder, exist_ok=True)
        
        # Save the file
        file_path = os.path.join(cms_upload_folder, unique_filename)
        file.save(file_path)
        
        # Create media record
        new_media = PostMedia(
            post_id=post_id,
            file_path=f"/api/uploads/cms/{unique_filename}",
            file_type=file_type,
            alt_text=request.form.get('alt_text', ''),
            title=request.form.get('title', '')
        )
        
        db.session.add(new_media)
        db.session.commit()
        
        # Return in a format expected by the frontend
        return jsonify({
            "media": new_media.to_dict(),
            "message": "Media uploaded successfully"
        }), 201
    
    return jsonify({"error": "File type not allowed"}), 400

@bp.route('/posts/<int:post_id>/media', methods=['GET'])
def get_post_media(post_id):
    """Get all media for a post"""
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    
    media = PostMedia.query.filter_by(post_id=post_id).all()
    
    # Format response to match frontend expectations
    return jsonify({
        "media": [m.to_dict() for m in media],
        "message": "Media retrieved successfully"
    }), 200

@bp.route('/media/<int:media_id>', methods=['PUT'])
@jwt_required()
def update_media(media_id):
    """Update media metadata"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    media = PostMedia.query.get(media_id)
    if not media:
        return jsonify({"error": "Media not found"}), 404
    
    data = request.get_json()
    
    # Update fields
    if 'alt_text' in data:
        media.alt_text = data['alt_text']
    if 'title' in data:
        media.title = data['title']
    
    db.session.commit()
    
    return jsonify(media.to_dict()), 200

@bp.route('/media/<int:media_id>', methods=['DELETE'])
@jwt_required()
def delete_media(media_id):
    """Delete media"""
    # Check admin access
    user = check_admin_access()
    if not user:
        return jsonify({"error": "Admin access required"}), 403
    
    media = PostMedia.query.get(media_id)
    if not media:
        return jsonify({"error": "Media not found"}), 404
    
    # Delete the physical file
    try:
        # Extract filename from the path
        filename = media.file_path.split('/')[-1]
        file_path = os.path.join(current_app.config['UPLOAD_FOLDER'], 'cms', filename)
        
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        current_app.logger.error(f"Error deleting media file: {e}")
    
    # Delete the database record
    db.session.delete(media)
    db.session.commit()
    
    return jsonify({"message": "Media deleted successfully"}), 200

# Public Blog API
@bp.route('/blog', methods=['GET'])
def get_blog_posts():
    """Get published blog posts for public consumption"""
    # Get query parameters
    language = request.args.get('language')
    tag = request.args.get('tag')
    search = request.args.get('search')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Limit per_page to avoid potential performance issues
    per_page = min(per_page, 50)
    
    # Base query - only published posts
    query = Post.query.filter_by(status='published')
    
    # Apply filters
    if tag:
        query = query.join(Post.tags).filter(Tag.slug == tag)
    
    if search:
        search_term = f"%{search}%"
        # Search in translations
        query = query.join(PostTranslation).filter(
            or_(
                PostTranslation.title.like(search_term),
                PostTranslation.content.like(search_term)
            )
        )
    
    # Order by published date (newest first)
    query = query.order_by(Post.published_at.desc())
    
    # Get total count for pagination
    total = query.count()
    
    # Paginate
    posts = query.offset((page - 1) * per_page).limit(per_page).all()
    
    # Format results
    result = []
    for post in posts:
        post_dict = post.to_dict(include_translations=True, language=language)
        result.append(post_dict)
    
    # Return with pagination metadata
    return jsonify({
        'posts': result,
        'pagination': {
            'total': total,
            'page': page,
            'per_page': per_page,
            'pages': (total + per_page - 1) // per_page  # ceiling division
        }
    }), 200

@bp.route('/blog/<slug>', methods=['GET'])
def get_blog_post_by_slug(slug):
    """Get a specific published blog post by slug for public consumption"""
    # Get query parameters
    language = request.args.get('language')
    
    # Find the published post with the given slug
    post = Post.query.filter_by(slug=slug, status='published').first()
    
    if not post:
        return jsonify({"error": "Blog post not found"}), 404
    
    # Format the post with comprehensive data
    post_data = post.to_dict(include_translations=True, language=language)
    
    # Get author details
    author = User.query.get(post.author_id)
    author_data = {
        "id": author.id,
        "name": author.username,
        # Add other author fields as needed
    }
    
    # Find related posts (similar tags, limit to 3)
    if post.tags:
        tag_ids = [tag.id for tag in post.tags]
        related_posts_query = (
            Post.query
            .filter(Post.id != post.id, Post.status == 'published')
            .join(Post.tags)
            .filter(Tag.id.in_(tag_ids))
            .group_by(Post.id)
            .order_by(Post.published_at.desc())
            .limit(3)
        )
        related_posts = [p.to_dict(include_translations=True, language=language) for p in related_posts_query.all()]
    else:
        # If no tags, get the latest 3 published posts that aren't this one
        related_posts_query = (
            Post.query
            .filter(Post.id != post.id, Post.status == 'published')
            .order_by(Post.published_at.desc())
            .limit(3)
        )
        related_posts = [p.to_dict(include_translations=True, language=language) for p in related_posts_query.all()]
    
    # Get available languages for this post
    available_languages = []
    used_languages = set(trans.language_code for trans in post.translations)
    all_languages = Language.query.all()
    for lang in all_languages:
        if lang.code in used_languages:
            available_languages.append({
                "code": lang.code,
                "name": lang.name,
                "is_default": lang.is_default
            })
    
    # Get the content for the requested language
    content = None
    title = None
    meta_description = None
    for trans in post.translations:
        if (language and trans.language_code == language) or (not language and trans.language_code == 'en'):
            content = trans.content
            title = trans.title
            meta_description = trans.meta_description
            break
    
    # Return a more comprehensive response for the blog post page
    return jsonify({
        "post": {
            "id": post.id,
            "slug": post.slug,
            "title": title,
            "content": content,
            "meta_description": meta_description,
            "featured_image": post.featured_image,
            "created_at": post.created_at.isoformat(),
            "updated_at": post.updated_at.isoformat() if post.updated_at else None,
            "published_at": post.published_at.isoformat() if post.published_at else None,
            "author": author_data,
            "tags": [tag.to_dict() for tag in post.tags]
        },
        "related_posts": related_posts,
        "available_languages": available_languages
    }), 200