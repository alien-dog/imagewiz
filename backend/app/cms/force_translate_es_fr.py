#!/usr/bin/env python3
"""
Script to force-translate all English blog posts to Spanish and French
and make them available in the frontend
"""

import logging
from flask import current_app
from app.models.cms import Post, PostTranslation, Language
from app.services.translation_service import translation_service
from app import db
from sqlalchemy import text
from datetime import datetime

logger = logging.getLogger(__name__)

def force_translate_es_fr():
    """
    Force-translate all English posts to Spanish and French using direct SQL statements
    to ensure they're available in the frontend
    """
    try:
        logger.info("Starting force-translation of all English posts to Spanish and French...")
        
        # Target Spanish and French only
        language_codes = ['es', 'fr']
        logger.info(f"Target languages: {', '.join(language_codes)}")
        
        # Get all posts from database that have English translations
        result = db.session.execute(text("""
            SELECT COUNT(*) as count FROM cms_posts
        """)).fetchone()
        
        logger.info(f"Total posts in database: {result.count}")
        
        # Track results
        created = {lang: 0 for lang in language_codes}
        updated = {lang: 0 for lang in language_codes}
        
        # Get all posts with English translations
        english_posts = db.session.execute(text("""
            SELECT p.id, p.slug, t.title, t.content, t.meta_title, t.meta_description, t.meta_keywords, p.status
            FROM cms_posts p
            JOIN cms_post_translations t ON p.id = t.post_id
            WHERE t.language_code = 'en'
            ORDER BY p.id
        """)).fetchall()
        
        logger.info(f"Posts with English translations: {len(english_posts)}")
        
        # Process each post
        for post in english_posts:
            post_id = post.id
            post_slug = post.slug
            post_status = post.status
            
            logger.info(f"Processing post ID {post_id}: '{post.title}'")
            
            # Prepare English content
            english_data = {
                'title': post.title,
                'content': post.content,
                'meta_title': post.meta_title,
                'meta_description': post.meta_description,
                'meta_keywords': post.meta_keywords
            }
            
            # Process each target language
            for lang_code in language_codes:
                logger.info(f"  Processing language {lang_code}...")
                
                # Check if translation exists
                existing = db.session.execute(text("""
                    SELECT id FROM cms_post_translations
                    WHERE post_id = :post_id AND language_code = :lang_code
                """), {"post_id": post_id, "lang_code": lang_code}).fetchone()
                
                if existing:
                    # Get existing translation's data
                    existing_data = db.session.execute(text("""
                        SELECT title, content, meta_title, meta_description, meta_keywords
                        FROM cms_post_translations
                        WHERE id = :id
                    """), {"id": existing.id}).fetchone()
                    
                    # Only translate if content is empty or very short
                    if (not existing_data.content or 
                        len(existing_data.content) < 20 or
                        not existing_data.title or
                        len(existing_data.title) < 3):
                        
                        logger.info(f"  Translating to {lang_code}...")
                        
                        # Translate all fields from English to target language
                        translated_data = translation_service.translate_post_fields(
                            english_data, 'en', lang_code
                        )
                        
                        if translated_data:
                            # Update existing translation
                            db.session.execute(text("""
                                UPDATE cms_post_translations 
                                SET title = :title, 
                                    content = :content, 
                                    meta_title = :meta_title, 
                                    meta_description = :meta_description, 
                                    meta_keywords = :meta_keywords, 
                                    is_auto_translated = TRUE,
                                    last_updated_at = :last_updated_at
                                WHERE id = :id
                            """), {
                                "id": existing.id,
                                "title": translated_data['title'],
                                "content": translated_data['content'],
                                "meta_title": translated_data['meta_title'],
                                "meta_description": translated_data['meta_description'],
                                "meta_keywords": translated_data['meta_keywords'],
                                "last_updated_at": datetime.now()
                            })
                            
                            updated[lang_code] += 1
                            logger.info(f"  Updated existing translation for {lang_code}")
                            db.session.commit()
                        else:
                            logger.error(f"  Failed to translate post {post_id} to {lang_code}")
                    else:
                        logger.info(f"  Skipping {lang_code} - translation already exists and appears valid")
                else:
                    logger.info(f"  Translating to {lang_code}...")
                    
                    # Translate all fields from English to target language
                    translated_data = translation_service.translate_post_fields(
                        english_data, 'en', lang_code
                    )
                    
                    if translated_data:
                        # Create new translation
                        db.session.execute(text("""
                            INSERT INTO cms_post_translations 
                            (post_id, language_code, title, content, meta_title, meta_description, meta_keywords, is_auto_translated, last_updated_at) 
                            VALUES 
                            (:post_id, :language_code, :title, :content, :meta_title, :meta_description, :meta_keywords, TRUE, :last_updated_at)
                        """), {
                            "post_id": post_id,
                            "language_code": lang_code,
                            "title": translated_data['title'],
                            "content": translated_data['content'],
                            "meta_title": translated_data['meta_title'],
                            "meta_description": translated_data['meta_description'],
                            "meta_keywords": translated_data['meta_keywords'],
                            "last_updated_at": datetime.now()
                        })
                        
                        created[lang_code] += 1
                        logger.info(f"  Created new translation for {lang_code}")
                        db.session.commit()
                    else:
                        logger.error(f"  Failed to translate post {post_id} to {lang_code}")
        
        # Summary
        logger.info("Translation complete:")
        for lang in language_codes:
            logger.info(f"- {lang}: Created {created[lang]}, Updated {updated[lang]}")
        
        return {
            "success": True,
            "created": created,
            "updated": updated,
            "total_english_posts": len(english_posts)
        }
        
    except Exception as e:
        logger.error(f"Error in force_translate_es_fr: {str(e)}")
        db.session.rollback()
        return {
            "success": False,
            "error": str(e)
        }