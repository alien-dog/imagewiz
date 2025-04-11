"""
Translation service for automatically translating content between languages
"""
import os
import json
import logging
from openai import OpenAI
from flask import current_app
from app.models.cms import Language

logger = logging.getLogger('flask.app')

class TranslationService:
    """Service for translating content between languages using OpenAI"""
    
    def __init__(self):
        """Initialize the translation service with OpenAI client"""
        self.api_key = os.environ.get('OPENAI_API_KEY')
        self.client = None
        self.model = "gpt-4o"  # the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        
        if self.api_key:
            self.client = OpenAI(api_key=self.api_key)
        else:
            logger.warning("OPENAI_API_KEY not found in environment variables")
    
    def is_available(self):
        """Check if the translation service is available"""
        return self.client is not None
    
    def get_language_name(self, language_code):
        """Get the language name from code"""
        language = Language.query.get(language_code)
        if language:
            return language.name
        
        # Fallback values for common languages if not in database
        language_map = {
            'en': 'English',
            'fr': 'French',
            'es': 'Spanish',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh-TW': 'Traditional Chinese',
            'ar': 'Arabic',
            'nl': 'Dutch',
            'sv': 'Swedish',
            'tr': 'Turkish',
            'pl': 'Polish',
            'hu': 'Hungarian',
            'el': 'Greek',
            'no': 'Norwegian',
            'vi': 'Vietnamese',
            'th': 'Thai',
            'id': 'Indonesian',
            'ms': 'Malaysian'
        }
        
        return language_map.get(language_code, f"Language ({language_code})")
    
    def translate_content(self, content, from_lang_code, to_lang_code):
        """
        Translate content from one language to another
        
        Args:
            content (str): The text content to translate
            from_lang_code (str): Source language code
            to_lang_code (str): Target language code
            
        Returns:
            str: Translated content or original content if translation fails
        """
        if not self.is_available():
            logger.error("Translation service not available. OPENAI_API_KEY missing.")
            return None
        
        # Skip if source and target languages are the same
        if from_lang_code == to_lang_code:
            return content
        
        try:
            from_lang_name = self.get_language_name(from_lang_code)
            to_lang_name = self.get_language_name(to_lang_code)
            
            logger.info(f"Translating from {from_lang_name} to {to_lang_name}...")
            
            # Create a clear prompt for the LLM
            prompt = f"""Translate the following {from_lang_name} content into {to_lang_name}. 
            Preserve all HTML formatting, styles and structure. 
            Ensure the translation maintains the same meaning and tone as the original.
            If there are any untranslatable terms (like product names), keep them as they are.
            
            Content to translate:
            ```
            {content}
            ```
            
            Respond with just the translated content without any explanations or extra text."""
            
            # Call OpenAI API for translation
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are an expert translator with deep knowledge of both languages."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.2,  # Lower temperature for more consistent translations
                max_tokens=4000   # Adjust based on your content length
            )
            
            # Extract the translated content from the response
            translated_content = response.choices[0].message.content.strip()
            
            # Remove any markdown code block markers that might have been included
            translated_content = translated_content.replace('```', '')
            
            logger.info(f"Successfully translated {len(content)} characters")
            return translated_content
            
        except Exception as e:
            logger.error(f"Translation error: {str(e)}")
            return None
    
    def translate_post_fields(self, post_data, from_lang_code, to_lang_code):
        """
        Translate all relevant fields of a post from one language to another
        
        Args:
            post_data (dict): Post data containing title, content, etc.
            from_lang_code (str): Source language code
            to_lang_code (str): Target language code
            
        Returns:
            dict: Translated post data or None if translation fails
        """
        if not self.is_available():
            logger.error("Translation service not available. OPENAI_API_KEY missing.")
            return None
        
        try:
            translated_data = {}
            
            # Translate each field if present
            if 'title' in post_data:
                translated_data['title'] = self.translate_content(
                    post_data['title'], from_lang_code, to_lang_code
                )
            
            if 'content' in post_data:
                translated_data['content'] = self.translate_content(
                    post_data['content'], from_lang_code, to_lang_code
                )
            
            if 'meta_title' in post_data and post_data['meta_title']:
                translated_data['meta_title'] = self.translate_content(
                    post_data['meta_title'], from_lang_code, to_lang_code
                )
            
            if 'meta_description' in post_data and post_data['meta_description']:
                translated_data['meta_description'] = self.translate_content(
                    post_data['meta_description'], from_lang_code, to_lang_code
                )
            
            if 'meta_keywords' in post_data and post_data['meta_keywords']:
                translated_data['meta_keywords'] = self.translate_content(
                    post_data['meta_keywords'], from_lang_code, to_lang_code
                )
            
            # Add language code to translated data
            translated_data['language_code'] = to_lang_code
            
            # Add a flag to indicate this is an auto-translated version
            translated_data['auto_translated'] = True
            
            return translated_data
            
        except Exception as e:
            logger.error(f"Error translating post fields: {str(e)}")
            return None


# Create a singleton instance for import
translation_service = TranslationService()