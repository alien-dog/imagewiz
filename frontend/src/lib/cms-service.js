import axios from 'axios';

// Define the correct API URL path
// Important: Always use the full path for API requests to avoid routing issues
const API_URL = '/api/cms'; // This is only used as a prefix for some routes
const FULL_API_URL = '/api/cms'; // This ensures we're using the correct full path

// Get authentication token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to handle API errors
const handleError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error('API error:', error.response.data);
    throw new Error(error.response.data.error || 'An error occurred');
  } else if (error.request) {
    // The request was made but no response was received
    console.error('API error: No response received', error.request);
    throw new Error('No response from server. Please try again.');
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('API error:', error.message);
    throw new Error('Error setting up request. Please try again.');
  }
};

// Languages
export const getLanguages = async () => {
  try {
    console.log('Fetching languages from API...');
    const response = await axios.get(`${API_URL}/languages`);
    console.log('Languages API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching languages:', error);
    return handleError(error);
  }
};

export const addLanguage = async (languageData) => {
  try {
    const response = await axios.post(`${API_URL}/languages`, languageData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updateLanguage = async (code, languageData) => {
  try {
    const response = await axios.put(`${API_URL}/languages/${code}`, languageData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteLanguage = async (code) => {
  try {
    const response = await axios.delete(`${API_URL}/languages/${code}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Tags
export const getTags = async () => {
  try {
    const response = await axios.get(`${API_URL}/tags`);
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const addTag = async (tagData) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/tags`;
    
    console.log('Adding tag with data:', tagData);
    console.log('Correct API URL:', fullApiUrl);
    console.log('Previously used API URL:', `${API_URL}/tags`);
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Token available:', !!token, token ? `(${token.substring(0, 10)}...)` : '(none)');
    
    if (!token) {
      console.error('No auth token available for tag creation');
      throw new Error('Authentication required. Please log in again.');
    }
    
    // Log full request details
    console.log('Making tag creation request with:', {
      url: fullApiUrl,
      method: 'POST',
      data: tagData,
      authHeader: `Bearer ${token.substring(0, 10)}...`
    });
    
    // Use the full URL path to avoid any route confusion
    const response = await axios.post(fullApiUrl, tagData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Tag creation response:', response.data);
    return response.data;
  } catch (error) {
    // Detailed error logging
    console.error('Error in addTag:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    return handleError(error);
  }
};

export const updateTag = async (id, tagData) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/tags/${id}`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Token for update tag:', !!token);
    console.log('Correct API URL for update:', fullApiUrl);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.put(fullApiUrl, tagData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in updateTag:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return handleError(error);
  }
};

export const deleteTag = async (id) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/tags/${id}`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Token for delete tag:', !!token);
    console.log('Correct API URL for delete:', fullApiUrl);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.delete(fullApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in deleteTag:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return handleError(error);
  }
};

// Blog Posts
export const getPosts = async (filters = {}) => {
  try {
    console.log('Fetching posts with filters:', filters);
    
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts`;
    
    const response = await axios.get(fullApiUrl, { params: filters });
    console.log('Posts API response:', response.data);
    
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        console.log('Response is an array with', response.data.length, 'items');
        console.log('Sample first post language data:', 
          response.data[0]?.translations?.length > 0 ? 
          `Has ${response.data[0].translations.length} translations` : 
          'No translations');
      } else if (response.data.posts) {
        console.log('Response has posts property with', response.data.posts.length, 'items');
      } else {
        console.log('Response structure:', Object.keys(response.data));
      }
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    return handleError(error);
  }
};

/**
 * Expand post translations into virtual posts for display in the CMS
 * This takes posts with translations and creates virtual post objects for each translation
 */
export const expandPostTranslations = (posts) => {
  if (!posts || !Array.isArray(posts)) {
    console.error('Cannot expand translations: posts is not an array', posts);
    return [];
  }

  console.log(`Expanding ${posts.length} posts with their translations`);
  const expandedPosts = [];
  
  // Debug the structure of the first post if available
  if (posts.length > 0) {
    const firstPost = posts[0];
    console.log('First post structure:', {
      id: firstPost.id,
      hasTranslation: !!firstPost.translation,
      hasTranslations: !!firstPost.translations,
      translationsCount: firstPost.translations ? firstPost.translations.length : 0,
      translationLanguages: firstPost.translations ? 
        firstPost.translations.map(t => t.language_code) : []
    });
  }
  
  // Process each post to create a separate row for each translation
  posts.forEach(post => {
    if (!post.translations || post.translations.length === 0) {
      // If no translations array or empty, just add the original post
      console.log(`Post ${post.id} has no translations array or it's empty, adding as-is`);
      expandedPosts.push(post);
      return;
    }
    
    // For each post with translations, add one row per translation
    console.log(`Post ${post.id} has ${post.translations.length} translations, creating virtual posts`);
    
    // Loop through each translation and create a virtual post
    post.translations.forEach(translation => {
      // Create a virtual post with this translation as the primary one
      const virtualPost = {
        ...post,
        // Set this specific translation as the primary translation for this virtual post
        translation: {
          ...translation
        },
        // Add markers to identify this as a virtual post
        isVirtualTranslation: true,
        virtualId: `${post.id}-${translation.language_code}`
      };
      
      console.log(`Adding virtual post for ID: ${post.id}, language: ${translation.language_code}, title: "${translation.title?.substring(0, 20)}..."`);
      expandedPosts.push(virtualPost);
    });
  });
  
  console.log(`Expanded ${posts.length} original posts into ${expandedPosts.length} virtual posts with individual translations`);
  return expandedPosts;
};

export const getPost = async (id, language = null) => {
  try {
    const params = language ? { language } : {};
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/${id}`;
    
    const response = await axios.get(fullApiUrl, { params });
    
    // Enhanced debug logging
    console.log('API response for getPost:', response.data);
    console.log('Full response structure:', JSON.stringify(response.data, null, 2));
    
    if (response.data) {
      if (response.data.translation) {
        console.log('Direct translation available:', response.data.translation);
      } else if (response.data.translations) {
        console.log('Multiple translations available:', response.data.translations.length);
      }
    }
    
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getPostBySlug = async (slug, language = null) => {
  try {
    const params = language ? { language } : {};
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/by-slug/${slug}`;
    
    const response = await axios.get(fullApiUrl, { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createPost = async (postData) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Create post - Token available:', !!token);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.post(fullApiUrl, postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    return handleError(error);
  }
};

export const updatePost = async (id, postData) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/${id}`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Update post - Token available:', !!token);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.put(fullApiUrl, postData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating post:', error);
    return handleError(error);
  }
};

export const deletePost = async (id) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/${id}`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Delete post - Token available:', !!token);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.delete(fullApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    return handleError(error);
  }
};

export const deleteTranslation = async (postId, languageCode) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/${postId}/translations/${languageCode}`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Delete translation - Token available:', !!token);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.delete(fullApiUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting translation:', error);
    return handleError(error);
  }
};

export const autoTranslatePost = async (postId, options = {}) => {
  try {
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/${postId}/auto-translate`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Auto-translate post - Token available:', !!token);
    console.log('Correct API URL for auto-translate:', fullApiUrl);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.post(fullApiUrl, options, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in auto-translate:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return handleError(error);
  }
};

// Auto-translate all posts from English to all other languages
export const autoTranslateAllPosts = async (options = {}) => {
  try {
    console.log('Starting auto-translation for all posts');
    
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/auto-translate-all`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Auto-translate all posts - Token available:', !!token);
    console.log('Correct API URL for auto-translate-all:', fullApiUrl);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.post(fullApiUrl, options, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in auto-translating all posts:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return handleError(error);
  }
};

// Force translate all English posts to Spanish and French only
export const forceTranslateEsFr = async () => {
  try {
    console.log('Starting force translation to Spanish and French');
    
    // Ensure we're using the correct URL with full /api prefix
    const fullApiUrl = `/api/cms/posts/force-translate-es-fr`;
    
    // Get the token using our helper
    const token = getAuthToken();
    console.log('Force translate ES/FR - Token available:', !!token);
    console.log('Correct API URL for force-translate-es-fr:', fullApiUrl);
    
    if (!token) {
      throw new Error('Authentication required. Please log in again.');
    }
    
    const response = await axios.post(fullApiUrl, {}, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in force-translating to Spanish/French:', error);
    if (error.response) {
      console.error('Response error data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    return handleError(error);
  }
};

// Media
export const uploadMedia = async (postId, formData) => {
  try {
    const response = await axios.post(`${API_URL}/posts/${postId}/media`, formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data; // Returns { media: {...}, message: "Media uploaded successfully" }
  } catch (error) {
    return handleError(error);
  }
};

export const getPostMedia = async (postId) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${postId}/media`);
    // The response format is { media: [...], message: "Media retrieved successfully" }
    // But we want to maintain backward compatibility with existing code
    return response.data && response.data.media ? 
      { media: response.data.media } : 
      { media: [] };
  } catch (error) {
    return handleError(error);
  }
};

export const updateMedia = async (mediaId, mediaData) => {
  try {
    const response = await axios.put(`${API_URL}/media/${mediaId}`, mediaData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteMedia = async (mediaId) => {
  try {
    const response = await axios.delete(`${API_URL}/media/${mediaId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Public Blog API
export const getBlogPosts = async (params = {}) => {
  try {
    const response = await axios.get(`${API_URL}/blog`, { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getBlogPostBySlug = async (slug, language = null) => {
  try {
    const params = language ? { language } : {};
    const response = await axios.get(`${API_URL}/blog/${slug}`, { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};