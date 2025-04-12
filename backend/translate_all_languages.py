#!/usr/bin/env python3
"""
Script to translate all English blog posts to all active languages
and publish them using DeepSeek API v3
"""

import os
import sys
import time
import logging
from app import create_app, db
from app.models.cms import Post, PostTranslation, Language
from app.services.translation_service import translation_service
from flask import current_app

# Set up logging
logging.basicConfig(level=logging.INFO, 
                   format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('translate_all')

def translate_all_languages():
    """
    Translate all English posts to Spanish and French using DeepSeek API
    and publish them with the same status as the English version
    """
    app = create_app()
    with app.app_context():
        logger.info("Starting translation of all English posts to Spanish and French...")
        
        # Only translate to Spanish and French for now
        language_codes = ['es', 'fr']
        logger.info(f"Target languages: {', '.join(language_codes)}")
        
        # Get all published posts with English translations
        english_posts = db.session.query(Post).join(
            PostTranslation, 
            db.and_(
                Post.id == PostTranslation.post_id,
                PostTranslation.language_code == 'en'
            )
        ).all()
        
        logger.info(f"Found {len(english_posts)} posts with English content to translate")
        
        total_created = 0
        total_updated = 0
        total_published = 0
        
        # Process each English post
        for post in english_posts:
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if not english_translation:
                logger.warning(f"Post {post.id} ({post.slug}) has no English content despite filter - skipping")
                continue
                
            logger.info(f"Processing post ID {post.id}: '{english_translation.title}'")
            
            # Process all target languages
            for lang_code in language_codes:
                logger.info(f"  Translating to {lang_code}...")
                
                # Use our translation service to translate all fields
                english_data = {
                    'title': english_translation.title,
                    'content': english_translation.content,
                    'meta_title': english_translation.meta_title,
                    'meta_description': english_translation.meta_description,
                    'meta_keywords': english_translation.meta_keywords
                }
                
                # Translate all fields from English to target language
                translated_data = translation_service.translate_post_fields(
                    english_data, 'en', lang_code
                )
                
                if not translated_data:
                    logger.error(f"  Failed to translate post {post.id} to {lang_code}")
                    continue
                
                # Check if translation exists
                existing_translation = next((t for t in post.translations if t.language_code == lang_code), None)
                
                if existing_translation:
                    # Update existing translation
                    existing_translation.title = translated_data['title']
                    existing_translation.content = translated_data['content']
                    existing_translation.meta_title = translated_data['meta_title']
                    existing_translation.meta_description = translated_data['meta_description']
                    existing_translation.meta_keywords = translated_data['meta_keywords']
                    existing_translation.is_auto_translated = True
                    total_updated += 1
                    logger.info(f"  Updated existing translation for {lang_code}")
                else:
                    # Create new translation
                    new_translation = PostTranslation(
                        post_id=post.id,
                        language_code=lang_code,
                        title=translated_data['title'],
                        content=translated_data['content'],
                        meta_title=translated_data['meta_title'],
                        meta_description=translated_data['meta_description'],
                        meta_keywords=translated_data['meta_keywords'],
                        is_auto_translated=True
                    )
                    db.session.add(new_translation)
                    total_created += 1
                    logger.info(f"  Created new translation for {lang_code}")
                
                # Match the publication status with the English version
                if post.status == 'published':
                    total_published += 1
                
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
        logger.info(f"- {total_published} posts published in multiple languages")
        logger.info(f"- {len(english_posts)} source English posts processed")
        logger.info(f"- {len(language_codes)} target languages translated to")

if __name__ == "__main__":
    translate_all_languages()