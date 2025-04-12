import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/i18n';

// Ultra-simplified mobile language selector optimized for touch events
const MobileLanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Get the current language display info
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || 
    SUPPORTED_LANGUAGES.find(lang => lang.code === 'en');
  
  // Simple direct language change function 
  const changeLanguage = (langCode) => {
    if (langCode === i18n.language) {
      setIsOpen(false);
      return;
    }
    
    // Set localStorage first (most important for page reload)
    localStorage.setItem('i18nextLng', langCode);
    
    // Force reload to apply language changes completely
    window.location.reload();
  };

  return (
    <div className="relative">
      {/* Ultra simple language toggle button with larger touch target */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center bg-teal-500 text-white px-4 py-3 rounded-md cursor-pointer active:bg-teal-600"
      >
        <span className="text-xl mr-2">{currentLanguage.flag}</span>
        <span>{currentLanguage.nativeName}</span>
      </div>
      
      {/* Language Modal for Mobile - only renders when open */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col touch-auto">
          {/* Large touch-friendly header */}
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50"
            onClick={() => setIsOpen(false)}
          >
            <h2 className="text-lg font-medium">{t('common.selectLanguage', 'Select Language')}</h2>
            <div className="p-3 rounded-md bg-gray-200">
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          
          {/* Language List - large touch targets */}
          <div className="flex-1 overflow-auto">
            {SUPPORTED_LANGUAGES.map(language => (
              <div 
                key={language.code}
                className={`flex items-center w-full py-5 px-4 border-b border-gray-100 active:bg-gray-100 ${
                  language.code === i18n.language ? 'bg-teal-50' : ''
                }`}
                onClick={() => changeLanguage(language.code)}
              >
                <span className="text-2xl mr-4">{language.flag}</span>
                <div>
                  <div className="font-medium text-base">{language.nativeName}</div>
                  <div className="text-gray-500">{language.name}</div>
                </div>
                {language.code === i18n.language && (
                  <span className="ml-auto text-teal-500 text-2xl">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLanguageSelector;