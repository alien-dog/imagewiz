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
  const [currentTryIndex, setCurrentTryIndex] = useState(0);
  
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
    setCurrentTryIndex(0);
    
    // Get all possible paths to try
    const pathsToTry = getAllPossiblePaths(src);
    tryLoadingImage(pathsToTry, 0);
  }, [src]);
  
  // Function to try loading images from an array of possible paths
  const tryLoadingImage = (paths, index) => {
    if (index >= paths.length) {
      // We've tried all paths, show error fallback
      console.error(`Failed to load image after trying all paths for: ${src}`);
      setError(true);
      setLoading(false);
      return;
    }
    
    const currentPath = paths[index];
    console.log(`Trying to load image [${index + 1}/${paths.length}]: ${currentPath}`);
    setImageSrc(currentPath);
    
    const img = new Image();
    img.onload = () => {
      console.log(`✅ Successfully loaded image: ${currentPath}`);
      setLoading(false);
    };
    img.onerror = () => {
      console.warn(`❌ Failed to load image path [${index + 1}/${paths.length}]: ${currentPath}`);
      // Try next path
      tryLoadingImage(paths, index + 1);
    };
    img.src = currentPath;
  };
  
  // Function to get all possible paths to try, ordered by most likely to work
  const getAllPossiblePaths = (src) => {
    if (!src) return [];
    
    const paths = [];
    
    // If src is already a full URL, use it first
    if (src.startsWith('http')) {
      paths.push(src);
    }
    
    // Extract the filename for building alternate paths
    let filename = src.split('/').pop();
    
    // Clean any double slashes and ensure we have a path starting with /
    let cleanSrc = src.replace(/\/\//g, '/');
    if (!cleanSrc.startsWith('/')) {
      cleanSrc = '/' + cleanSrc;
    }
    
    // Add path variations in order of priority
    
    // 1. Try the /uploads/blog/filename.jpg format (used by Express proxy endpoint)
    paths.push(`/uploads/blog/${filename}`);
    
    // 2. Try direct blog filename format
    paths.push(`/blog/${filename}`);
    
    // 3. If we have a path with /static/ convert it
    if (cleanSrc.includes('/static/uploads/blog/')) {
      paths.push(cleanSrc.replace('/static/uploads/blog/', '/uploads/blog/'));
    }
    
    // 4. Try full Flask static path (proxied)
    paths.push(`/static/uploads/blog/${filename}`);
    
    // 5. Add the original path if not already added
    if (!paths.includes(cleanSrc)) {
      paths.push(cleanSrc);
    }
    
    // 6. If we have any default images to try
    paths.push('/blog/ai-background-removal.jpg');
    paths.push('/blog/product-photography-tips.jpg');
    
    // Filter out duplicates
    return [...new Set(paths)];
  };
  
  // Loading placeholder
  if (loading) {
    return (
      <div className={`bg-gradient-to-br from-teal-400 to-teal-600 rounded flex items-center justify-center ${className}`} 
        style={{ width: width || '100%', height: height || '200px' }}>
        <div className="flex flex-col items-center justify-center h-full text-white p-4">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
          <span className="text-lg font-bold">{t('common.companyName', 'iMagenWiz')}</span>
        </div>
      </div>
    );
  }
  
  // Error fallback
  if (error) {
    return (
      <div className={`bg-gradient-to-br from-teal-400 to-teal-600 rounded flex items-center justify-center ${className}`}
        style={{ width: width || '100%', height: height || '200px' }}>
        <div className="text-center p-4 text-white">
          <span className="text-2xl font-bold block">{t('common.companyName', 'iMagenWiz')}</span>
        </div>
      </div>
    );
  }
  
  // Successful image load
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