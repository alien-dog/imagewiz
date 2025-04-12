import axios from 'axios';

const API_URL = '/api/cms';

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
    console.log('Adding tag with data:', tagData);
    console.log('API URL:', `${API_URL}/tags`);
    console.log('Token:', localStorage.getItem('token')?.substring(0, 10) + '...');
    
    const response = await axios.post(`${API_URL}/tags`, tagData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    console.log('Tag creation response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addTag:', error.response || error);
    return handleError(error);
  }
};

export const updateTag = async (id, tagData) => {
  try {
    const response = await axios.put(`${API_URL}/tags/${id}`, tagData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTag = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/tags/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Blog Posts
export const getPosts = async (filters = {}) => {
  try {
    console.log('Fetching posts with filters:', filters);
    const response = await axios.get(`${API_URL}/posts`, { params: filters });
    console.log('Posts API response:', response.data);
    
    if (response.data && typeof response.data === 'object') {
      if (Array.isArray(response.data)) {
        console.log('Response is an array with', response.data.length, 'items');
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

export const getPost = async (id, language = null) => {
  try {
    const params = language ? { language } : {};
    const response = await axios.get(`${API_URL}/posts/${id}`, { params });
    
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
    const response = await axios.get(`${API_URL}/posts/by-slug/${slug}`, { params });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const createPost = async (postData) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, postData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const updatePost = async (id, postData) => {
  try {
    const response = await axios.put(`${API_URL}/posts/${id}`, postData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deletePost = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/posts/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const deleteTranslation = async (postId, languageCode) => {
  try {
    const response = await axios.delete(`${API_URL}/posts/${postId}/translations/${languageCode}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

export const autoTranslatePost = async (postId, options = {}) => {
  try {
    const response = await axios.post(`${API_URL}/posts/${postId}/auto-translate`, options, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return handleError(error);
  }
};

// Auto-translate all posts from English to all other languages
export const autoTranslateAllPosts = async (options = {}) => {
  try {
    console.log('Starting auto-translation for all posts');
    const response = await axios.post(`${API_URL}/posts/auto-translate-all`, options, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in auto-translating all posts:', error);
    return handleError(error);
  }
};

// Force translate all English posts to Spanish and French only
export const forceTranslateEsFr = async () => {
  try {
    console.log('Starting force translation to Spanish and French');
    const response = await axios.post(`${API_URL}/posts/force-translate-es-fr`, {}, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error in force-translating to Spanish/French:', error);
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