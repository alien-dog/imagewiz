import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Tag as TagIcon, 
  ArrowLeft, 
  Share2, 
  Globe,
  AlertCircle
} from 'lucide-react';
import { getPostBySlug } from '../../lib/cms-service';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en'); // Default language

  useEffect(() => {
    if (slug) {
      fetchPost(currentLanguage);
    }
  }, [slug, currentLanguage]);

  const fetchPost = async (language) => {
    setLoading(true);
    try {
      const response = await getPostBySlug(slug, language);
      setPost(response.post);
      setAvailableLanguages(response.available_languages || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching blog post:', err);
      setError('Could not load this blog post. It may have been removed or is unavailable.');
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

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt || 'Check out this blog post',
        url: window.location.href,
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch(error => console.error('Error copying to clipboard:', error));
    }
  };

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
  };

  if (loading && !post) {
    return (
      <div className="w-full py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">Post Not Found</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blog')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Blog
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">Post Not Found</h2>
        <p className="text-gray-500 mb-6">
          The blog post you're looking for doesn't exist or has been removed.
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Return to Blog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Back to Blog Link */}
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center text-gray-600 hover:text-teal-600 mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Blog
      </button>

      {/* Language Selector */}
      {availableLanguages.length > 1 && (
        <div className="mb-6 flex items-center">
          <Globe className="h-5 w-5 text-gray-400 mr-2" />
          <div className="flex space-x-2">
            {availableLanguages.map(lang => (
              <button
                key={lang.code}
                className={`px-3 py-1 text-sm rounded ${
                  currentLanguage === lang.code
                    ? 'bg-teal-100 text-teal-800 font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => changeLanguage(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Featured Image */}
      {post.featured_image && (
        <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
          <img
            src={post.featured_image}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Post Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">{post.title}</h1>
        
        <div className="flex flex-wrap items-center text-gray-500 text-sm mb-4">
          <div className="flex items-center mr-6 mb-2">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          
          <button
            onClick={handleShareClick}
            className="flex items-center text-teal-600 hover:text-teal-800 mb-2"
          >
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </button>
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.tags.map(tag => (
              <button
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 hover:bg-teal-200"
                onClick={() => navigate(`/blog/tag/${tag.slug}`)}
              >
                <TagIcon className="h-3 w-3 mr-1" />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Content */}
      <div className="prose prose-lg max-w-none">
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </div>

      {/* Author Section */}
      {post.author && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">About the Author</h3>
          <div className="flex items-center">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-12 h-12 rounded-full mr-4"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                <span className="text-teal-700 font-semibold text-lg">
                  {post.author.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-medium text-gray-800">{post.author.name}</div>
              {post.author.bio && (
                <p className="text-sm text-gray-600">{post.author.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Related Posts */}
      {post.related_posts && post.related_posts.length > 0 && (
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Related Posts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {post.related_posts.map(relatedPost => (
              <div 
                key={relatedPost.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow overflow-hidden"
              >
                {relatedPost.featured_image && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-800 mb-2 hover:text-teal-600">
                    <a 
                      href={`/blog/${relatedPost.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/blog/${relatedPost.slug}`);
                      }}
                    >
                      {relatedPost.title}
                    </a>
                  </h4>
                  <div className="text-xs text-gray-500">
                    {formatDate(relatedPost.created_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;