#!/usr/bin/env python3
"""
Script to translate all English blog posts to Spanish and French
and publish them with the same status as the English version
"""

import os
import sys
import time
import logging
from app import create_app, db
from app.models.cms import Post, PostTranslation, Language
from app.services.translation_service import translation_service
from sqlalchemy import text
from datetime import datetime

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('translate_es_fr')

def translate_spanish_french():
    """
    Translate all English posts to Spanish and French using DeepSeek API
    and publish them with the same status as the English version
    """
    app = create_app()
    with app.app_context():
        logger.info("Starting translation of all English posts to Spanish and French...")
        
        # Target Spanish and French only
        language_codes = ['es', 'fr']
        logger.info(f"Target languages: {', '.join(language_codes)}")
        
        # Get all posts from database that have English translations
        posts = db.session.execute(text("""
            SELECT p.id, p.slug 
            FROM cms_posts p
            JOIN cms_post_translations t ON p.id = t.post_id
            WHERE t.language_code = 'en'
            ORDER BY p.id
        """)).fetchall()
        
        logger.info(f"Found {len(posts)} posts with English content to translate")
        
        total_created = 0
        total_updated = 0
        
        # Process each post
        for post in posts:
            post_id = post.id
            post_slug = post.slug
            
            logger.info(f"Processing post ID {post_id}: '{post_slug}'")
            
            # Get English translation for this post
            english_translation = db.session.execute(text("""
                SELECT title, content, meta_title, meta_description, meta_keywords
                FROM cms_post_translations
                WHERE post_id = :post_id AND language_code = 'en'
            """), {"post_id": post_id}).fetchone()
            
            if not english_translation:
                logger.warning(f"Post {post_id} ({post_slug}) has no English content despite filter - skipping")
                continue
                
            # Prepare English content
            english_data = {
                'title': english_translation.title,
                'content': english_translation.content,
                'meta_title': english_translation.meta_title,
                'meta_description': english_translation.meta_description,
                'meta_keywords': english_translation.meta_keywords
            }
            
            # Process each target language
            for lang_code in language_codes:
                logger.info(f"  Translating to {lang_code}...")
                
                # Check if translation exists
                existing_translation = db.session.execute(text("""
                    SELECT id, is_auto_translated
                    FROM cms_post_translations
                    WHERE post_id = :post_id AND language_code = :lang_code
                """), {"post_id": post_id, "lang_code": lang_code}).fetchone()
                
                # Skip manually edited translations (not auto-translated)
                if existing_translation and not existing_translation.is_auto_translated:
                    logger.info(f"  Skipping manually edited translation for {lang_code}")
                    continue
                
                # Translate all fields from English to target language
                translated_data = translation_service.translate_post_fields(
                    english_data, 'en', lang_code
                )
                
                if not translated_data:
                    logger.error(f"  Failed to translate post {post_id} to {lang_code}")
                    continue
                
                if existing_translation:
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
                        "id": existing_translation.id,
                        "title": translated_data['title'],
                        "content": translated_data['content'],
                        "meta_title": translated_data['meta_title'],
                        "meta_description": translated_data['meta_description'],
                        "meta_keywords": translated_data['meta_keywords'],
                        "last_updated_at": datetime.now()
                    })
                    total_updated += 1
                    logger.info(f"  Updated existing translation for {lang_code}")
                else:
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
                    total_created += 1
                    logger.info(f"  Created new translation for {lang_code}")
                
                # Commit each translation individually to avoid loss in case of errors
                try:
                    db.session.commit()
                    logger.info(f"  Successfully committed translation for {lang_code}")
                except Exception as e:
                    db.session.rollback()
                    logger.error(f"  Error committing translation for {lang_code}: {str(e)}")
                
                # Add a small delay to avoid overwhelming the API
                time.sleep(0.5)
        
        logger.info(f"Translation complete:")
        logger.info(f"- {total_created} new translations created")
        logger.info(f"- {total_updated} existing translations updated")
        logger.info(f"- {len(posts)} source English posts processed")

if __name__ == "__main__":
    translate_spanish_french()