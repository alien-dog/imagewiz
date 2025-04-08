import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, changeLanguage, isRTL } from '../i18n/i18n';

const LanguageSelector = ({ variant = 'default', size = 'default' }) => {
  const { i18n, t } = useTranslation('common');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Enhanced language detection with fallback
  const currentLanguageCode = i18n.language || localStorage.getItem('i18nextLng') || 'en';
  const currentLanguage = SUPPORTED_LANGUAGES.find(
    (lang) => lang.code === currentLanguageCode
  ) || SUPPORTED_LANGUAGES[0];
  
  console.log('Current language:', currentLanguageCode, 'Direction:', isRTL(currentLanguageCode) ? 'RTL' : 'LTR');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
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
      console.log(`Updating document direction to ${direction} based on language ${currentLanguageCode}`);
      document.documentElement.dir = direction;
      
      // Also update body class for consistent styling
      if (isRTL(currentLanguageCode)) {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    }
  }, [currentLanguageCode]);

  const handleLanguageChange = async (languageCode) => {
    try {
      // Don't change if it's already the current language
      if (languageCode === currentLanguageCode) {
        setIsOpen(false);
        return;
      }
      
      console.log(`Changing language from ${currentLanguageCode} to ${languageCode}`);
      
      // Change the language
      await changeLanguage(languageCode);
      
      // Force reload if translation data isn't fully loaded for this language
      const hasTranslations = i18n.hasResourceBundle(languageCode, 'common');
      if (!hasTranslations) {
        // If we don't have the translations for this language, reload the page
        console.log(`Translations for ${languageCode} not loaded, reloading page...`);
        setTimeout(() => window.location.reload(), 100);
      }
      
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to change language:', error);
      // Fall back to reload as a last resort
      window.location.reload();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md 
                  ${variant === 'outline' 
                    ? 'border border-gray-300 hover:bg-gray-50' 
                    : 'bg-teal-500 text-white hover:bg-teal-600'}`}
        aria-label={`Change language (current: ${currentLanguage.name})`}
      >
        <span className="text-lg mr-1">{currentLanguage.flag}</span>
        <span className="hidden md:inline">{currentLanguage.nativeName}</span>
        <svg 
          className="w-4 h-4 ml-1" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path 
            fillRule="evenodd" 
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
            clipRule="evenodd" 
          />
        </svg>
      </button>
      
      {isOpen && (
        <div 
          className="fixed md:absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50 overflow-y-auto"
          style={{
            maxHeight: 'calc(100vh - 150px)', 
            top: '100%',
            left: window.innerWidth <= 768 ? '50%' : 'auto',
            transform: window.innerWidth <= 768 ? 'translateX(-50%)' : 'none'
          }}
        >
          <div className="sticky top-0 bg-gray-100 px-4 py-2 font-medium text-sm border-b border-gray-200 z-10">
            {t('language.select', 'Select language')}
          </div>
          
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                className={`flex items-center w-full text-left px-4 py-3 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                          ${language.code === currentLanguageCode ? 'bg-gray-50 font-medium' : ''}`}
                onClick={() => handleLanguageChange(language.code)}
              >
                <span className="text-xl mr-3">{language.flag}</span>
                <div>
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-gray-500 text-xs">{language.name}</div>
                </div>
                {language.code === currentLanguageCode && (
                  <span className="ml-auto text-teal-500">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;