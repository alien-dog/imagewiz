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
  getLanguages
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

  // Process posts to expand all translations when "All Languages" is selected
  const processedPosts = useMemo(() => {
    // When language filter is applied, the API already returns the correct posts
    // We just need to format them correctly for display
    if (filters.language) {
      console.log('Using language filter, not expanding posts');
      
      // Filter posts to only include those that actually have the requested translation
      // This is the critical fix for the language filtering issue
      const filteredPosts = posts.filter(post => {
        // First check if the post has a direct translation
        if (post.translation && post.translation.language_code === filters.language) {
          return true;
        }
        // If no direct translation, check if we can find one in the translations array
        if (post.translations && post.translations.length > 0) {
          return post.translations.some(t => t.language_code === filters.language);
        }
        return false;
      });
      
      console.log(`Filtered ${posts.length} posts to ${filteredPosts.length} for language ${filters.language}`);
      
      // Now format the filtered posts properly for display
      return filteredPosts.map(post => {
        // Check if this post already has the correct translation set
        if (post.translation && post.translation.language_code === filters.language) {
          return post;
        }
        
        // Otherwise, find the matching translation from the translations array
        if (post.translations && post.translations.length > 0) {
          const matchingTranslation = post.translations.find(
            t => t.language_code === filters.language
          );
          
          if (matchingTranslation) {
            // Create a virtual post with this translation
            return {
              ...post,
              translation: matchingTranslation,
              isVirtualTranslation: true,
              virtualId: `${post.id}-${matchingTranslation.language_code}`
            };
          }
        }
        
        // Should never reach here due to our filtering above
        return post;
      });
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
    // Apply search filter if there is a search term
    if (!searchTerm) return true;
    
    // Search in post slug
    if (post.slug && post.slug.toLowerCase().includes(searchTerm.toLowerCase())) {
      return true;
    }
    
    // Search in main post title if it exists
    if (post.title && post.title.toLowerCase().includes(searchTerm.toLowerCase())) {
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
            
            {/* Translation buttons removed as requested */}
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