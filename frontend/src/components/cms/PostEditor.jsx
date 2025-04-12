import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Save,
  ArrowLeft, 
  Upload, 
  Image as ImageIcon, 
  Globe, 
  Tag as TagIcon,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Languages
} from 'lucide-react';
import { 
  getPost, 
  createPost, 
  updatePost, 
  getTags, 
  getLanguages, 
  uploadMedia,
  getPostMedia,
  deleteTranslation,
  autoTranslatePost
} from '../../lib/cms-service';

// Simplified HTML Editor component that is more reliable for displaying and editing content
const SimpleHtmlEditor = ({ value, onChange, languageCode }) => {
  // Use expanded RTL check for all RTL languages
  const isRTL = ['ar', 'he', 'ur', 'fa'].includes(languageCode);
  
  // Show a warning if content appears to be empty
  const contentIsEmpty = !value || value.trim() === '';
  
  // Only show formatting toolbar if we actually have content
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Simple toolbar with basic formatting buttons */}
      <div className="bg-gray-100 p-2 border-b border-gray-300" style={{direction: 'ltr'}} dir="ltr">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              type="button"
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const textarea = document.getElementById('content-textarea');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selection = textarea.value.substring(start, end);
                const replacement = `<strong>${selection}</strong>`;
                const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
                onChange(newValue);
                
                // Set cursor position after the change
                setTimeout(() => {
                  textarea.focus();
                  textarea.selectionStart = start + replacement.length;
                  textarea.selectionEnd = start + replacement.length;
                }, 0);
              }}
            >
              <strong>B</strong>
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const textarea = document.getElementById('content-textarea');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selection = textarea.value.substring(start, end);
                const replacement = `<em>${selection}</em>`;
                const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
                onChange(newValue);
                
                // Set cursor position after the change
                setTimeout(() => {
                  textarea.focus();
                  textarea.selectionStart = start + replacement.length;
                  textarea.selectionEnd = start + replacement.length;
                }, 0);
              }}
            >
              <em>I</em>
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const textarea = document.getElementById('content-textarea');
                const start = textarea.selectionStart;
                const end = textarea.selectionEnd;
                const selection = textarea.value.substring(start, end);
                const replacement = `<h2>${selection || 'Heading'}</h2>`;
                const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
                onChange(newValue);
                
                // Set cursor position after the change
                setTimeout(() => {
                  textarea.focus();
                  textarea.selectionStart = start + replacement.length;
                  textarea.selectionEnd = start + replacement.length;
                }, 0);
              }}
            >
              H2
            </button>
            <button
              type="button"
              className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
              onClick={() => {
                const textarea = document.getElementById('content-textarea');
                const start = textarea.selectionStart;
                const content = `<ul>\n  <li>List item 1</li>\n  <li>List item 2</li>\n</ul>`;
                const newValue = textarea.value.substring(0, start) + content + textarea.value.substring(start);
                onChange(newValue);
                
                // Set cursor position after the change
                setTimeout(() => {
                  textarea.focus();
                  textarea.selectionStart = start + content.length;
                  textarea.selectionEnd = start + content.length;
                }, 0);
              }}
            >
              List
            </button>
          </div>
          
          <div className="text-xs text-gray-500">
            HTML formatting allowed
          </div>
        </div>
      </div>
      
      {/* Warning for empty content */}
      {contentIsEmpty && (
        <div className="bg-yellow-50 p-4 border-b border-yellow-200">
          <p className="text-yellow-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Empty content detected. Please add some content or use Auto Translate.
          </p>
          <p className="text-sm text-yellow-600 ml-7 mt-1">
            You may need to select another language to view existing translations.
          </p>
        </div>
      )}
      
      {/* Simple textarea for editing HTML directly */}
      <textarea
        id="content-textarea"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-4 min-h-[400px] font-mono text-sm"
        dir={isRTL ? 'rtl' : 'ltr'}
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left',
        }}
      />
      
      {/* Preview section */}
      {!contentIsEmpty && (
        <div className="border-t border-gray-300">
          <div className="bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700">
            Preview
          </div>
          <div 
            className="p-4 prose max-w-none"
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{
              direction: isRTL ? 'rtl' : 'ltr',
              textAlign: isRTL ? 'right' : 'left',
            }}
            dangerouslySetInnerHTML={{ __html: value || '' }}
          />
        </div>
      )}
    </div>
  );
};

const PostEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [languages, setLanguages] = useState([]);
  const [tags, setTags] = useState([]);
  const [media, setMedia] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  
  // Helper function to check if a language is RTL
  const isRTL = (langCode) => ['ar', 'he', 'ur', 'fa'].includes(langCode);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    meta_title: '',
    meta_description: '',
    featured_image: '',
    status: 'draft',
    language_code: 'en',
    tag_ids: []
  });
  
  const [translations, setTranslations] = useState([]);
  
  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch languages and tags regardless of edit or create mode
        const [languagesData, tagsData] = await Promise.all([
          getLanguages(),
          getTags()
        ]);
        
        console.log('Loaded languages data:', languagesData);
        
        // Filter to only active languages
        const activeLanguages = Array.isArray(languagesData) 
          ? languagesData.filter(lang => lang.is_active)
          : (languagesData.languages || []).filter(lang => lang.is_active);
        
        console.log('Filtered to active languages:', activeLanguages.length);
        setLanguages(activeLanguages);
        setTags(tagsData.tags || []);
        
        // If we're editing an existing post, fetch it
        if (id) {
          try {
            // Fetch the post with language=en to get a specific translation (prevents empty content)
            const postData = await getPost(id, 'en');
            const mediaData = await getPostMedia(id);
            
            console.log('DEBUG - Fetched post data:', JSON.stringify(postData, null, 2));
            
            // API can return data in multiple formats - handle both direct and nested responses
            const postObject = postData.post || postData;
            
            // Initialize form data with post details
            let translationData = {};
            
            // Check for translation data in various formats
            if (postData.translation) {
              console.log('Using single translation data:', postData.translation);
              translationData = postData.translation;
            } else if (postData.translations && postData.translations.length > 0) {
              console.log('Using first of multiple translations:', postData.translations[0]);
              translationData = postData.translations[0];
            } else if (postObject.translation) {
              console.log('Using translation from post object:', postObject.translation);
              translationData = postObject.translation;
            } else if (postObject.translations && postObject.translations.length > 0) {
              console.log('Using first translation from post object:', postObject.translations[0]);
              translationData = postObject.translations[0];
            }
            
            // If no translation data was found, show an error
            if (!translationData || Object.keys(translationData).length === 0) {
              console.error('No translation data found in API response:', postData);
              setError('Could not find any translation data in the response');
              return;
            }
            
            console.log('CRITICAL DEBUG - Translation data found:', JSON.stringify(translationData, null, 2));
            console.log('CRITICAL DEBUG - Content length:', translationData.content ? translationData.content.length : 0);
            
            // Set form data with the post object and translation data
            // Process the content field to detect empty strings
            const processedContent = translationData.content || '';
            console.log('CONTENT FIELD:', {
              raw: translationData.content,
              processed: processedContent,
              length: processedContent.length,
              isEmpty: processedContent.trim() === ''
            });
            
            setFormData({
              title: translationData.title || '',
              slug: postObject.slug || '',
              content: processedContent,
              excerpt: translationData.excerpt || '',
              meta_title: translationData.meta_title || '',
              meta_description: translationData.meta_description || '',
              featured_image: postObject.featured_image || '',
              status: postObject.status || 'draft',
              language_code: translationData.language_code || 'en',
              tag_ids: (postObject.tags || []).map(tag => tag.id)
            });
            
            // Set translations
            if (postData.translations) {
              console.log('Setting translations from direct response:', postData.translations);
              setTranslations(postData.translations);
            } else if (postObject.translations) {
              console.log('Setting translations from post object:', postObject.translations);
              setTranslations(postObject.translations);
            } else {
              console.log('No translations found, setting empty array');
              setTranslations([]);
            }
            
            // Set media
            if (mediaData && mediaData.media) {
              setMedia(mediaData.media);
            }
          } catch (postError) {
            console.error('Error fetching post data:', postError);
            setError('Failed to load post data. Please try again.');
          }
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  // Generate slug from title
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };
  
  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setFormData({
      ...formData,
      title: newTitle,
      // Only auto-generate slug if it's empty or matches previous auto-generated slug
      slug: formData.slug === generateSlug(formData.title) 
        ? generateSlug(newTitle)
        : formData.slug
    });
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Special handling for language_code changes
    if (name === 'language_code') {
      // When changing language in edit mode, fetch that language's content
      if (id) {
        console.log(`Language changed to ${value}, fetching translation`);
        
        // Find existing translation in our loaded translations
        const existingTranslation = translations.find(t => t.language_code === value);
        
        if (existingTranslation) {
          console.log('Found existing translation, updating form:', existingTranslation);
          // Update form with the translation data
          setFormData({
            ...formData,
            language_code: value,
            title: existingTranslation.title || '',
            content: existingTranslation.content || '',
            meta_title: existingTranslation.meta_title || '',
            meta_description: existingTranslation.meta_description || ''
          });
        } else {
          console.log('No existing translation found, fetching from API');
          // If no local translation found, try to fetch it
          getPost(id, value)
            .then(postData => {
              console.log('Fetched translation data for language change:', postData);
              
              // Handle different API response formats
              const postObject = postData.post || postData;
              let translationData = null;
              
              // Check for translation data in various formats
              if (postData.translation) {
                console.log('Found direct translation data:', postData.translation);
                translationData = postData.translation;
              } else if (postObject.translation) {
                console.log('Found nested translation data:', postObject.translation);
                translationData = postObject.translation;
              }
              
              if (translationData) {
                // Process content for debugging
                const processedContent = translationData.content || '';
                console.log('LANGUAGE CHANGE - CONTENT FIELD:', {
                  raw: translationData.content,
                  processed: processedContent,
                  length: processedContent.length,
                  isEmpty: processedContent.trim() === ''
                });
                
                console.log('Using translation data:', translationData);
                setFormData({
                  ...formData,
                  language_code: value,
                  title: translationData.title || '',
                  content: processedContent,
                  meta_title: translationData.meta_title || '',
                  meta_description: translationData.meta_description || ''
                });
              } else {
                // If no translation exists, just change the language but keep fields empty
                console.log('No translation found for language', value);
                setFormData({
                  ...formData,
                  language_code: value,
                  title: '',
                  content: '',
                  meta_title: '',
                  meta_description: ''
                });
              }
            })
            .catch(err => {
              console.error('Error fetching translation:', err);
              // On error, still update the language but show a notification
              setFormData({
                ...formData,
                language_code: value
              });
              setError(`Failed to load ${value} translation. Please try again.`);
            });
        }
      } else {
        // For new posts, just change the language code
        setFormData({
          ...formData,
          language_code: value
        });
      }
      
      // Apply a slight delay to allow React to update the DOM before resetting direction
      setTimeout(() => {
        // Force re-evaluation of text direction for all inputs
        const inputs = document.querySelectorAll('input[dir], textarea[dir]');
        inputs.forEach(input => {
          // Skip slug field which should always be LTR
          if (input.id === 'slug') return;
          
          // Use our helper function to check RTL
          const rtl = isRTL(value);
          input.dir = rtl ? 'rtl' : 'ltr';
          input.style.direction = rtl ? 'rtl' : 'ltr';
          input.style.textAlign = rtl ? 'right' : 'left';
        });
      }, 50);
    } else {
      // For all other inputs, simply update the value
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  const handleTagChange = (e) => {
    const options = e.target.options;
    const selectedTags = [];
    
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selectedTags.push(parseInt(options[i].value));
      }
    }
    
    setFormData({
      ...formData,
      tag_ids: selectedTags
    });
  };
  
  const handleMediaUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('No file selected');
      return;
    }
    
    console.log('Selected file:', file.name, 'type:', file.type, 'size:', file.size);
    setIsLoading(true);
    
    // Create FormData object for API upload
    const mediaFormData = new FormData();
    mediaFormData.append('file', file);
    
    try {
      // For new posts, create a temporary local media object
      if (!id) {
        console.log('Creating temporary media for new post');
        const tempUrl = URL.createObjectURL(file);
        const tempMedia = {
          id: `temp-${Date.now()}`, // Temporary ID for React keys
          file_path: tempUrl,
          url: tempUrl,
          alt_text: file.name,
          is_temp: true // Flag to identify temporary uploads
        };
        
        console.log('Added temporary media:', tempMedia);
        setMedia([...media, tempMedia]);
        
        // Always set as featured image for direct uploads in new posts
        console.log('Setting as featured image:', tempUrl);
        setFeaturedImage(tempUrl);
        
        // Highlight media library section
        setTimeout(() => {
          const mediaLibrary = document.getElementById('media-library');
          if (mediaLibrary) {
            mediaLibrary.classList.add('ring-2', 'ring-teal-500');
            setTimeout(() => {
              mediaLibrary.classList.remove('ring-2', 'ring-teal-500');
            }, 2000);
          }
        }, 500);
        
        setSuccess('Media added and set as featured image');
      } else {
        // For existing posts, upload media to the server
        console.log('Uploading media for post ID:', id);
        const response = await uploadMedia(id, mediaFormData);
        
        console.log('Upload response:', response);
        
        if (response && response.media) {
          // Add the new media to the existing media array
          const newMedia = response.media;
          console.log('New media added:', newMedia);
          setMedia([...media, newMedia]);
          
          // Always set as featured image for direct uploads
          if (newMedia.file_path) {
            console.log('Setting as featured image:', newMedia.file_path);
            setFeaturedImage(newMedia.file_path);
          }
          
          // Highlight media library section
          setTimeout(() => {
            const mediaLibrary = document.getElementById('media-library');
            if (mediaLibrary) {
              mediaLibrary.classList.add('ring-2', 'ring-teal-500');
              setTimeout(() => {
                mediaLibrary.classList.remove('ring-2', 'ring-teal-500');
              }, 2000);
            }
          }, 500);
          
          setSuccess('Media uploaded and set as featured image');
        } else {
          console.error('Invalid response format:', response);
          setError('Invalid server response. Media data missing.');
        }
      }
      
      // Scroll to show the media library with newly added image
      setTimeout(() => {
        const mediaLibrary = document.getElementById('media-library');
        if (mediaLibrary) {
          mediaLibrary.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500);
      
      // Clear file input to allow reselecting the same file
      e.target.value = '';
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(`Failed to upload media: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    
    try {
      // Format data to match backend expectations
      const postData = {
        slug: formData.slug,
        featured_image: formData.featured_image,
        status: formData.status,
        tags: formData.tag_ids, // Backend expects 'tags' not 'tag_ids'
        // Add translations as expected by the backend
        translations: [{
          language_code: formData.language_code,
          title: formData.title,
          content: formData.content,
          meta_title: formData.meta_title || formData.title,
          meta_description: formData.meta_description || formData.excerpt,
        }]
      };
      
      console.log('Submitting post data:', JSON.stringify(postData));
      
      if (id) {
        // Update existing post
        await updatePost(id, postData);
        setSuccess('Post updated successfully!');
        
        // Auto-translate if this is an English post that was just updated
        if (formData.language_code === 'en') {
          try {
            console.log('Triggering auto-translation after English post update');
            // Trigger auto-translation for this post
            const translationResult = await autoTranslatePost(id);
            console.log('Auto-translation result:', translationResult);
            
            // Update success message to include translation info
            const successful = translationResult.translations?.successful?.length || 0;
            setSuccess(`Post updated successfully! Auto-translated to ${successful} languages.`);
          } catch (translationError) {
            console.error('Error auto-translating post:', translationError);
            // Don't override the main success message with a translation error
          }
        }
      } else {
        // Create new post
        const response = await createPost(postData);
        setSuccess('Post created successfully!');
        
        // Redirect to edit page if we just created a new post
        const newPostId = response.id || (response.post && response.post.id);
        if (newPostId) {
          // Auto-translate if this is an English post
          if (formData.language_code === 'en') {
            try {
              console.log('Triggering auto-translation for new English post');
              // Trigger auto-translation for this post
              const translationResult = await autoTranslatePost(newPostId);
              console.log('Auto-translation result:', translationResult);
              
              // Update success message to include translation info
              const successful = translationResult.translations?.successful?.length || 0;
              setSuccess(`Post created successfully! Auto-translated to ${successful} languages.`);
            } catch (translationError) {
              console.error('Error auto-translating new post:', translationError);
              // Don't override the main success message with a translation error
            }
          }
          
          navigate(`/cms/posts/${newPostId}/edit`);
        }
      }
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save post. Please try again: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteTranslation = async (languageCode) => {
    try {
      await deleteTranslation(id, languageCode);
      
      // Update translations list
      setTranslations(translations.filter(t => t.language_code !== languageCode));
      setSuccess(`Translation in ${languageCode} deleted successfully.`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
      
      setConfirmDelete(null);
    } catch (err) {
      console.error('Error deleting translation:', err);
      setError('Failed to delete translation. Please try again.');
    }
  };
  
  const handleAutoTranslate = async (forceTranslate = false) => {
    if (!id) {
      setError('You must save the post before it can be auto-translated to all languages. Please save first.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if we have English content available
      const hasEnglishTranslation = 
        formData.language_code === 'en' || 
        translations.some(t => t.language_code === 'en');
      
      if (!hasEnglishTranslation) {
        setError('English content is required for auto-translation. Please add English content first.');
        setIsLoading(false);
        return;
      }
      
      // Call the auto-translate endpoint
      const response = await autoTranslatePost(id, { force_translate: forceTranslate });
      
      // Refresh the post data to get updated translations
      const postData = await getPost(id);
      if (postData.translations) {
        setTranslations(postData.translations);
      }
      
      // Display success message with statistics
      const successCount = response.translations?.successful?.length || 0;
      const skippedCount = response.translations?.skipped?.length || 0;
      const failedCount = response.translations?.failed?.length || 0;
      
      setSuccess(`Auto-translation completed: ${successCount} translated, ${skippedCount} skipped, ${failedCount} failed.`);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      console.error('Error auto-translating post:', err);
      setError(`Failed to auto-translate: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const setFeaturedImage = (url) => {
    console.log('Setting featured image via function to:', url);
    const updatedFormData = {
      ...formData,
      featured_image: url
    };
    setFormData(updatedFormData);
    console.log('Updated form data with featured image:', updatedFormData);
    
    // Show success message for feedback
    setSuccess(url ? 'Featured image set successfully!' : 'Featured image removed');
    setTimeout(() => setSuccess(null), 3000);
  };
  
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            className="mr-4 flex items-center text-gray-600 hover:text-gray-900"
            onClick={() => navigate('/cms/posts')}
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back to Posts
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            {id ? 'Edit Post' : 'Create New Post'}
          </h1>
        </div>
        <button
          type="button"
          className={`flex items-center px-4 py-2 rounded ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-teal-500 hover:bg-teal-600 text-white'
          }`}
          onClick={handleSubmit}
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Post
            </>
          )}
        </button>
      </div>
      
      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-md flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main content section */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleTitleChange}
                required
                dir={isRTL(formData.language_code) ? 'rtl' : 'ltr'}
                style={{
                  direction: isRTL(formData.language_code) ? 'rtl' : 'ltr',
                  textAlign: isRTL(formData.language_code) ? 'right' : 'left'
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleInputChange}
                required
                dir="ltr"
                style={{ direction: 'ltr', textAlign: 'left' }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                Content
              </label>
              <SimpleHtmlEditor
                value={formData.content}
                onChange={(value) => setFormData({ ...formData, content: value })}
                languageCode={formData.language_code}
              />
            </div>
            
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleInputChange}
                rows={3}
                dir={isRTL(formData.language_code) ? 'rtl' : 'ltr'}
                style={{
                  direction: isRTL(formData.language_code) ? 'rtl' : 'ltr',
                  textAlign: isRTL(formData.language_code) ? 'right' : 'left'
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>
          
          {/* Sidebar section */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">Publishing Options</h3>
              
              <div className="mb-4">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="language_code" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Globe className="h-4 w-4 mr-1" />
                  Language
                </label>
                <div className="relative">
                  <select
                    id="language_code"
                    name="language_code"
                    value={formData.language_code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
                  >
                    {/* Show English first */}
                    <option value="en">🇬🇧 English</option>
                    <optgroup label="Other Languages">
                      {languages
                        .filter(lang => lang.code !== 'en')
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((lang) => {
                          // Choose flag based on language code
                          let flag = '🌐';
                          // Common language flags
                          if (lang.code === 'es') flag = '🇪🇸';
                          if (lang.code === 'fr') flag = '🇫🇷';
                          if (lang.code === 'de') flag = '🇩🇪';
                          if (lang.code === 'it') flag = '🇮🇹';
                          if (lang.code === 'pt') flag = '🇵🇹';
                          if (lang.code === 'ru') flag = '🇷🇺';
                          if (lang.code === 'zh') flag = '🇨🇳';
                          if (lang.code === 'ja') flag = '🇯🇵';
                          if (lang.code === 'ar') flag = '🇸🇦';
                          if (lang.code === 'hi') flag = '🇮🇳';
                          if (lang.code === 'ko') flag = '🇰🇷';
                          
                          return (
                            <option key={lang.code} value={lang.code}>
                              {flag} {lang.name}
                            </option>
                          );
                        })
                      }
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Changing language will load content for that language if available
                </p>
                
                {/* Auto-translate button for new drafts */}
                {!id && formData.language_code === 'en' && (
                  <div className="mt-3 p-2 border border-teal-100 bg-teal-50 rounded">
                    <p className="text-xs text-teal-800 mb-2">
                      <strong>Creating content in English?</strong> Make sure to save your post first, 
                      then you can auto-translate it to all 21 other languages with one click.
                    </p>
                    <button
                      type="button"
                      className="w-full flex justify-center items-center text-xs bg-teal-100 text-teal-700 px-2 py-2 rounded hover:bg-teal-200 border border-teal-200"
                      onClick={handleSubmit}
                      disabled={isLoading || isSaving}
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save first, then auto-translate
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Translations */}
            {id && translations.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-gray-700">Translations</h3>
                  <button
                    type="button"
                    className="flex items-center text-xs bg-teal-50 text-teal-700 px-2 py-1 rounded hover:bg-teal-100"
                    onClick={() => handleAutoTranslate(false)}
                    disabled={isLoading}
                  >
                    <Languages className="h-3 w-3 mr-1" />
                    Auto-Translate
                  </button>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Auto-translate will create or update translations in all available languages based on the English content.
                  Only translations that haven't been manually edited will be updated.
                </p>
                <div className="flex mb-3">
                  <button
                    type="button"
                    className="text-xs text-gray-600 hover:text-teal-700 underline"
                    onClick={() => handleAutoTranslate(true)}
                    disabled={isLoading}
                  >
                    Force refresh all translations
                  </button>
                </div>
                <ul className="space-y-2">
                  {translations.map((translation) => (
                    <li key={translation.language_code} className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-gray-500" />
                        {translation.language_name}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          className="text-teal-600 hover:text-teal-800"
                          onClick={() => navigate(`/cms/posts/${id}/translate/${translation.language_code}`)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-red-600 hover:text-red-800"
                          onClick={() => setConfirmDelete(translation.language_code)}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <TagIcon className="h-4 w-4 mr-1" />
                Tags
              </h3>
              
              <div className="mb-3">
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tag_ids.length > 0 ? (
                    tags
                      .filter(tag => formData.tag_ids.includes(tag.id))
                      .map(tag => (
                        <div key={tag.id} className="flex items-center bg-teal-100 px-3 py-1 rounded-full">
                          <span className="text-teal-800 text-sm">{tag.name}</span>
                          <button
                            type="button"
                            className="ml-2 text-teal-600 hover:text-teal-800"
                            onClick={() => {
                              const updatedTags = formData.tag_ids.filter(id => id !== tag.id);
                              setFormData({
                                ...formData,
                                tag_ids: updatedTags
                              });
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))
                  ) : (
                    <div className="text-gray-500 text-sm">No tags selected</div>
                  )}
                </div>
                
                <div className="relative">
                  <div className="flex items-center">
                    <select
                      id="tag_selector"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-500 cursor-pointer appearance-none"
                      onChange={(e) => {
                        if (e.target.value) {
                          const tagId = parseInt(e.target.value);
                          if (!formData.tag_ids.includes(tagId)) {
                            // First update the form data
                            const updatedTags = [...formData.tag_ids, tagId];
                            setFormData({
                              ...formData,
                              tag_ids: updatedTags
                            });
                            
                            // Then synchronize the hidden select element for compatibility
                            const hiddenSelect = document.getElementById('tag_ids');
                            if (hiddenSelect) {
                              // Clear all selections first
                              Array.from(hiddenSelect.options).forEach(option => {
                                option.selected = false;
                              });
                              
                              // Then set the new selections
                              updatedTags.forEach(id => {
                                const option = Array.from(hiddenSelect.options).find(opt => parseInt(opt.value) === id);
                                if (option) option.selected = true;
                              });
                            }
                            
                            console.log('Added tag:', tagId, 'Updated tags:', updatedTags);
                          }
                          e.target.value = ''; // Reset the select after selection
                        }
                      }}
                      value=""
                    >
                      <option value="" disabled>Choose a tag to add</option>
                      {tags
                        .filter(tag => !formData.tag_ids.includes(tag.id))
                        .map((tag) => (
                          <option key={tag.id} value={tag.id}>
                            {tag.name}
                          </option>
                        ))}
                    </select>
                    <button 
                      type="button"
                      className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                      onClick={() => {
                        // Focus and show dropdown
                        const tagSelector = document.getElementById('tag_selector');
                        if (tagSelector) {
                          tagSelector.focus();
                          tagSelector.click();
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Add Tag
                    </button>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    Click to select from available tags
                  </div>
                </div>
              </div>
              
              {/* Keep the original select for compatibility with handleTagChange */}
              <select
                multiple
                id="tag_ids"
                name="tag_ids"
                value={formData.tag_ids}
                onChange={handleTagChange}
                className="hidden"
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3">SEO</h3>
              
              <div className="mb-4">
                <label htmlFor="meta_title" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Title
                </label>
                <input
                  type="text"
                  id="meta_title"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  dir={isRTL(formData.language_code) ? 'rtl' : 'ltr'}
                  style={{
                    direction: isRTL(formData.language_code) ? 'rtl' : 'ltr',
                    textAlign: isRTL(formData.language_code) ? 'right' : 'left'
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              
              <div>
                <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description
                </label>
                <textarea
                  id="meta_description"
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  dir={isRTL(formData.language_code) ? 'rtl' : 'ltr'}
                  style={{
                    direction: isRTL(formData.language_code) ? 'rtl' : 'ltr',
                    textAlign: isRTL(formData.language_code) ? 'right' : 'left'
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <ImageIcon className="h-4 w-4 mr-1" />
                Featured Image
              </h3>
              
              {formData.featured_image ? (
                <div className="mb-3">
                  <div className="relative">
                    <img 
                      src={formData.featured_image.startsWith('/uploads/cms/') ? `/api${formData.featured_image}` : formData.featured_image} 
                      alt="Featured" 
                      className="w-full h-40 object-cover rounded border border-gray-300" 
                      onLoad={() => console.log('Featured image loaded successfully:', formData.featured_image)}
                      onError={(e) => {
                        console.error('Featured image failed to load, trying alternate paths:', formData.featured_image);
                        
                        // Try different combinations based on the path format
                        if (formData.featured_image.startsWith('/api/')) {
                          // Try without the /api prefix
                          const withoutApi = formData.featured_image.replace('/api', '');
                          e.target.src = withoutApi;
                          console.log('Trying without /api prefix:', withoutApi);
                        } else if (formData.featured_image.startsWith('/uploads/cms/')) {
                          // Try with /api prefix
                          e.target.src = `/api${formData.featured_image}`;
                          console.log('Trying with /api prefix:', `/api${formData.featured_image}`);
                        } else if (!formData.featured_image.startsWith('/')) {
                          // Try adding a leading slash
                          e.target.src = `/${formData.featured_image}`;
                          console.log('Trying with leading slash:', `/${formData.featured_image}`);
                        } else {
                          // Try direct API route to CMS uploads
                          const filename = formData.featured_image.split('/').pop();
                          if (filename) {
                            e.target.src = `/api/uploads/cms/${filename}`;
                            console.log('Trying direct CMS upload path:', `/api/uploads/cms/${filename}`);
                          }
                        }
                        
                        // Add a final error handler for fallback
                        e.target.onerror = () => {
                          console.error('All image load attempts failed, using placeholder');
                          e.target.src = '/images/placeholder-image.svg';
                          e.target.alt = 'Image not found';
                          e.target.onerror = null; // Prevent infinite loop
                        };
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1">
                      <span className="px-2 py-1 text-xs text-white font-semibold">Featured</span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <button
                      type="button"
                      className="text-sm text-red-600 hover:text-red-800 flex items-center"
                      onClick={() => setFeaturedImage('')}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                      Remove Image
                    </button>
                    <button
                      type="button"
                      className="text-sm text-teal-600 hover:text-teal-800 flex items-center"
                      onClick={() => {
                        // Scroll to media library
                        const mediaLibrary = document.getElementById('media-library');
                        if (mediaLibrary) {
                          mediaLibrary.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 4a1 1 0 00-2 0v7.268a2 2 0 000 3.464V16a1 1 0 102 0v-1.268a2 2 0 000-3.464V4zM11 4a1 1 0 10-2 0v1.268a2 2 0 000 3.464V16a1 1 0 102 0V8.732a2 2 0 000-3.464V4zM16 3a1 1 0 011 1v7.268a2 2 0 010 3.464V16a1 1 0 11-2 0v-1.268a2 2 0 010-3.464V4a1 1 0 011-1z" />
                      </svg>
                      Change Image
                    </button>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 break-all">
                    Image path: {formData.featured_image}
                  </div>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-3 cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition-colors"
                  onClick={() => {
                    // Scroll to media library
                    const mediaLibrary = document.getElementById('media-library');
                    if (mediaLibrary) {
                      mediaLibrary.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                >
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 mb-2">No featured image selected</p>
                    <button
                      type="button"
                      className="px-4 py-2 bg-teal-500 text-white rounded-md hover:bg-teal-600 transition-colors flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                      </svg>
                      Select Image
                    </button>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <label htmlFor="media-upload" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  Upload New Media
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-600">
                      Drag and drop file here, or click to select file
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Media Library - Always visible */}
            <div id="media-library" className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Media Library
                </h3>
                <button
                  type="button"
                  className="text-xs text-teal-600 hover:text-teal-800 flex items-center"
                  onClick={() => {
                    // Refresh media list
                    if (id) {
                      setIsLoading(true);
                      getPostMedia(id)
                        .then(mediaData => {
                          if (mediaData && mediaData.media) {
                            setMedia(mediaData.media);
                          }
                        })
                        .catch(err => {
                          console.error('Error refreshing media:', err);
                          setError('Failed to refresh media library');
                        })
                        .finally(() => {
                          setIsLoading(false);
                        });
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              <p className="text-xs text-gray-600 mb-2">Click on an image to set it as the featured image</p>
              
              {media.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {media.map((item) => (
                    <div 
                      key={item.id || item.file_path} 
                      className={`relative cursor-pointer border ${
                        formData.featured_image === item.file_path ? 'border-teal-500 ring-2 ring-teal-300' : 'border-gray-300'
                      } rounded overflow-hidden group transition-all duration-200 hover:shadow-md`}
                      onClick={() => setFeaturedImage(item.file_path)}
                    >
                      <div className="relative pb-[100%]">
                        <img 
                          src={item.url ? item.url : (item.file_path.startsWith('/uploads/cms/') ? `/api${item.file_path}` : item.file_path)}
                          alt={item.alt_text || 'Media'} 
                          className="absolute inset-0 w-full h-full object-cover" 
                          onLoad={() => console.log('Image loaded successfully:', item.file_path)}
                          onError={(e) => {
                            console.error('Image failed to load, trying alternate paths:', item.file_path);
                            
                            // Try different combinations based on the path format
                            if (item.file_path.startsWith('/api/')) {
                              // Try without the /api prefix
                              const withoutApi = item.file_path.replace('/api', '');
                              e.target.src = withoutApi;
                              console.log('Trying without /api prefix:', withoutApi);
                            } else if (item.file_path.startsWith('/uploads/cms/')) {
                              // Try with /api prefix
                              e.target.src = `/api${item.file_path}`;
                              console.log('Trying with /api prefix:', `/api${item.file_path}`);
                            } else if (!item.file_path.startsWith('/')) {
                              // Try adding a leading slash
                              e.target.src = `/${item.file_path}`;
                              console.log('Trying with leading slash:', `/${item.file_path}`);
                            } else {
                              // Try direct API route to CMS uploads
                              const filename = item.file_path.split('/').pop();
                              if (filename) {
                                e.target.src = `/api/uploads/cms/${filename}`;
                                console.log('Trying direct CMS upload path:', `/api/uploads/cms/${filename}`);
                              }
                            }
                            
                            // Add a second error handler for the final fallback
                            e.target.onerror = () => {
                              console.error('All image load attempts failed, using placeholder');
                              e.target.src = '/images/placeholder-image.svg';
                              e.target.alt = 'Image not found';
                              e.target.onerror = null; // Prevent infinite loop
                            };
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity"></div>
                      {formData.featured_image === item.file_path && (
                        <div className="absolute top-1 right-1 bg-teal-500 text-white text-xs p-1 rounded-full">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500">No media uploaded yet</p>
                  <p className="text-sm text-gray-400">Upload an image using the field above</p>
                </div>
              )}
              
              {media.length > 0 && (
                <div className="mt-3 text-xs text-gray-500 text-right">
                  {media.length} image{media.length !== 1 ? 's' : ''} in library
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this translation? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => setConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDeleteTranslation(confirmDelete)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostEditor;