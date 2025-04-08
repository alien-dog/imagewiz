import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * A flexible image component for blog posts that handles different path formats
 * and provides fallbacks for various situations
 */
const BlogImage = ({ src, alt, className = '', width, height }) => {
  const { t } = useTranslation();
  const [imageSrc, setImageSrc] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (!src) {
      console.log('No image source provided');
      setError(true);
      setLoading(false);
      return;
    }
    
    // Reset states when src changes
    setLoading(true);
    setError(false);
    
    // Normalize image source
    const normalizedSrc = normalizeSrc(src);
    setImageSrc(normalizedSrc);
    
    // Preload the image
    const img = new Image();
    img.onload = () => {
      setLoading(false);
    };
    img.onerror = () => {
      console.error(`Failed to load image: ${normalizedSrc}`);
      
      // Try alternative path format
      const altSrc = getAlternativePath(src);
      if (altSrc !== normalizedSrc) {
        console.log(`Trying alternative path: ${altSrc}`);
        setImageSrc(altSrc);
        
        // Try loading with alternative path
        const altImg = new Image();
        altImg.onload = () => {
          setLoading(false);
        };
        altImg.onerror = () => {
          console.error(`Failed to load alternative image: ${altSrc}`);
          setError(true);
          setLoading(false);
        };
        altImg.src = altSrc;
      } else {
        setError(true);
        setLoading(false);
      }
    };
    img.src = normalizedSrc;
  }, [src]);
  
  // Function to normalize image source
  const normalizeSrc = (src) => {
    if (!src) return '';
    
    // If src is already a full URL (starts with http)
    if (src.startsWith('http')) {
      return src;
    }
    
    // Clean any double slashes
    let cleanSrc = src.replace(/\/\//g, '/');
    
    // If the path doesn't start with /, add it
    if (!cleanSrc.startsWith('/')) {
      cleanSrc = '/' + cleanSrc;
    }
    
    // Handle different path formats
    if (cleanSrc.includes('/static/uploads/blog/')) {
      // Convert flask static path to frontend path
      return cleanSrc.replace('/static/uploads/blog/', '/uploads/blog/');
    } else if (cleanSrc.includes('/uploads/blog/')) {
      // Path is already in the correct format
      return cleanSrc;
    } else if (cleanSrc.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      // It's an image filename, add /blog/ prefix
      const filename = cleanSrc.split('/').pop();
      return `/blog/${filename}`;
    }
    
    // Return the path as is if none of the above conditions match
    return cleanSrc;
  };
  
  // Function to get alternative path format
  const getAlternativePath = (src) => {
    if (!src) return '';
    
    // Extract the filename
    const filename = src.split('/').pop();
    
    // If already using /blog/filename.jpg, try /uploads/blog/filename.jpg
    if (src.match(/^\/blog\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return `/uploads/blog/${filename}`;
    }
    
    // If using /uploads/blog/filename.jpg, try /blog/filename.jpg
    if (src.match(/^\/uploads\/blog\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return `/blog/${filename}`;
    }
    
    // If using /static/uploads/blog/filename.jpg, try direct blog path
    if (src.match(/^\/static\/uploads\/blog\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return `/blog/${filename}`;
    }
    
    // If it's a full URL with uploads/blog, extract filename and try /blog/filename.jpg
    if (src.match(/\/uploads\/blog\/[^\/]+\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
      return `/blog/${filename}`;
    }
    
    // Return the original normalized source as fallback
    return normalizeSrc(src);
  };
  
  if (loading) {
    return (
      <div className={`bg-gray-100 animate-pulse rounded ${className}`} 
        style={{ width: width || '100%', height: height || '200px' }}>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className={`bg-gray-50 border border-gray-200 rounded flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}>
        <div className="text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 text-sm">{t('Image could not be loaded')}</p>
        </div>
      </div>
    );
  }
  
  return (
    <img
      src={imageSrc}
      alt={alt || t('Blog image')}
      className={`rounded ${className}`}
      width={width}
      height={height}
      loading="lazy"
    />
  );
};

export default BlogImage;