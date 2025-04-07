import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES, changeLanguage } from '../i18n/i18n';

const SimpleLanguageSelector = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState(
    SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0]
  );
  
  // Update current language when i18n.language changes
  useEffect(() => {
    const lang = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];
    setCurrentLang(lang);
  }, [i18n.language]);
  
  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
    
    // Force refresh page to ensure all translations are applied
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2"
          aria-label={`Select language: ${currentLang.name}`}
          title={`Current language: ${currentLang.name}`}
        >
          <span className="mr-2 text-lg">{currentLang.flag}</span>
          <span>{currentLang.nativeName}</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-80 overflow-y-auto w-60">
            <div className="sticky top-0 bg-gray-100 px-4 py-2 font-medium border-b border-gray-200">
              {t('common.language')}
            </div>
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`flex items-center w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0
                  ${lang.code === i18n.language ? 'bg-gray-50 font-medium' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="text-xl mr-3">{lang.flag}</span>
                <div>
                  <div className="font-medium">{lang.nativeName}</div>
                  <div className="text-gray-500 text-xs">{lang.name}</div>
                </div>
                {lang.code === i18n.language && (
                  <span className="ml-auto text-teal-500">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLanguageSelector;