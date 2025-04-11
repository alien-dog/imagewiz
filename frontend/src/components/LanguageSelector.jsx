import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, isRTL } from '../i18n/i18n';

const LanguageSelector = ({ variant = 'default', size = 'default' }) => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [selectedLang, setSelectedLang] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Enhanced language detection with fallback
  const currentLanguageCode = i18n.language || localStorage.getItem('i18nextLng') || 'en';
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguageCode
  ) || SUPPORTED_LANGUAGES[0];
  
  // Get browser language for prioritizing the order
  const getBrowserLanguage = () => {
    if (typeof window === 'undefined') return 'en';
    const browserLang = navigator.language || navigator.userLanguage || 'en';
    return browserLang.split('-')[0];
  };
  
  // Ordered languages - browser language first, then alphabetically
  const orderedLanguages = useMemo(() => {
    const browserLang = getBrowserLanguage();
    
    return [...SUPPORTED_LANGUAGES].sort((a, b) => {
      // First, check if either language matches the browser language
      const aMatchesBrowser = a.code === browserLang || a.code.startsWith(browserLang + '-');
      const bMatchesBrowser = b.code === browserLang || b.code.startsWith(browserLang + '-');
      
      if (aMatchesBrowser && !bMatchesBrowser) return -1;
      if (!aMatchesBrowser && bMatchesBrowser) return 1;
      
      // Then sort alphabetically by native name
      return a.nativeName.localeCompare(b.nativeName);
    });
  }, []);
  
  // Filtered languages based on search term
  const filteredLanguages = useMemo(() => {
    if (!searchTerm.trim()) return orderedLanguages;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return orderedLanguages.filter(
      lang => 
        lang.name.toLowerCase().includes(lowerSearchTerm) ||
        lang.nativeName.toLowerCase().includes(lowerSearchTerm) ||
        lang.code.toLowerCase().includes(lowerSearchTerm)
    );
  }, [orderedLanguages, searchTerm]);
  
  // Debug logging
  useEffect(() => {
    console.log(`LanguageSelector - Current language: ${currentLanguageCode}`, currentLanguage);
  }, [currentLanguageCode]);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Ensure the document direction matches the current language on component mount
  useEffect(() => {
    // Set document direction based on current language
    const direction = isRTL(currentLanguageCode) ? 'rtl' : 'ltr';
    if (document.documentElement.dir !== direction) {
      document.documentElement.dir = direction;
      
      // Also update body class for consistent styling
      if (isRTL(currentLanguageCode)) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    }
  }, [currentLanguageCode]);

  const handleLanguageChange = (language) => {
    if (language.code === currentLanguageCode) {
      setIsOpen(false);
      setSearchTerm('');
      return;
    }
    
    // Visual feedback during language change
    setIsChanging(true);
    setSelectedLang(language.code);
    
    // Update localStorage immediately
    localStorage.setItem('i18nextLng', language.code);
    
    // Forced reload approach - this works more reliably than any other method
    setTimeout(() => {
      // Force reload with the new language
      window.location.reload();
    }, 300);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md 
                  ${variant === 'outline' 
                    ? 'border border-gray-300 hover:bg-gray-50' 
                    : 'bg-teal-500 text-white hover:bg-teal-600'}
                  ${isChanging ? 'opacity-70 pointer-events-none' : ''}`}
        aria-label={`Change language (current: ${currentLanguage.name})`}
        disabled={isChanging}
      >
        <span className="text-lg mr-1" role="img" aria-label={currentLanguage.name}>{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        {isChanging ? (
          <svg className="animate-spin h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg 
            className="w-4 h-4 ml-1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path 
              fillRule="evenodd" 
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
              clipRule="evenodd" 
            />
          </svg>
        )}
      </button>
      
      {isOpen && !isChanging && (
        <div 
          className="fixed md:absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden"
          style={{
            maxHeight: 'calc(100vh - 150px)', 
            top: '100%',
            left: window.innerWidth <= 768 ? '50%' : 'auto',
            transform: window.innerWidth <= 768 ? 'translateX(-50%)' : 'none'
          }}
        >
          <div className="sticky top-0 bg-gray-100 p-2 z-10 border-b border-gray-200">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                ref={searchInputRef}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                placeholder={t('common.searchLanguages', 'Search languages')}
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {searchTerm && (
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchTerm('')}
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="max-h-[calc(100vh-210px)] overflow-y-auto">
            {filteredLanguages.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {t('common.noResults', 'No languages found')}
              </div>
            ) : (
              filteredLanguages.map((language) => (
                <button 
                  key={language.code}
                  type="button"
                  className={`flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                            ${language.code === currentLanguageCode ? 'bg-gray-50 font-medium' : ''}
                            ${selectedLang === language.code ? 'bg-teal-50' : ''}`}
                  onClick={() => handleLanguageChange(language)}
                  aria-current={language.code === currentLanguageCode ? 'true' : 'false'}
                >
                  <span className="text-xl mr-3" role="img" aria-label={language.name}>{language.flag}</span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-gray-500 text-xs">{language.name}</div>
                  </div>
                  {language.code === currentLanguageCode && (
                    <span className="ml-auto text-teal-500">✓</span>
                  )}
                  {selectedLang === language.code && language.code !== currentLanguageCode && (
                    <span className="ml-auto">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;