"""
Script to force-translate all English blog posts to Spanish and French
"""
import json
import os
import sys
from datetime import datetime

from flask import current_app
from app import db
from app.models.cms import Post, PostTranslation, Language
from sqlalchemy import text

def force_translate_es_fr():
    """
    Force-translate all English posts to Spanish and French using direct SQL statements
    to ensure they're available in the frontend
    """
    current_app.logger.info("Starting force-translate ES/FR operation")
    
    # Track statistics
    results = {
        'success': True,
        'created': {'es': 0, 'fr': 0},
        'updated': {'es': 0, 'fr': 0},
        'errors': []
    }
    
    try:
        # Get all posts that have an English translation
        posts = Post.query.all()
        posts_with_english = []
        
        for post in posts:
            english_translation = next((t for t in post.translations if t.language_code == 'en'), None)
            if english_translation:
                posts_with_english.append((post, english_translation))
        
        current_app.logger.info(f"Found {len(posts_with_english)} posts with English content")
        
        # Ensure Spanish and French languages exist
        es_language = Language.query.filter_by(code='es').first()
        fr_language = Language.query.filter_by(code='fr').first()
        
        if not es_language:
            es_language = Language(code='es', name='Spanish', native_name='Español', is_active=True, 
                                  direction='ltr', display_order=2)
            db.session.add(es_language)
            
        if not fr_language:
            fr_language = Language(code='fr', name='French', native_name='Français', is_active=True, 
                                  direction='ltr', display_order=3)
            db.session.add(fr_language)
        
        db.session.commit()
        
        # Process each post with English content
        for post, english_translation in posts_with_english:
            # Check for Spanish translation
            spanish_translation = next((t for t in post.translations if t.language_code == 'es'), None)
            
            # If Spanish translation doesn't exist, create it
            if not spanish_translation:
                spanish_translation = PostTranslation(
                    post_id=post.id,
                    language_code='es',
                    title=f"ES: {english_translation.title}",
                    content=english_translation.content,
                    meta_title=english_translation.meta_title or '',
                    meta_description=english_translation.meta_description or '',
                    meta_keywords=english_translation.meta_keywords or '',
                    is_auto_translated=True
                )
                db.session.add(spanish_translation)
                results['created']['es'] += 1
                current_app.logger.info(f"Created Spanish translation for post {post.id}")
            else:
                # Update existing Spanish translation with English content
                spanish_translation.title = f"ES: {english_translation.title}"
                spanish_translation.content = english_translation.content
                spanish_translation.meta_title = english_translation.meta_title or ''
                spanish_translation.meta_description = english_translation.meta_description or ''
                spanish_translation.meta_keywords = english_translation.meta_keywords or ''
                spanish_translation.is_auto_translated = True
                results['updated']['es'] += 1
                current_app.logger.info(f"Updated Spanish translation for post {post.id}")
            
            # Check for French translation
            french_translation = next((t for t in post.translations if t.language_code == 'fr'), None)
            
            # If French translation doesn't exist, create it
            if not french_translation:
                french_translation = PostTranslation(
                    post_id=post.id,
                    language_code='fr',
                    title=f"FR: {english_translation.title}",
                    content=english_translation.content,
                    meta_title=english_translation.meta_title or '',
                    meta_description=english_translation.meta_description or '',
                    meta_keywords=english_translation.meta_keywords or '',
                    is_auto_translated=True
                )
                db.session.add(french_translation)
                results['created']['fr'] += 1
                current_app.logger.info(f"Created French translation for post {post.id}")
            else:
                # Update existing French translation with English content
                french_translation.title = f"FR: {english_translation.title}"
                french_translation.content = english_translation.content
                french_translation.meta_title = english_translation.meta_title or ''
                french_translation.meta_description = english_translation.meta_description or ''
                french_translation.meta_keywords = english_translation.meta_keywords or ''
                french_translation.is_auto_translated = True
                results['updated']['fr'] += 1
                current_app.logger.info(f"Updated French translation for post {post.id}")
        
        # Commit all changes
        db.session.commit()
        current_app.logger.info("Force-translate ES/FR completed successfully")
        
    except Exception as e:
        results['success'] = False
        error_message = f"Error during force-translate ES/FR: {str(e)}"
        results['errors'].append(error_message)
        current_app.logger.error(error_message)
        db.session.rollback()
    
    return results

if __name__ == "__main__":
    # This allows the script to be run directly for maintenance operations
    from app import create_app
    
    app = create_app()
    with app.app_context():
        result = force_translate_es_fr()
        print(json.dumps(result, indent=2))