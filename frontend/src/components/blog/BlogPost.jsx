import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Calendar, 
  Tag as TagIcon, 
  ArrowLeft, 
  Share2, 
  Globe,
  AlertCircle,
  ChevronRight,
  Clock,
  User,
  Link as LinkIcon,
  BookOpen,
  Facebook,
  Twitter,
  Linkedin
} from 'lucide-react';
import { getBlogPostBySlug } from '../../lib/cms-service';
import BlogImage from './BlogImage';

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation('blog');
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language); // Use i18n language
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [estimatedReadTime, setEstimatedReadTime] = useState('');

  // Update currentLanguage when the app language changes
  useEffect(() => {
    setCurrentLanguage(i18n.language);
  }, [i18n.language]);

  useEffect(() => {
    if (slug) {
      fetchPost(currentLanguage);
    }
  }, [slug, currentLanguage]);

  const fetchPost = async (language) => {
    setLoading(true);
    try {
      const response = await getBlogPostBySlug(slug, language);
      const postData = response.post;
      setPost(postData);
      setAvailableLanguages(response.available_languages || []);
      setError(null);
      
      // Calculate estimated reading time
      if (postData && postData.content) {
        setEstimatedReadTime(formatReadTime(postData.content));
      }
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

  const formatReadTime = (content) => {
    if (!content) return '5 min read';
    
    // Average reading speed: 200 words per minute
    const plainText = content.replace(/<[^>]*>?/gm, '');
    const wordCount = plainText.split(/\s+/).length;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    
    return `${readTimeMinutes} min read`;
  };

  const handleShareClick = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.meta_description || 'Check out this blog post',
        url: window.location.href,
      })
      .catch(error => console.error('Error sharing:', error));
    } else {
      setShowShareTooltip(true);
      navigator.clipboard.writeText(window.location.href)
        .then(() => {
          setTimeout(() => setShowShareTooltip(false), 3000);
        })
        .catch(error => console.error('Error copying to clipboard:', error));
    }
  };

  const handleSocialShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(post.title);
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  // Handle language changes for blog content
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    
    // If the language is supported by i18n, update the global language as well
    if (i18n.languages.includes(language)) {
      // Import from i18n/i18n.js to ensure consistent language changes
      import('../../i18n/i18n').then(({ changeLanguage: globalChangeLanguage }) => {
        globalChangeLanguage(language);
      });
    }
  };
  
  // Listen for global language changes
  useEffect(() => {
    // When the global language changes, update the article language if possible
    const onLanguageChanged = () => {
      const globalLang = i18n.language;
      // Only change if the current post is available in the new language
      if (availableLanguages.some(lang => lang.code === globalLang)) {
        setCurrentLanguage(globalLang);
      }
    };
    
    i18n.on('languageChanged', onLanguageChanged);
    return () => {
      i18n.off('languageChanged', onLanguageChanged);
    };
  }, [i18n, availableLanguages]);

  const getTocFromContent = () => {
    if (!post || !post.content) return [];
    
    const content = post.content;
    const headingMatches = [...content.matchAll(/<h[2-3][^>]*>(.*?)<\/h[2-3]>/g)];
    
    return headingMatches.map((match, index) => {
      const text = match[1].replace(/<[^>]*>?/gm, ''); // Remove any HTML tags from heading
      const level = match[0].startsWith('<h2') ? 2 : 3;
      const id = `heading-${index}`;
      
      return { id, text, level };
    });
  };

  const renderLoading = () => {
    return (
      <div className="w-full py-16 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mb-4"></div>
        <p className="text-gray-500">{t('status.loading', 'Loading article...')}</p>
      </div>
    );
  };

  const renderError = () => {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-700 mb-2">{t('status.error', 'Error Loading Article')}</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/blog')}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            {t('relatedPosts.browseAll', 'Browse All Articles')}
          </button>
        </div>
      </div>
    );
  };

  const renderNotFound = () => {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">{t('status.notFound', 'Article Not Found')}</h2>
        <p className="text-gray-500 mb-6">
          {t('status.notFoundDesc', 'The blog post you\'re looking for doesn\'t exist or has been removed.')}
        </p>
        <button
          onClick={() => navigate('/blog')}
          className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg transition-colors"
        >
          {t('relatedPosts.browseAll', 'Browse All Articles')}
        </button>
      </div>
    );
  };

  if (loading && !post) {
    return renderLoading();
  }

  if (error) {
    return renderError();
  }

  if (!post) {
    return renderNotFound();
  }

  // Generate table of contents
  const tableOfContents = getTocFromContent();

  // Process content to add heading IDs for better SEO and navigation
  const enhanceContentForSEO = () => {
    if (!post || !post.content) return post.content || '';
    
    // Replace headings with properly ID'd headings for anchor links
    let processedContent = post.content;
    
    // Step 1: Enhance headings with IDs and anchor links
    const headingMatches = [...post.content.matchAll(/<h([2-3])[^>]*>(.*?)<\/h\1>/g)];
    
    headingMatches.forEach((match, index) => {
      const fullMatch = match[0];
      const headingLevel = match[1];
      const headingText = match[2].replace(/<[^>]*>?/gm, ''); // Remove any HTML tags
      const headingId = `heading-${index}`;
      const slug = headingText.toLowerCase().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
      
      // Replace with properly ID'd heading with additional semantic markup
      const newHeading = `<h${headingLevel} id="${headingId}" data-slug="${slug}" class="group flex items-center">${headingText}<a href="#${headingId}" class="ml-2 opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Link to this section"><svg class="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg></a></h${headingLevel}>`;
      
      processedContent = processedContent.replace(fullMatch, newHeading);
    });
    
    // Step 2: Process image tags to ensure proper loading and fallbacks
    // This wraps standard <img> tags with additional attributes for better loading behavior
    const imgMatches = [...processedContent.matchAll(/<img\s+[^>]*src=["']([^"']+)["'][^>]*\/?>/g)];
    
    imgMatches.forEach((match) => {
      const fullImgTag = match[0];
      const imgSrc = match[1];
      
      // Extract alt text if present
      const altMatch = fullImgTag.match(/alt=["']([^"']*)["']/);
      const altText = altMatch ? altMatch[1] : '';
      
      // Extract any classes if present
      const classMatch = fullImgTag.match(/class=["']([^"']*)["']/);
      const imgClass = classMatch ? classMatch[1] : '';
      
      // Create a more robust image tag with loading attributes
      const enhancedImg = `<img 
        src="${imgSrc}" 
        alt="${altText}" 
        class="${imgClass} rounded shadow-sm" 
        loading="lazy" 
        onerror="this.onerror=null; 
                 if (!this.src.includes('?fallback=true')) {
                   // Try alternative path patterns
                   const filename = this.src.split('/').pop();
                   if (this.src.includes('/uploads/blog/')) {
                     this.src = '/blog/' + filename + '?fallback=true';
                   } else if (this.src.includes('/blog/')) {
                     this.src = '/uploads/blog/' + filename + '?fallback=true';
                   } else if (this.src.includes('/static/uploads/blog/')) {
                     this.src = '/uploads/blog/' + filename + '?fallback=true';
                   } else {
                     this.src = '/uploads/blog/' + filename + '?fallback=true';
                   }
                 } else {
                   this.style.display = 'none';
                 }"
      />`;
      
      processedContent = processedContent.replace(fullImgTag, enhancedImg);
    });
    
    return processedContent;
  };

  // Create proper metadata for SEO
  const blogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": post.featured_image || "",
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "author": {
      "@type": "Person",
      "name": post.author?.name || t('author.defaultName', "iMagenWiz Team")
    },
    "publisher": {
      "@type": "Organization",
      "name": "iMagenWiz",
      "logo": {
        "@type": "ImageObject",
        "url": "/logo.png"
      }
    },
    "description": post.meta_description || "",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  };

  return (
    <div className="pb-16">
      {/* Add structured data for SEO */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostStructuredData) }} />
      
      {/* Hero Section with Featured Image */}
      <div className="bg-gradient-to-b from-teal-500/10 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
          {/* Back to Blog Link */}
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center text-gray-600 hover:text-teal-600 mb-8 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm"
            aria-label="Return to blog homepage"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('relatedPosts.backToAll', 'Back to All Articles')}
          </button>
          
          {/* Language Selector */}
          {availableLanguages.length > 1 && (
            <div className="mb-6 flex items-center">
              <Globe className="h-5 w-5 text-teal-500 mr-2" />
              <div className="flex space-x-2" role="group" aria-label="Language selector">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    className={`px-3 py-1 text-sm rounded-full shadow-sm ${
                      currentLanguage === lang.code
                        ? 'bg-teal-100 text-teal-800 font-medium border border-teal-200'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => changeLanguage(lang.code)}
                    aria-label={`Switch to ${lang.name}`}
                    aria-pressed={currentLanguage === lang.code}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <article className="max-w-4xl mx-auto px-4 sm:px-6 -mt-6" itemScope itemType="https://schema.org/BlogPosting">
        {/* Hidden SEO metadata */}
        <meta itemProp="headline" content={post.title} />
        <meta itemProp="author" content={post.author?.name || t('author.defaultName', "iMagenWiz Team")} />
        <meta itemProp="datePublished" content={post.published_at || post.created_at} />
        <meta itemProp="dateModified" content={post.updated_at || post.created_at} />
        <meta itemProp="image" content={post.featured_image || ""} />
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-5">
            {post.tags.map(tag => (
              <button
                key={tag.id}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors border border-teal-100 shadow-sm"
                onClick={() => navigate(`/blog?tag=${tag.slug}`)}
                aria-label={`View all posts with tag: ${tag.name}`}
              >
                <TagIcon className="h-3 w-3 mr-1.5" />
                {tag.name}
              </button>
            ))}
          </div>
        )}
        
        {/* Post Header */}
        <header className="mb-8">
          <h1 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-6 leading-tight" 
            itemProp="headline"
          >
            {post.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 md:gap-6 items-center text-gray-500 text-sm mb-6">
            {post.author && (
              <div className="flex items-center" itemProp="author" itemScope itemType="https://schema.org/Person">
                <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center mr-3 border-2 border-white shadow-sm">
                  <span className="text-teal-700 font-semibold text-lg">
                    {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-gray-900" itemProp="name">{post.author.name || t('author.defaultName', 'iMagenWiz Team')}</div>
                  <div className="text-xs text-gray-500">{t('postInfo.role', 'Content Writer')}</div>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-4 w-4 mr-1.5 text-teal-500" />
                <time dateTime={post.created_at} itemProp="datePublished">{formatDate(post.created_at)}</time>
              </div>
              
              <div className="flex items-center text-gray-500">
                <Clock className="h-4 w-4 mr-1.5 text-teal-500" />
                <span>{estimatedReadTime}</span>
              </div>
            </div>
          </div>
          
          {/* Featured Image */}
          {post.featured_image && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <BlogImage
                src={post.featured_image}
                alt={post.title}
                className="w-full h-auto object-cover"
                itemProp="image"
              />
            </div>
          )}
          
          {post.meta_description && (
            <div 
              className="mt-6 text-lg text-gray-600 leading-relaxed border-l-4 border-teal-300 pl-4 py-2 bg-teal-50/50 rounded-r-md"
              itemProp="description"
            >
              {post.meta_description}
            </div>
          )}
        </header>
        
        <div className="lg:flex lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden lg:block lg:w-64 shrink-0">
            <div className="sticky top-8">
              {/* Table of Contents */}
              {tableOfContents.length > 0 && (
                <div className="mb-8 bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-teal-500" />
                    {t('tableOfContents.title', 'Table of Contents')}
                  </h2>
                  <nav className="space-y-1" aria-label="Article Sections">
                    {tableOfContents.map(heading => (
                      <a
                        key={heading.id}
                        href={`#${heading.id}`}
                        className={`block py-1 px-2 text-gray-600 hover:text-teal-700 hover:bg-teal-50 rounded text-sm
                          ${heading.level === 3 ? 'ml-3' : ''}`}
                        aria-label={`Jump to section: ${heading.text}`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}
              
              {/* Share Section */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">{t('share.title', 'Share Article')}</h2>
                <div className="flex flex-col space-y-2">
                  <button
                    onClick={() => handleSocialShare('facebook')}
                    className="flex items-center w-full py-2 px-3 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    {t('share.facebook', 'Share on Facebook')}
                  </button>
                  <button
                    onClick={() => handleSocialShare('twitter')}
                    className="flex items-center w-full py-2 px-3 rounded-md text-sm bg-blue-400 text-white hover:bg-blue-500 transition-colors"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    {t('share.twitter', 'Share on Twitter')}
                  </button>
                  <button
                    onClick={() => handleSocialShare('linkedin')}
                    className="flex items-center w-full py-2 px-3 rounded-md text-sm bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                    aria-label="Share on LinkedIn"
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    {t('share.linkedin', 'Share on LinkedIn')}
                  </button>
                  <div className="relative mt-2">
                    <button
                      onClick={handleShareClick}
                      className="flex items-center w-full py-2 px-3 rounded-md text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                      aria-label="Copy article link to clipboard"
                    >
                      <LinkIcon className="h-4 w-4 mr-2 text-teal-500" />
                      {t('share.copyLink', 'Copy Link')}
                    </button>
                    {showShareTooltip && (
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg whitespace-nowrap" role="alert">
                        {t('share.linkCopied', 'Link copied!')}
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-t-gray-800 border-l-transparent border-r-transparent"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
          
          {/* Main Content */}
          <div className="lg:flex-1" itemProp="articleBody">
            {/* Post Content - enhanced with proper heading IDs */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-semibold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h4:text-lg prose-h4:mt-5 prose-h4:mb-2 prose-p:text-gray-800 prose-p:leading-relaxed prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-a:font-medium prose-strong:text-gray-900 prose-strong:font-semibold prose-ul:my-6 prose-li:my-2 prose-li:text-gray-700 prose-img:rounded-lg prose-img:shadow-md prose-blockquote:border-teal-500 prose-blockquote:bg-teal-50/50 prose-blockquote:rounded-r-md prose-blockquote:py-1 prose-blockquote:text-gray-700 prose-blockquote:not-italic prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
              dangerouslySetInnerHTML={{ __html: enhanceContentForSEO() }}
            />
            
            {/* Mobile Share Buttons */}
            <div className="mt-10 lg:hidden">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('share.title', 'Share Article')}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleSocialShare('facebook')}
                  className="flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <Facebook className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{t('share.facebook_short', 'Facebook')}</span>
                </button>
                <button
                  onClick={() => handleSocialShare('twitter')}
                  className="flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm bg-blue-400 text-white hover:bg-blue-500 transition-colors"
                >
                  <Twitter className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{t('share.twitter_short', 'Twitter')}</span>
                </button>
                <button
                  onClick={() => handleSocialShare('linkedin')}
                  className="flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm bg-blue-700 text-white hover:bg-blue-800 transition-colors"
                >
                  <Linkedin className="h-4 w-4 md:mr-2" />
                  <span className="hidden md:inline">{t('share.linkedin_short', 'LinkedIn')}</span>
                </button>
                <div className="relative flex-1">
                  <button
                    onClick={handleShareClick}
                    className="w-full flex items-center justify-center py-2 px-3 rounded-md text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <LinkIcon className="h-4 w-4 md:mr-2 text-teal-500" />
                    <span className="hidden md:inline">{t('share.copyLink_short', 'Copy Link')}</span>
                  </button>
                  {showShareTooltip && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-800 text-white text-xs rounded shadow-lg">
                      {t('share.linkCopied', 'Link copied!')}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-t-gray-800 border-l-transparent border-r-transparent"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
      
      {/* Author Section */}
      {post.author && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <User className="h-5 w-5 mr-2 text-teal-500" />
            {t('author.aboutTitle', 'About the Author')}
          </h3>
          <div className="mt-4 bg-gradient-to-br from-teal-50 to-teal-50/30 rounded-xl p-6 border border-teal-100/50 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-teal-100 flex items-center justify-center border-2 border-white shadow-md">
              <span className="text-teal-700 font-bold text-3xl">
                {post.author.name ? post.author.name.charAt(0).toUpperCase() : 'A'}
              </span>
            </div>
            <div>
              <div className="font-bold text-xl text-gray-800 mb-2 text-center sm:text-left">{post.author.name || t('author.defaultName', 'iMagenWiz Team')}</div>
              <p className="text-gray-600 leading-relaxed">
                {t('author.bio', 'Content writer at iMagenWiz. Passionate about exploring the intersection of AI technology and creative design to help businesses achieve better visual results.')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Related Posts */}
      {post.related_posts && post.related_posts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center">
            <BookOpen className="h-6 w-6 mr-2 text-teal-500" />
            {t('relatedPosts.title', 'You Might Also Like')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {post.related_posts.map(relatedPost => (
              <article 
                key={relatedPost.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col h-full transform hover:-translate-y-1 cursor-pointer"
                onClick={() => navigate(`/blog/${relatedPost.slug}`)}
              >
                <div className="h-48 overflow-hidden bg-gray-100">
                  {relatedPost.featured_image ? (
                    <BlogImage
                      src={relatedPost.featured_image}
                      alt={relatedPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-r from-teal-400 to-teal-600 text-white">
                      <span className="text-xl font-bold">{t('common.companyName', 'iMagenWiz')}</span>
                    </div>
                  )}
                </div>
                
                <div className="p-5 flex flex-col flex-grow">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {relatedPost.tags && relatedPost.tags.slice(0, 1).map((tag) => (
                      <span 
                        key={tag.id}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold text-gray-800 mb-3 group-hover:text-teal-600 transition-colors text-lg line-clamp-2">
                    {relatedPost.title}
                  </h4>
                  
                  {relatedPost.meta_description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {relatedPost.meta_description}
                    </p>
                  )}
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-teal-500" />
                      {formatDate(relatedPost.created_at)}
                    </div>
                    
                    <div className="text-teal-600 hover:text-teal-800 text-sm font-medium flex items-center group">
                      {t('relatedPosts.readMore', 'Read More')} 
                      <ChevronRight className="h-4 w-4 ml-1 transform group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPost;