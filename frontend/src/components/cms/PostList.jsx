import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2,
  Plus,
  Languages,
  Loader2,
  Flag
} from 'lucide-react';
import { 
  getPosts, 
  deletePost, 
  getLanguages, 
  autoTranslateAllPosts, 
  forceTranslateEsFr,
  translateMissingLanguages
} from '../../lib/cms-service';
import { SUPPORTED_LANGUAGES } from '../../i18n/i18n';

const PostList = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    language: '',
    status: '',
    tag: ''
  });
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Load languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const languagesData = await getLanguages();
        console.log('CMS languages response:', languagesData);
        console.log('Number of languages returned:', Array.isArray(languagesData) ? languagesData.length : 0);
        
        // Only use active languages
        const activeLanguages = Array.isArray(languagesData) ? 
          languagesData.filter(lang => lang.is_active) : [];
        console.log('Number of active languages:', activeLanguages.length);
        
        setLanguages(activeLanguages);
      } catch (err) {
        console.error('Error fetching languages:', err);
      }
    };
    
    fetchLanguages();
  }, []);

  // Load posts on component mount and when filters change
  useEffect(() => {
    fetchPosts();
  }, [filters]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const activeFilters = Object.entries(filters)
        .filter(([_, value]) => value !== '')
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
      
      console.log('Fetching posts with filters:', activeFilters);
      const data = await getPosts(activeFilters);
      console.log('API response for posts:', data);
      
      // API returns either an array directly or an object with posts property
      const processedData = Array.isArray(data) ? data : (data.posts || []);
      console.log('Processed posts data:', processedData);
      
      // Log more detailed information about the posts and their translations
      if (processedData.length > 0) {
        console.log('First post translations:', 
          processedData[0].translations 
            ? `${processedData[0].translations.length} translations` 
            : 'No translations array');
            
        console.log('Available languages in first post:', 
          processedData[0].translations 
            ? processedData[0].translations.map(t => t.language_code).join(', ') 
            : 'None');
      }
      
      setPosts(processedData);
      setError(null);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPosts();
  };

  const handleDelete = async (id) => {
    try {
      await deletePost(id);
      setPosts(posts.filter(post => post.id !== id));
      setShowConfirmDelete(null);
      setSuccessMessage('Post successfully deleted');
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post. Please try again.');
    }
  };
  
  const handleAutoTranslateAll = async (forceTranslate = false) => {
    if (posts.length === 0) {
      setError('No posts available for translation');
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Call the auto-translate-all API endpoint
      const response = await autoTranslateAllPosts({ force_translate: forceTranslate });
      console.log('Auto-translate all response:', response);
      
      // Refresh posts to get the updated data
      await fetchPosts();
      
      // Display a detailed success message with statistics
      const totalPosts = response.results?.total_posts || 0;
      const successfulPosts = response.results?.successfully_translated_posts || 0;
      const translatedLangs = response.results?.translated_languages || 0;
      const skippedLangs = response.results?.skipped_languages || 0;
      
      setSuccessMessage(
        `Auto-translation completed: ${successfulPosts}/${totalPosts} posts translated to ${translatedLangs} languages. ${skippedLangs} translations skipped.`
      );
      
      // Clear success message after a longer period (this is a more significant operation)
      setTimeout(() => {
        setSuccessMessage('');
      }, 8000);
    } catch (err) {
      console.error('Error auto-translating all posts:', err);
      setError(`Failed to auto-translate posts: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };
  
  const handleTranslateMissingLanguages = async () => {
    if (posts.length === 0) {
      setError('No posts available for translation');
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Call the translate missing languages API endpoint
      const response = await translateMissingLanguages();
      console.log('Translate missing languages response:', response);
      
      // Refresh posts to get the updated data
      await fetchPosts();
      
      // Display a detailed success message with statistics
      const totalPosts = response.results?.total_posts || 0;
      const successfulPosts = response.results?.successfully_translated_posts || 0;
      const translatedLangs = response.results?.translated_languages || 0;
      const skippedLangs = response.results?.skipped_languages || 0;
      
      setSuccessMessage(
        `Missing languages translation completed: ${successfulPosts}/${totalPosts} posts translated to ${translatedLangs} languages. ${skippedLangs} translations skipped.`
      );
      
      // Clear success message after a longer period (this is a more significant operation)
      setTimeout(() => {
        setSuccessMessage('');
      }, 8000);
    } catch (err) {
      console.error('Error translating missing languages:', err);
      setError(`Failed to translate posts to missing languages: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleForceTranslateEsFr = async () => {
    if (posts.length === 0) {
      setError('No posts available for translation');
      return;
    }
    
    setIsTranslating(true);
    setError(null);
    
    try {
      // Call the force-translate-es-fr API endpoint
      const response = await forceTranslateEsFr();
      console.log('Force translate ES/FR response:', response);
      
      // Refresh posts to get the updated data
      await fetchPosts();
      
      // Display a success message with statistics
      const created = response.results?.created || {};
      const updated = response.results?.updated || {};
      const createdES = created.es || 0;
      const createdFR = created.fr || 0;
      const updatedES = updated.es || 0;
      const updatedFR = updated.fr || 0;
      
      setSuccessMessage(
        `Spanish/French translation completed: Created ${createdES + createdFR} and updated ${updatedES + updatedFR} translations.`
      );
      
      // Clear success message after a period
      setTimeout(() => {
        setSuccessMessage('');
      }, 8000);
    } catch (err) {
      console.error('Error translating to ES/FR:', err);
      setError(`Failed to translate posts to Spanish/French: ${err.message || 'Unknown error'}`);
    } finally {
      setIsTranslating(false);
    }
  };

  // Process posts to expand all translations when "All Languages" is selected
  const processedPosts = useMemo(() => {
    // If a specific language is selected, return the original posts
    if (filters.language) {
      console.log('Using language filter, not expanding posts');
      return posts;
    }
    
    console.log('ALL languages selected - expanding posts with translations');
    
    // Create a new array to hold all the expanded posts
    const expandedPosts = [];
    
    // For each post, directly create separate rows for each translation
    posts.forEach(post => {
      console.log(`Processing post ${post.id}, has translations:`, 
                  post.translations ? post.translations.length : 0);
      
      // Only expand if the post has translations
      if (post.translations && post.translations.length > 0) {
        // Add one row for each translation
        post.translations.forEach(translation => {
          expandedPosts.push({
            ...post,
            translation: translation,
            // Keep original translations reference
            // Add marker for this virtual post
            isVirtualTranslation: true,
            virtualId: `${post.id}-${translation.language_code}`
          });
          console.log(`Added virtual post for post ${post.id}, language: ${translation.language_code}`);
        });
      } else {
        // If no translations, just add the post as is
        expandedPosts.push(post);
        console.log(`Post ${post.id} has no translations, adding as-is`);
      }
    });
    
    console.log(`Expanded ${posts.length} posts into ${expandedPosts.length} rows`);
    return expandedPosts;
  }, [posts, filters.language]);

  const filteredPosts = processedPosts.filter(post => {
    if (!searchTerm) return true;
    
    // Search in post slug
    if (post.slug.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Search in translations if they exist
    // First try the 'translation' property (single translation)
    if (post.translation && post.translation.title &&
        post.translation.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Then try the 'translations' array (multiple translations)
    if (!post.isVirtualTranslation && post.translations && post.translations.length > 0) {
      return post.translations.some(translation => 
        translation.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return false;
  });

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusClasses = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-gray-100 text-gray-800',
      archived: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusClasses[status] || 'bg-gray-100'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Posts</h1>
        <div className="flex space-x-3">
          <button
            className="bg-teal-50 text-teal-700 hover:bg-teal-100 px-4 py-2 rounded flex items-center border border-teal-200"
            onClick={() => handleAutoTranslateAll(false)}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Auto-Translate All Posts
              </>
            )}
          </button>
          <button
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 px-4 py-2 rounded flex items-center border border-purple-200"
            onClick={handleTranslateMissingLanguages}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Languages className="h-4 w-4 mr-2" />
                Translate Missing Languages
              </>
            )}
          </button>
          <button
            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-4 py-2 rounded flex items-center border border-blue-200"
            onClick={handleForceTranslateEsFr}
            disabled={isTranslating}
          >
            {isTranslating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Flag className="h-4 w-4 mr-2" />
                Force ES/FR Only
              </>
            )}
          </button>
          <button
            className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded flex items-center"
            onClick={() => navigate('/cms/posts/new')}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </button>
        </div>
      </div>

      {/* Auto-translate options */}
      {isTranslating && (
        <div className="bg-blue-50 text-blue-700 px-4 py-3 rounded flex items-center">
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          <div>
            <p className="font-medium">Auto-translating posts to all languages...</p>
            <p className="text-sm mt-1">This may take a minute. Please don't leave this page until it's complete.</p>
          </div>
        </div>
      )}
      
      {/* Search and Filter Bar */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search posts..."
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center">
              <Filter className="h-5 w-5 mr-1 text-gray-500" />
              <select
                className="border border-gray-300 rounded py-2 px-3"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            
            <div>
              <select
                className="border border-gray-300 rounded py-2 px-3"
                value={filters.language}
                onChange={(e) => setFilters({...filters, language: e.target.value})}
              >
                <option value="">All Languages</option>
                {languages.map(lang => {
                  // Find matching language from the website's language list for flags and native names
                  const websiteLang = SUPPORTED_LANGUAGES.find(l => l.code === lang.code);
                  return (
                    <option key={lang.code} value={lang.code}>
                      {websiteLang ? 
                        `${websiteLang.flag} ${websiteLang.nativeName || websiteLang.name}` : 
                        (lang.flag ? `${lang.flag} ${lang.native_name || lang.name}` : lang.name)
                      }
                    </option>
                  );
                })}
              </select>
            </div>
            
            <button 
              type="button"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 p-2 rounded"
              onClick={fetchPosts}
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            
            {!isTranslating && (
              <div className="flex space-x-3">
                <button
                  type="button"
                  className="text-xs text-teal-600 hover:text-teal-800 underline flex items-center"
                  onClick={() => handleAutoTranslateAll(true)}
                >
                  <Languages className="h-3 w-3 mr-1" />
                  Force refresh all translations
                </button>
                <button
                  type="button"
                  className="text-xs text-purple-600 hover:text-purple-800 underline flex items-center"
                  onClick={handleTranslateMissingLanguages}
                >
                  <Languages className="h-3 w-3 mr-1" />
                  Translate missing languages only
                </button>
                <button
                  type="button"
                  className="text-xs text-blue-600 hover:text-blue-800 underline flex items-center"
                  onClick={handleForceTranslateEsFr}
                >
                  <Flag className="h-3 w-3 mr-1" />
                  Force ES/FR translations only
                </button>
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-50 text-green-700 px-4 py-3 rounded flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 text-red-700 px-4 py-3 rounded flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      {/* Loading or No Posts Message */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-t-teal-500 border-r-teal-500 border-b-transparent border-l-transparent"></div>
          <p className="mt-2 text-gray-600">Loading posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No posts found. Create a new post to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.isVirtualTranslation ? post.virtualId : post.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {post.translation ? post.translation.title : 
                       (post.translations && post.translations.length > 0 ? 
                        post.translations[0].title : 'Untitled')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{post.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {post.translation ? post.translation.language_code : 
                       (post.translations && post.translations.length > 0 ? 
                        post.translations[0].language_code : '-')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={post.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {new Date(post.updated_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-teal-600 hover:text-teal-900"
                        onClick={() => navigate(`/cms/posts/${post.id}/edit`)}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => navigate(`/blog/${post.slug}`)}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => setShowConfirmDelete(post.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this post? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
                onClick={() => setShowConfirmDelete(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(showConfirmDelete)}
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

export default PostList;