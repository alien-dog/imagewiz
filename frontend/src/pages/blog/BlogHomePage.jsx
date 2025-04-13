import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '../../components/Layout';
import { getTags } from '../../lib/cms-service';
import BlogList from '../../components/blog/BlogList';
import LanguageSelector from '../../components/LanguageSelector';
import { 
  Tag, 
  ChevronDown, 
  Search, 
  ArrowRight, 
  Bookmark, 
  TrendingUp, 
  Globe, 
  Library,
  X,
  Filter
} from 'lucide-react';

const BlogHomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(['blog', 'common']);
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  
  useEffect(() => {
    // Fetch tags for filtering
    const loadTags = async () => {
      try {
        const response = await getTags();
        setTags(response.tags || []);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    
    loadTags();
    
    // Parse URL parameters
    const queryParams = new URLSearchParams(location.search);
    const tagParam = queryParams.get('tag');
    const searchParam = queryParams.get('search');
    
    if (tagParam) setSelectedTag(tagParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [location.search]);
  
  const handleTagSelect = (tagSlug) => {
    setSelectedTag(tagSlug);
    updateQueryParams({ tag: tagSlug });
    setShowTagsDropdown(false);
  };
  

  
  const handleSearch = (e) => {
    e.preventDefault();
    updateQueryParams({ search: searchTerm });
  };
  
  const updateQueryParams = (newParams) => {
    const queryParams = new URLSearchParams(location.search);
    
    // Update or remove params based on the new values
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        queryParams.set(key, value);
      } else {
        queryParams.delete(key);
      }
    });
    
    const newSearch = queryParams.toString();
    navigate({
      pathname: location.pathname,
      search: newSearch ? `?${newSearch}` : ''
    });
  };
  
  const clearFilters = () => {
    setSelectedTag('');
    setSearchTerm('');
    navigate(location.pathname);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
            <defs>
              <pattern id="dots" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-28 relative z-10">
          <div className="relative max-w-3xl">
            {/* Decorative element */}
            <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-teal-400/30 blur-xl"></div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight tracking-tight drop-shadow-sm">
              {t('blog:title')}
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-white opacity-90 leading-relaxed">
              {t('blog:description')}
            </p>
            
            <div className="flex flex-wrap gap-3 mb-8">
              {tags.slice(0, 5).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.slug)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full px-5 py-2.5 text-sm font-medium transition-colors backdrop-blur-sm shadow-sm border border-white/10"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {/* Wave effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-8 text-white">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="h-full w-full">
            <path 
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" 
              fill="currentColor">
            </path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Topics Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-teal-500" />
              {t('blog:featuredTopics')}
            </h2>
            {tags.length > 0 && (
              <button 
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                className="text-teal-600 hover:text-teal-800 flex items-center text-sm font-medium"
              >
                {t('blog:viewAllTopics')}
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {tags.slice(0, 6).map((tag) => (
              <button
                key={tag.id}
                onClick={() => handleTagSelect(tag.slug)}
                className={`flex flex-col items-center justify-center p-4 border rounded-lg hover:shadow-md transition-shadow
                  ${selectedTag === tag.slug 
                    ? 'bg-teal-50 border-teal-300 text-teal-700' 
                    : 'bg-white border-gray-200 text-gray-800 hover:border-teal-200'}`}
              >
                <Tag className={`h-6 w-6 mb-2 ${selectedTag === tag.slug ? 'text-teal-500' : 'text-gray-400'}`} />
                <span className="text-center text-sm font-medium">{tag.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-10 border border-gray-100 backdrop-blur-sm transform -mt-6 relative z-20">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-teal-500" />
                  <input
                    type="text"
                    placeholder={t('blog:searchPlaceholder')}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-l-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent shadow-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-r-xl transition-colors shadow-sm font-medium"
                >
                  {t('common:search')}
                </button>
              </form>
            </div>
            
            {/* Filters Group */}
            <div className="flex items-center gap-4 flex-wrap md:flex-nowrap">
              {/* Tag Filter */}
              <div className="relative group">
                <button
                  className="flex items-center justify-between px-4 py-3 border border-gray-200 rounded-xl bg-white text-gray-800 hover:border-teal-300 hover:shadow-sm transition-all min-w-[180px]"
                  onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                >
                  <div className="flex items-center">
                    <Filter className="h-5 w-5 mr-2 text-teal-500" />
                    <span className="font-medium truncate max-w-[120px]">
                      {selectedTag ? tags.find(t => t.slug === selectedTag)?.name || selectedTag : t('blog:allCategories')}
                    </span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${showTagsDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTagsDropdown && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    <div className="py-1">
                      <button
                        className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center ${!selectedTag ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                        onClick={() => handleTagSelect('')}
                      >
                        <Library className="h-4 w-4 mr-2" />
                        {t('blog:allCategories')}
                      </button>
                      
                      <div className="border-t border-gray-100 my-1"></div>
                      
                      {tags.map((tag) => (
                        <button
                          key={tag.id}
                          className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center ${selectedTag === tag.slug ? 'bg-teal-50 text-teal-700 font-medium' : ''}`}
                          onClick={() => handleTagSelect(tag.slug)}
                        >
                          <Tag className="h-4 w-4 mr-2" />
                          {tag.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Language Selector */}
              <div>
                <LanguageSelector variant="outline" />
              </div>
              
              {/* Clear Filters */}
              {(selectedTag || searchTerm) && (
                <button
                  className="flex items-center text-teal-600 hover:text-teal-800 px-4 py-3 font-medium border border-transparent hover:border-teal-100 rounded-xl hover:bg-teal-50 transition-colors"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  {t('common:clearFilters')}
                </button>
              )}
            </div>
          </div>
          
          {/* Active Filters */}
          {(selectedTag || searchTerm) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm text-gray-500 mr-1">
                  {t('blog:activeFilters')}:
                </span>
                
                {selectedTag && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-100">
                    {tags.find(t => t.slug === selectedTag)?.name || selectedTag}
                    <button 
                      onClick={() => handleTagSelect('')}
                      className="ml-1.5 text-teal-600 hover:text-teal-800"
                      aria-label="Remove tag filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
                
                {searchTerm && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-50 text-teal-700 border border-teal-100">
                    "{searchTerm}"
                    <button 
                      onClick={() => {
                        setSearchTerm('');
                        updateQueryParams({ search: '' });
                      }}
                      className="ml-1.5 text-teal-600 hover:text-teal-800"
                      aria-label="Remove search filter"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        

        
        {/* Article Heading */}
        <div className="mb-10 relative">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
                <Bookmark className="w-6 h-6 mr-2.5 text-teal-500" />
                {selectedTag 
                  ? `${tags.find(t => t.slug === selectedTag)?.name || t('blog:tagged')} ${t('blog:articles')}` 
                  : searchTerm 
                    ? t('blog:searchResults') 
                    : t('blog:latestArticles')}
              </h2>
              <div className="mt-3 h-1 w-32 bg-teal-500 rounded"></div>
            </div>
            
            {/* Result count indicator only shows when we have filters */}
            {(selectedTag || searchTerm) && (
              <div className="bg-teal-50 text-teal-700 px-4 py-2 rounded-full text-sm font-medium border border-teal-100 shadow-sm">
                {searchTerm 
                  ? t('blog:searchResultCount', {count: '{{count}} results', count: 0}) 
                  : t('blog:filteredCount', {count: '{{count}} articles', count: 0})}
              </div>
            )}
          </div>
          
          {/* Decorative dots */}
          <div className="absolute -right-4 -bottom-4 w-24 h-24 text-teal-200 opacity-20 hidden lg:block">
            <svg viewBox="0 0 100 100" fill="currentColor">
              <circle cx="10" cy="10" r="3" />
              <circle cx="30" cy="10" r="3" />
              <circle cx="50" cy="10" r="3" />
              <circle cx="70" cy="10" r="3" />
              <circle cx="90" cy="10" r="3" />
              <circle cx="10" cy="30" r="3" />
              <circle cx="30" cy="30" r="3" />
              <circle cx="50" cy="30" r="3" />
              <circle cx="70" cy="30" r="3" />
              <circle cx="90" cy="30" r="3" />
              <circle cx="10" cy="50" r="3" />
              <circle cx="30" cy="50" r="3" />
              <circle cx="50" cy="50" r="3" />
              <circle cx="70" cy="50" r="3" />
              <circle cx="90" cy="50" r="3" />
              <circle cx="10" cy="70" r="3" />
              <circle cx="30" cy="70" r="3" />
              <circle cx="50" cy="70" r="3" />
              <circle cx="70" cy="70" r="3" />
              <circle cx="90" cy="70" r="3" />
              <circle cx="10" cy="90" r="3" />
              <circle cx="30" cy="90" r="3" />
              <circle cx="50" cy="90" r="3" />
              <circle cx="70" cy="90" r="3" />
              <circle cx="90" cy="90" r="3" />
            </svg>
          </div>
        </div>
        
        {/* Blog Posts */}
        <BlogList language={i18n.language} tag={selectedTag} limit={9} />
      </div>
    </Layout>
  );
};

export default BlogHomePage;