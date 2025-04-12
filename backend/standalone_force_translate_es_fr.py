"""
Standalone script to force-translate blog posts to Spanish and French
"""
import os
import sys
import json
from app import create_app, db
from app.cms.force_translate_es_fr import force_translate_es_fr

# Set up the app context
app = create_app()

# Run the translation within the app context
with app.app_context():
    print("Starting force translation to Spanish and French...")
    result = force_translate_es_fr()
    print(json.dumps(result, indent=2))
    print("Force translation completed!")