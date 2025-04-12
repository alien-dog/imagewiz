"""
Test script to verify DeepSeek API connectivity
"""
import os
import sys
import json
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger('deepseek_test')

def test_deepseek_api():
    """Test DeepSeek API connectivity with direct API call"""
    api_key = os.environ.get('DEEPSEEK_API_KEY')
    if not api_key:
        logger.error("DEEPSEEK_API_KEY not found in environment")
        return False
    
    logger.info(f"API key configured: {api_key[:4]}...{api_key[-4:]}")
    
    # DeepSeek API settings
    api_base_url = "https://api.deepseek.com/v1"
    model = "deepseek-chat"  # Try with the base model name
    
    logger.info(f"Using model: {model}")
    logger.info(f"API URL: {api_base_url}")
    
    # Simple test prompt
    prompt = "Translate this text to French: 'Hello, how are you today?'"
    
    # Prepare API request
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    data = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are an expert translator."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 200
    }
    
    logger.info("Making API request...")
    
    try:
        response = requests.post(
            f"{api_base_url}/chat/completions", 
            headers=headers,
            json=data,
            timeout=30
        )
        
        logger.info(f"API response status: {response.status_code}")
        
        if response.status_code != 200:
            logger.error(f"API error: {response.status_code} - {response.text}")
            return False
        
        # Process response
        response_data = response.json()
        logger.debug(f"Raw response: {json.dumps(response_data)}")
        
        if "choices" in response_data and len(response_data["choices"]) > 0:
            message = response_data["choices"][0].get("message", {})
            content = message.get("content", "")
            logger.info(f"Translation: {content}")
            return True
        else:
            logger.error("Invalid response format")
            return False
            
    except Exception as e:
        logger.error(f"API request error: {str(e)}")
        return False

if __name__ == "__main__":
    success = test_deepseek_api()
    print(f"DeepSeek API test {'successful' if success else 'failed'}")
    sys.exit(0 if success else 1)