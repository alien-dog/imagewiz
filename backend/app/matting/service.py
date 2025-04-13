import os
import uuid
from PIL import Image
import time

def process_image(input_path, output_path):
    """
    Process the image to remove background using an external API

    This function sends the image to a specialized background removal API 
    and saves the processed result.

    Args:
        input_path: Path to the original image
        output_path: Path where processed image will be saved

    Returns:
        bool: True if processing was successful, False otherwise
    """
    import requests

    # External API endpoint for image processing
    API_URL = 'http://8.130.113.102:5000/api/process-image-api'

    try:
        # Open the file in binary mode
        with open(input_path, 'rb') as file:
            # Create the multipart form data
            files = {'file': (os.path.basename(input_path), file, 'image/jpeg')}

            # Make the API request
            print(f"Sending request to {API_URL} for image processing...")
            response = requests.post(API_URL, files=files, timeout=60)

            # Check if the request was successful
            if response.status_code != 200:
                print(f"API request failed with status code: {response.status_code}")
                print(f"Response content: {response.text}")
                return False

            # Save the processed image
            with open(output_path, 'wb') as output_file:
                output_file.write(response.content)

            print(f"Successfully processed image and saved to {output_path}")
            return True

    except Exception as e:
        print(f"Error processing image: {e}")
        return False

    # Fallback to simple processing if the API call fails
    try:
        print("API call failed. Using fallback processing method...")
        # Open the input image
        image = Image.open(input_path)

        # Convert to RGBA if it isn't already
        if image.mode != 'RGBA':
            image = image.convert('RGBA')

        # Create a new image with transparency
        width, height = image.size
        new_image = Image.new('RGBA', (width, height), (0, 0, 0, 0))

        # Process the image - simple placeholder effect
        pixels = image.load()
        new_pixels = new_image.load()

        # Simple processing - make bright pixels more transparent
        for y in range(height):
            for x in range(width):
                r, g, b, a = pixels[x, y]
                # Simple adjustment
                if r > 200 and g > 200 and b > 200:  # If pixel is whitish
                    a = 0  # Make it transparent
                new_pixels[x, y] = (r, g, b, a)

        # Save the processed image
        new_image.save(output_path, format='PNG')
        print(f"Used fallback processing and saved to {output_path}")
        return True

    except Exception as e:
        print(f"Error in fallback processing: {e}")
        return False

def generate_unique_filename(filename):
    """Generate a unique filename to avoid conflicts"""
    # Extract file extension
    _, ext = os.path.splitext(filename)

    # Generate a unique name using UUID
    unique_name = f"{uuid.uuid4()}{ext}"

    return unique_name