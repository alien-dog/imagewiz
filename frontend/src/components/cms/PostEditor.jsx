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
  Trash2
} from 'lucide-react';
import { 
  getPost, 
  createPost, 
  updatePost, 
  getTags, 
  getLanguages, 
  uploadMedia,
  getPostMedia,
  deleteTranslation
} from '../../lib/cms-service';

// Improved WYSIWYG editor component with better text direction handling
const RichTextEditor = ({ value, onChange, languageCode }) => {
  const editorContainerRef = useRef(null);
  const editorRef = useRef(null);
  // Use expanded RTL check for all RTL languages
  const isRTL = ['ar', 'he', 'ur', 'fa'].includes(languageCode)
  
  // Initial setup and value update
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;
    
    // Only update content if it's different to avoid losing cursor position
    if (editor.innerHTML !== value) {
      editor.innerHTML = value || '';
    }
    
    // Apply text direction directly to the HTML element
    resetDirection();
    
    // Reset cursor to end after content update if focused
    if (document.activeElement === editor) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editor);
      range.collapse(false); // Collapse to end
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }, [value, languageCode]);
  
  // Reset text direction whenever language changes
  const resetDirection = () => {
    if (!editorRef.current) return;
    
    // Clear any existing direction to avoid conflicts
    editorRef.current.removeAttribute('style');
    
    // Apply new direction based on language
    const dirStyle = isRTL ? 'rtl' : 'ltr';
    const alignStyle = isRTL ? 'right' : 'left';
    
    // Set multiple direction attributes to ensure consistency
    editorRef.current.dir = dirStyle;
    editorRef.current.setAttribute('dir', dirStyle);
    
    // Force direction with inline styles (highest specificity)
    Object.assign(editorRef.current.style, {
      direction: dirStyle,
      textAlign: alignStyle,
      unicodeBidi: 'isolate', // Isolate bidirectional algorithm
    });
    
    // Additional important override
    editorRef.current.classList.remove(isRTL ? 'ltr-text' : 'rtl-text');
    editorRef.current.classList.add(isRTL ? 'rtl-text' : 'ltr-text');
  };
  
  // Apply formatting command
  const applyFormatting = (command, value = null) => {
    // Ensure editor has focus when applying formatting
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value || '');
      
      // Ensure text direction is maintained after formatting
      resetDirection();
      
      // Update onChange with new content after formatting
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Handle user input 
  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };
  
  // Handle focus to ensure correct direction
  const handleFocus = () => {
    resetDirection();
  };
  
  // Create link with proper handling
  const createLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      applyFormatting('createLink', url);
    }
  };

  // Use an extra wrapper with forced LTR for toolbar buttons
  return (
    <div className="border border-gray-300 rounded-md overflow-hidden" ref={editorContainerRef}>
      {/* Toolbar - always LTR regardless of content language */}
      <div className="bg-gray-100 p-2 border-b border-gray-300" style={{direction: 'ltr'}} dir="ltr">
        <div className="flex space-x-2">
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold"
            onClick={() => applyFormatting('bold')}
          >
            B
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic"
            onClick={() => applyFormatting('italic')}
          >
            I
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 underline"
            onClick={() => applyFormatting('underline')}
          >
            U
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
            onClick={() => applyFormatting('insertUnorderedList')}
          >
            • List
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
            onClick={() => applyFormatting('insertOrderedList')}
          >
            1. List
          </button>
          <button
            type="button"
            className="px-2 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50"
            onClick={createLink}
          >
            Link
          </button>
        </div>
      </div>
      
      {/* Editor area with language-specific direction */}
      <div
        ref={editorRef}
        contentEditable
        className={`p-3 min-h-[300px] focus:outline-none editor-content ${isRTL ? 'rtl-text' : 'ltr-text'}`}
        onInput={handleInput}
        onFocus={handleFocus}
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left',
          unicodeBidi: 'isolate',
        }}
      />
      
      {/* Hidden styles to ensure RTL/LTR works properly */}
      <style jsx="true">{`
        .ltr-text {
          direction: ltr !important;
          text-align: left !important;
          unicode-bidi: isolate !important;
        }
        .rtl-text {
          direction: rtl !important;
          text-align: right !important;
          unicode-bidi: isolate !important;
        }
      `}</style>
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
        
        setLanguages(languagesData.languages || []);
        setTags(tagsData.tags || []);
        
        // If we're editing an existing post, fetch it
        if (id) {
          const postData = await getPost(id);
          const mediaData = await getPostMedia(id);
          
          if (postData.post) {
            // Set the main form data from the post
            setFormData({
              title: postData.post.title || '',
              slug: postData.post.slug || '',
              content: postData.post.content || '',
              excerpt: postData.post.excerpt || '',
              meta_title: postData.post.meta_title || '',
              meta_description: postData.post.meta_description || '',
              featured_image: postData.post.featured_image || '',
              status: postData.post.status || 'draft',
              language_code: postData.post.language_code || 'en',
              tag_ids: (postData.post.tags || []).map(tag => tag.id)
            });
            
            // Set available translations
            setTranslations(postData.translations || []);
          }
          
          if (mediaData.media) {
            setMedia(mediaData.media);
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
      // When changing language, update the form with the new language
      setFormData({
        ...formData,
        language_code: value
      });
      
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
    if (!file) return;
    
    if (!id) {
      setError('Please save the post first before uploading media.');
      return;
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsLoading(true);
      const response = await uploadMedia(id, formData);
      
      if (response && response.media) {
        // Add the new media to the existing media array
        const newMedia = response.media;
        setMedia([...media, newMedia]);
        
        // Automatically set as featured image if it's the first upload
        if (!formData.featured_image && newMedia.file_path) {
          setFormData({
            ...formData,
            featured_image: newMedia.file_path
          });
        }
        
        setSuccess('Media uploaded successfully.');
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccess(null);
        }, 3000);
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      setError('Failed to upload media. Please try again.');
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
      } else {
        // Create new post
        const response = await createPost(postData);
        setSuccess('Post created successfully!');
        
        // Redirect to edit page if we just created a new post
        if (response.post && response.post.id) {
          navigate(`/cms/posts/${response.post.id}/edit`);
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
  
  const setFeaturedImage = (url) => {
    setFormData({
      ...formData,
      featured_image: url
    });
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
              <RichTextEditor
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
                <select
                  id="language_code"
                  name="language_code"
                  value={formData.language_code}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Translations */}
            {id && translations.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Translations</h3>
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
              <select
                multiple
                id="tag_ids"
                name="tag_ids"
                value={formData.tag_ids}
                onChange={handleTagChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                size={Math.min(tags.length, 5)}
              >
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Hold Ctrl/Cmd to select multiple tags
              </p>
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
                  <img 
                    src={formData.featured_image} 
                    alt="Featured" 
                    className="w-full h-40 object-cover rounded border border-gray-300" 
                  />
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                    onClick={() => setFormData({ ...formData, featured_image: '' })}
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center mb-3">
                  <p className="text-gray-500">No featured image selected</p>
                </div>
              )}
              
              {id && (
                <div>
                  <label htmlFor="media-upload" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload New Media
                  </label>
                  <input
                    type="file"
                    id="media-upload"
                    accept="image/*"
                    onChange={handleMediaUpload}
                    className="w-full"
                  />
                </div>
              )}
            </div>
            
            {/* Display uploaded media */}
            {id && media.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-700 mb-3">Media Library</h3>
                <div className="grid grid-cols-2 gap-2">
                  {media.map((item) => (
                    <div 
                      key={item.id} 
                      className={`relative cursor-pointer border ${
                        formData.featured_image === item.file_path ? 'border-teal-500' : 'border-gray-300'
                      } rounded overflow-hidden group`}
                      onClick={() => setFeaturedImage(item.file_path)}
                    >
                      <img 
                        src={item.url || item.file_path} 
                        alt={item.alt_text || 'Media'} 
                        className="w-full h-20 object-cover" 
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
                        {formData.featured_image === item.file_path && (
                          <div className="bg-teal-500 text-white text-xs px-2 py-1 rounded-full">
                            Featured
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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