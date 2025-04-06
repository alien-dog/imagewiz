import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Tag as TagIcon, ChevronRight } from 'lucide-react';
import { getBlogPosts } from '../../lib/cms-service';

const BlogList = ({ language = 'en', tag = '', limit = 6 }) => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
  }, [language, tag, currentPage, limit]);

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
      
      const response = await getBlogPosts(params);
      setPosts(response.posts || []);
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

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading && posts.length === 0) {
    return (
      <div className="w-full py-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-12 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={fetchPosts}
          className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Posts Found</h3>
        <p className="text-gray-500">
          {tag 
            ? `No posts found for tag: ${tag}`
            : 'No blog posts available at the moment. Please check back later.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <div 
            key={post.id} 
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {post.featured_image && (
              <div className="h-48 overflow-hidden">
                <img 
                  src={post.featured_image} 
                  alt={post.title} 
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <div className="p-5">
              <div className="flex items-center text-sm text-gray-500 mb-2">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{formatDate(post.created_at)}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-2 text-gray-800 hover:text-teal-600 transition-colors">
                <a 
                  href={`/blog/${post.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/blog/${post.slug}`);
                  }}
                >
                  {post.title}
                </a>
              </h3>
              
              <div 
                className="text-gray-600 mb-4 text-sm"
                dangerouslySetInnerHTML={{ __html: truncateText(post.excerpt || post.content) }}
              />
              
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag) => (
                    <span 
                      key={tag.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
                    >
                      <TagIcon className="h-3 w-3 mr-1" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
              
              <a 
                href={`/blog/${post.slug}`}
                className="inline-flex items-center text-teal-600 hover:text-teal-800 font-medium text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  navigate(`/blog/${post.slug}`);
                }}
              >
                Read More
                <ChevronRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div className="flex">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 mx-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-4 py-2 mx-1 rounded-md ${
                  currentPage === page
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 mx-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-teal-500 text-white hover:bg-teal-600'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogList;