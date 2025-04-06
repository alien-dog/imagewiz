import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag as TagIcon, ChevronRight, Clock, User, ArrowRight } from 'lucide-react';
import { getBlogPosts } from '../../lib/cms-service';

const BlogList = ({ language = 'en', tag = '', search = '', limit = 6 }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    fetchPosts();
  }, [language, tag, search, currentPage, limit]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = {
        language,
        page: currentPage,
        limit,
      };
      
      if (tag) {
        params.tag = tag;
      }
      
      if (search) {
        params.search = search;
      }
      
      const response = await getBlogPosts(params);
      const allPosts = response.posts || [];
      
      // Set a featured post only on the first page when no filters are applied
      if (currentPage === 1 && !tag && !search && allPosts.length > 0) {
        setFeaturedPost(allPosts[0]);
        setPosts(allPosts.slice(1));
      } else {
        setFeaturedPost(null);
        setPosts(allPosts);
      }
      
      setTotalPages(response.total_pages || 1);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog posts:', err);
      setError('Could not load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReadTime = (content) => {
    if (!content) return '3 min read';
    
    // Average reading speed: 200 words per minute
    const wordCount = content.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    return `${readTimeMinutes} min read`;
  };

  const truncateText = (text, maxLength = 160) => {
    if (!text) return '';
    
    // Remove any HTML tags for the excerpt
    const strippedText = text.replace(/<[^>]*>?/gm, '');
    
    if (strippedText.length <= maxLength) return strippedText;
    
    // Find the last space before the maxLength to avoid cutting words
    const lastSpace = strippedText.lastIndexOf(' ', maxLength);
    return strippedText.substring(0, lastSpace > 0 ? lastSpace : maxLength) + '...';
  };

  const renderLoadingState = () => {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-500">Loading articles...</p>
      </div>
    );
  };

  const renderErrorState = () => {
    return (
      <div className="w-full py-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 inline-block">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchPosts}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => {
    return (
      <div className="w-full py-12 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 inline-block max-w-lg">
          <h3 className="text-xl font-semibold text-gray-700 mb-3">No Articles Found</h3>
          <p className="text-gray-500 mb-6">
            {tag 
              ? `No posts found for the selected category. Try a different filter.`
              : search
                ? `No results found for "${search}". Try a different search term.`
                : 'No blog posts available at the moment. Please check back later.'}
          </p>
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium"
          >
            Browse all articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const handlePostClick = (slug) => {
    navigate(`/blog/${slug}`);
  };

  const renderFeaturedPost = () => {
    if (!featuredPost) return null;
    
    return (
      <div className="mb-12">
        <div 
          className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer flex flex-col md:flex-row"
          onClick={() => handlePostClick(featuredPost.slug)}
        >
          <div className="md:w-1/2 h-64 md:h-auto overflow-hidden bg-gray-100">
            {featuredPost.featured_image ? (
              <img 
                src={featuredPost.featured_image} 
                alt={featuredPost.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-gradient-to-r from-teal-500 to-teal-600 text-white">
                <span className="text-2xl font-bold">iMagenWiz</span>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center mb-4">
                <span className="bg-teal-100 text-teal-800 text-xs font-semibold mr-2 px-3 py-1 rounded-full">Featured</span>
                {featuredPost.tags && featuredPost.tags[0] && (
                  <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                    {featuredPost.tags[0].name}
                  </span>
                )}
              </div>
              
              <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-teal-600 transition-colors">
                {featuredPost.title}
              </h2>
              
              <p className="text-gray-600 mb-6">
                {truncateText(featuredPost.excerpt || featuredPost.content, 240)}
              </p>
            </div>
            
            <div className="flex items-center text-sm text-gray-500 mt-auto">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span className="mr-4">{featuredPost.author?.name || 'iMagenWiz Team'}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span className="mr-4">{formatDate(featuredPost.created_at)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{formatReadTime(featuredPost.content)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPostCard = (post) => {
    return (
      <article 
        key={post.id} 
        className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full cursor-pointer"
        onClick={() => handlePostClick(post.slug)}
      >
        <div className="h-48 overflow-hidden bg-gray-100">
          {post.featured_image ? (
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-teal-400 to-teal-600 text-white">
              <span className="text-xl font-bold">iMagenWiz</span>
            </div>
          )}
        </div>
        
        <div className="p-5 flex-grow flex flex-col">
          <div className="mb-2 flex flex-wrap gap-2">
            {post.tags && post.tags.slice(0, 2).map((tag) => (
              <span 
                key={tag.id}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag.name}
              </span>
            ))}
          </div>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-teal-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          
          <p className="text-gray-600 mb-4 text-sm line-clamp-3 flex-grow">
            {truncateText(post.excerpt || post.content)}
          </p>
          
          <div className="flex items-center justify-between text-sm text-gray-500 mt-auto pt-4 border-t border-gray-100">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{formatDate(post.created_at)}</span>
            </div>
            
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{formatReadTime(post.content)}</span>
            </div>
          </div>
        </div>
      </article>
    );
  };

  if (loading && posts.length === 0 && !featuredPost) {
    return renderLoadingState();
  }

  if (error) {
    return renderErrorState();
  }

  if (posts.length === 0 && !featuredPost) {
    return renderEmptyState();
  }

  return (
    <div className="w-full">
      {/* Featured Post (only on first page with no filters) */}
      {featuredPost && renderFeaturedPost()}
      
      {/* Blog Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {posts.map(renderPostCard)}
      </div>

      {/* Loading More Indicator */}
      {loading && posts.length > 0 && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <nav className="flex items-center bg-white px-4 py-3 rounded-lg shadow-sm border border-gray-200" aria-label="Pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`mr-3 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              <svg className="mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Previous
            </button>
            
            <div className="hidden md:inline-flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`mx-1 inline-flex items-center px-4 py-2 rounded-md text-sm font-medium ${
                    currentPage === page
                      ? 'bg-teal-500 text-white'
                      : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <div className="md:hidden">
              <span className="text-gray-700 text-sm">
                Page {currentPage} of {totalPages}
              </span>
            </div>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`ml-3 inline-flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                currentPage === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-teal-50 hover:text-teal-700'
              }`}
            >
              Next
              <svg className="ml-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default BlogList;