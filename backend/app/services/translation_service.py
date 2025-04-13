"""
Translation service for automatically translating content between languages
"""
import os
import json
import time
import random
import logging
import requests
from urllib3.util import Retry
from requests.adapters import HTTPAdapter
from flask import current_app
from app.models.cms import Language

logger = logging.getLogger('flask.app')

class TranslationService:
    """Service for translating content between languages using DeepSeek API"""
    
    def __init__(self):
        """Initialize the translation service with DeepSeek API"""
        self.api_key = os.environ.get('DEEPSEEK_API_KEY') or os.environ.get('OPENAI_API_KEY')
        self.api_base_url = "https://api.deepseek.com/v1"
        # DeepSeek API model name must be "deepseek-chat" 
        # "deepseek-chat-v1" doesn't work (tested and confirmed Model Not Exist error)
        self.model = "deepseek-chat"  # Using the correct DeepSeek Chat model name
        
        logger.info(f"Translation service initialized with DeepSeek API")
        logger.debug(f"DeepSeek API URL: {self.api_base_url}")
        logger.debug(f"DeepSeek model: {self.model}")
        logger.debug(f"DeepSeek API key status: {'Configured' if self.api_key else 'Missing'}")
        
        if self.api_key:
            logger.info("DeepSeek API settings initialized successfully")
        else:
            logger.warning("DEEPSEEK_API_KEY not found in environment variables")
    
    def is_available(self):
        """Check if the translation service is available"""
        return self.api_key is not None
    
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
            logger.error("Translation service not available. DEEPSEEK_API_KEY missing.")
            return None
        
        # Skip if source and target languages are the same
        if from_lang_code == to_lang_code:
            return content
        
        try:
            from_lang_name = self.get_language_name(from_lang_code)
            to_lang_name = self.get_language_name(to_lang_code)
            
            logger.info(f"Translating from {from_lang_name} to {to_lang_name}...")
            
            # Verify DeepSeek API key
            logger.debug(f"DeepSeek API key: {'configured' if self.api_key else 'missing'}")
            if self.api_key:
                logger.debug(f"DeepSeek API key length: {len(self.api_key)}")
                logger.debug(f"DeepSeek API key first/last 4 chars: {self.api_key[:4]}...{self.api_key[-4:]}")
            
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
            
            logger.debug(f"DeepSeek API URL: {self.api_base_url}/chat/completions")
            logger.debug(f"DeepSeek model: {self.model}")
            
            # Call DeepSeek API for translation using requests
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are an expert translator with deep knowledge of both languages."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,  # Lower temperature for more consistent translations
                "max_tokens": 4000   # Adjust based on your content length
            }
            
            logger.debug(f"Making DeepSeek API call with timeout of 120 seconds")
            
            logger.debug(f"DeepSeek API request payload: {json.dumps(data)}")
            
            # Create a requests session with increased timeouts and connection pooling
            session = requests.Session()
            adapter = HTTPAdapter(
                pool_connections=5,
                pool_maxsize=5,
                max_retries=Retry(
                    total=5,  # Increased retries
                    backoff_factor=2,  # More aggressive backoff
                    status_forcelist=[408, 429, 500, 502, 503, 504],
                    allowed_methods=["POST"],
                    respect_retry_after_header=True
                )
            )
            session.mount('https://', adapter)
            
            max_attempts = 3
            attempt = 0
            last_error = None
            response = None
            
            try:
                while attempt < max_attempts:
                    try:
                        timeout_multiplier = attempt + 1  # Increase timeout with each attempt
                        response = session.post(
                            f"{self.api_base_url}/chat/completions", 
                            headers=headers,
                            json=data,
                            timeout=(60 * timeout_multiplier, 300 * timeout_multiplier)  # Increased timeouts
                        )
                        if response.status_code == 200:
                            break
                        attempt += 1
                        if attempt < max_attempts:
                            sleep_time = (2 ** attempt) + random.uniform(0, 1)  # Exponential backoff with jitter
                            logger.warning(f"Attempt {attempt} failed, retrying in {sleep_time:.1f} seconds...")
                            time.sleep(sleep_time)
                    except (requests.exceptions.ReadTimeout, requests.exceptions.ConnectionError) as e:
                        last_error = e
                        attempt += 1
                        if attempt < max_attempts:
                            sleep_time = (2 ** attempt) + random.uniform(0, 1)
                            logger.warning(f"Timeout on attempt {attempt}, retrying in {sleep_time:.1f} seconds...")
                            time.sleep(sleep_time)
                        
                if attempt >= max_attempts:
                    logger.error(f"Failed after {max_attempts} attempts: {last_error}")
                    return None
            finally:
                # Always close the session
                session.close()
            
            # Log the response status
            logger.debug(f"DeepSeek API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                return None
            
            # Verify response content
            try:
                response_data = response.json()
                logger.debug(f"DeepSeek API raw response: {json.dumps(response_data)}")
                logger.info(f"DeepSeek API response received successfully")
                
                # Verify expected response structure
                if "choices" not in response_data or not response_data["choices"]:
                    logger.error(f"DeepSeek API response missing 'choices' field: {json.dumps(response_data)}")
                    return None
                    
                if "message" not in response_data["choices"][0]:
                    logger.error(f"DeepSeek API response missing 'message' field: {json.dumps(response_data)}")
                    return None
                    
                if "content" not in response_data["choices"][0]["message"]:
                    logger.error(f"DeepSeek API response missing 'content' field: {json.dumps(response_data)}")
                    return None
                
                # Extract the translated content from the response
                translated_content = response_data["choices"][0]["message"]["content"].strip()
                logger.debug(f"Raw translated content: {translated_content[:100]}...")
            except Exception as e:
                logger.error(f"Error parsing DeepSeek API response: {str(e)}")
                return None
            
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
            logger.error("Translation service not available. DEEPSEEK_API_KEY missing.")
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