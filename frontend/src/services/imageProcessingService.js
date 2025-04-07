/**
 * Service for handling image processing operations
 * Uses the external image processing API
 */

/**
 * Process an image using the external API to remove the background
 * @param {File} imageFile - The image file to process
 * @returns {Promise<Blob>} - Promise resolving to the processed image as a Blob
 */
export const processImage = async (imageFile) => {
  if (!imageFile) {
    throw new Error('No image file provided');
  }

  const API_URL = 'http://8.130.113.102:5000/api/process-image-api';
  
  // Create form data
  const formData = new FormData();
  formData.append('file', imageFile);

  try {
    // Make the request to the external API
    const response = await fetch(API_URL, {
      method: 'POST',
      body: formData,
    });

    // Check if the request was successful
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image processing failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    // Get the processed image as a blob
    const processedImageBlob = await response.blob();
    return processedImageBlob;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

/**
 * Create an object URL from a blob for displaying the image
 * @param {Blob} blob - The image blob
 * @returns {string} - Object URL for the image
 */
export const createImageUrl = (blob) => {
  return URL.createObjectURL(blob);
};

/**
 * Revoke an object URL to free memory
 * @param {string} url - The object URL to revoke
 */
export const revokeImageUrl = (url) => {
  if (url && url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};