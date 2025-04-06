import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getTags } from '../../lib/cms-service';
import BlogList from '../../components/blog/BlogList';
import { Tag, ChevronDown, Search, Globe, ArrowRight, Bookmark, TrendingUp } from 'lucide-react';

const BlogHomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [tags, setTags] = useState([]);
  const [selectedTag, setSelectedTag] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  
  // Languages hardcoded for simplicity, in a real app this should be fetched from the API
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' }
  ];
  
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
    const langParam = queryParams.get('lang');
    
    if (tagParam) setSelectedTag(tagParam);
    if (searchParam) setSearchTerm(searchParam);
    if (langParam) setLanguage(langParam);
  }, [location.search]);
  
  const handleTagSelect = (tagSlug) => {
    setSelectedTag(tagSlug);
    updateQueryParams({ tag: tagSlug });
    setShowTagsDropdown(false);
  };
  
  const handleLanguageSelect = (langCode) => {
    setLanguage(langCode);
    updateQueryParams({ lang: langCode });
    setShowLanguageDropdown(false);
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
    setLanguage('en');
    navigate(location.pathname);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight tracking-tight">
              iMagenWiz Blog
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-teal-100">
              Explore the latest techniques in AI-powered image processing, 
              background removal, and creative design strategies.
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              {tags.slice(0, 5).map((tag) => (
                <button
                  key={tag.id}
                  onClick={() => handleTagSelect(tag.slug)}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full px-4 py-2 text-sm font-medium transition-colors"
                >
                  #{tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Topics Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-teal-500" />
              Featured Topics
            </h2>
            {tags.length > 0 && (
              <button 
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                className="text-teal-600 hover:text-teal-800 flex items-center text-sm font-medium"
              >
                View All Topics
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
        <div className="bg-white rounded-lg shadow-md p-4 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search articles..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button 
                  type="submit"
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-r-md transition-colors"
                >
                  Search
                </button>
              </form>
            </div>
            
            {/* Tag Filter */}
            <div className="relative">
              <button
                className="flex items-center justify-between w-full md:w-48 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              >
                <div className="flex items-center">
                  <Tag className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{selectedTag ? tags.find(t => t.slug === selectedTag)?.name || selectedTag : 'All Categories'}</span>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              
              {showTagsDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="py-1">
                    <button
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${!selectedTag ? 'bg-teal-50 text-teal-700' : ''}`}
                      onClick={() => handleTagSelect('')}
                    >
                      All Categories
                    </button>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${selectedTag === tag.slug ? 'bg-teal-50 text-teal-700' : ''}`}
                        onClick={() => handleTagSelect(tag.slug)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Language Filter */}
            <div className="relative">
              <button
                className="flex items-center justify-between w-full md:w-36 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <div className="flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-gray-400" />
                  <span>{languages.find(l => l.code === language)?.name || 'English'}</span>
                </div>
                <ChevronDown className="h-5 w-5 text-gray-400" />
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${language === lang.code ? 'bg-teal-50 text-teal-700' : ''}`}
                        onClick={() => handleLanguageSelect(lang.code)}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Clear Filters */}
            {(selectedTag || searchTerm || language !== 'en') && (
              <button
                className="text-teal-600 hover:text-teal-800 px-3 py-2 font-medium"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Active Filter Display */}
        {(selectedTag || searchTerm) && (
          <div className="mb-6 bg-teal-50 rounded-lg p-4 border border-teal-100">
            <h3 className="text-lg font-medium text-teal-800 mb-2">
              {searchTerm ? 'Search Results' : 'Filtered Articles'}
            </h3>
            <div className="flex flex-wrap gap-2">
              {selectedTag && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                  Category: {tags.find(t => t.slug === selectedTag)?.name || selectedTag}
                  <button 
                    onClick={() => handleTagSelect('')}
                    className="ml-1 text-teal-600 hover:text-teal-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-800">
                  Search: "{searchTerm}"
                  <button 
                    onClick={() => {
                      setSearchTerm('');
                      updateQueryParams({ search: '' });
                    }}
                    className="ml-1 text-teal-600 hover:text-teal-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Article Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bookmark className="w-6 h-6 mr-2 text-teal-500" />
            {selectedTag 
              ? `${tags.find(t => t.slug === selectedTag)?.name || 'Tagged'} Articles` 
              : searchTerm 
                ? 'Search Results' 
                : 'Latest Articles'}
          </h2>
          <div className="mt-2 h-1 w-24 bg-teal-500 rounded"></div>
        </div>
        
        {/* Blog Posts */}
        <BlogList language={language} tag={selectedTag} limit={9} />
      </div>
    </Layout>
  );
};

export default BlogHomePage;