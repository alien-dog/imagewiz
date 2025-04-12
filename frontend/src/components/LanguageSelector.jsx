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
  
  // Close dropdown when clicking outside - handle both mouse and touch events
  useEffect(() => {
    function handleOutsideInteraction(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }
    
    // For desktop/mouse devices
    document.addEventListener('mousedown', handleOutsideInteraction);
    
    // For touch devices
    document.addEventListener('touchend', handleOutsideInteraction);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideInteraction);
      document.removeEventListener('touchend', handleOutsideInteraction);
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
        onTouchEnd={(e) => {
          // Prevent default to avoid double triggering with onClick
          e.preventDefault();
          if (!isChanging) {
            setIsOpen(!isOpen);
          }
        }}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md 
                  ${variant === 'outline' 
                    ? 'border border-gray-300 hover:bg-gray-50 active:bg-gray-100' 
                    : 'bg-teal-500 text-white hover:bg-teal-600 active:bg-teal-700'}
                  ${isChanging ? 'opacity-70 pointer-events-none' : ''}
                  touch-manipulation`} // Add touch manipulation for better touch response
        aria-label={`Change language (current: ${currentLanguage.name})`}
        disabled={isChanging}
        style={{ touchAction: 'manipulation' }} // Explicit touch action
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
        <>
          {/* Add a fullscreen overlay to make it easier to close on touch devices */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40 md:hidden"
            onClick={() => {
              setIsOpen(false);
              setSearchTerm('');
            }}
          ></div>
          
          <div 
            className="fixed md:absolute right-0 mt-2 w-[90vw] md:w-64 bg-white border border-gray-200 rounded-md shadow-xl z-50 overflow-hidden"
            style={{
              maxHeight: 'calc(100vh - 120px)', 
              top: '100%',
              left: window.innerWidth <= 768 ? '50%' : 'auto',
              transform: window.innerWidth <= 768 ? 'translateX(-50%)' : 'none'
            }}
          >
            {/* Header with close button for better touch accessibility */}
            <div className="flex items-center justify-between bg-gray-100 px-3 py-2 border-b border-gray-200">
              <h3 className="font-medium text-gray-700">{t('common.selectLanguage', 'Select Language')}</h3>
              <button 
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  setIsOpen(false);
                  setSearchTerm('');
                }}
                className="md:hidden p-2 rounded-full hover:bg-gray-200 active:bg-gray-300 touch-manipulation"
                aria-label="Close language selector"
                style={{ touchAction: 'manipulation' }}
              >
                <svg className="h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
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
                  className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                  placeholder={t('common.searchLanguages', 'Search languages')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center touch-manipulation"
                    onClick={() => setSearchTerm('')}
                    onTouchEnd={(e) => {
                      e.preventDefault();
                      setSearchTerm('');
                    }}
                    style={{ touchAction: 'manipulation' }}
                    aria-label="Clear search"
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                <div className="grid grid-cols-1 divide-y divide-gray-100">
                  {filteredLanguages.map((language) => (
                    <button 
                      key={language.code}
                      type="button"
                      className={`flex items-center w-full text-left px-4 py-4 text-sm
                                hover:bg-gray-50 active:bg-gray-100 touch-manipulation
                                ${language.code === currentLanguageCode ? 'bg-gray-50 font-medium' : ''}
                                ${selectedLang === language.code ? 'bg-teal-50' : ''}`}
                      onClick={() => handleLanguageChange(language)}
                      onTouchEnd={(e) => {
                        e.preventDefault();
                        handleLanguageChange(language);
                      }}
                      style={{ touchAction: 'manipulation' }}
                      aria-current={language.code === currentLanguageCode ? 'true' : 'false'}
                    >
                      <span className="text-xl mr-3 flex-shrink-0" role="img" aria-label={language.name}>{language.flag}</span>
                      <div className="flex-grow min-w-0">
                        <div className="font-medium truncate">{language.nativeName}</div>
                        <div className="text-gray-500 text-xs truncate">{language.name}</div>
                      </div>
                      {language.code === currentLanguageCode && (
                        <span className="ml-auto text-teal-500 flex-shrink-0">✓</span>
                      )}
                      {selectedLang === language.code && language.code !== currentLanguageCode && (
                        <span className="ml-auto flex-shrink-0">
                          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSelector;