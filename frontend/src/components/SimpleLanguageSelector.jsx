import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '../i18n/i18n';

const SimpleLanguageSelector = () => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  
  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    document.documentElement.lang = langCode;
    document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', langCode);
    setIsOpen(false);
  };

  const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center bg-teal-500 hover:bg-teal-600 text-white rounded-md px-4 py-2"
        >
          <span className="mr-1">🌐</span>
          <span>{currentLang.nativeName}</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10 max-h-80 overflow-y-auto w-48">
            {SUPPORTED_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-100 
                  ${lang.code === i18n.language ? 'bg-gray-100 font-bold' : ''}`}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-gray-500 text-sm ml-2">({lang.code})</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SimpleLanguageSelector;