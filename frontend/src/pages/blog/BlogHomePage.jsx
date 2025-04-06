import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import { getTags } from '../../lib/cms-service';
import BlogList from '../../components/blog/BlogList';
import { Tag, ChevronDown, Search, Globe } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blog Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">iMagenWiz Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Latest news, tutorials, and insights on AI-powered image processing
          </p>
        </div>
        
        {/* Filters Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
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
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-r-md"
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
                className="text-teal-600 hover:text-teal-800 px-3 py-2"
                onClick={clearFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
        
        {/* Blog Posts */}
        <BlogList language={language} tag={selectedTag} limit={9} />
      </div>
    </Layout>
  );
};

export default BlogHomePage;