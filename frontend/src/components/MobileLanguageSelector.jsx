import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '../i18n/i18n';

const MobileLanguageSelector = () => {
  const { i18n, t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);
  const [showModal, setShowModal] = useState(false);
  
  // Get the current language display info
  const currentLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === i18n.language) || 
    SUPPORTED_LANGUAGES.find(lang => lang.code === 'en');
    
  const handleLanguageChange = (langCode) => {
    setSelectedLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
    
    // Force page reload to apply new language
    window.location.reload();
  };
  
  // Simple modal-style interface
  return (
    <div>
      {/* Language Button */}
      <button 
        onClick={() => setShowModal(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-teal-500 text-white"
        aria-label={`Change language, current language: ${currentLanguage.name}`}
      >
        <span role="img" aria-hidden="true" className="text-lg">{currentLanguage.flag}</span>
      </button>
      
      {/* Full-screen Language Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-medium">{t('common.selectLanguage', 'Select Language')}</h2>
            <button 
              onClick={() => setShowModal(false)}
              className="p-2 rounded-md hover:bg-gray-200"
            >
              <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Language List */}
          <div className="flex-1 overflow-y-auto">
            <div className="divide-y divide-gray-100">
              {SUPPORTED_LANGUAGES.map(language => (
                <button 
                  key={language.code}
                  className={`flex items-center w-full py-4 px-4 text-left ${
                    language.code === i18n.language ? 'bg-teal-50' : ''
                  }`}
                  onClick={() => handleLanguageChange(language.code)}
                >
                  <span className="text-2xl mr-4" role="img" aria-label={language.name}>
                    {language.flag}
                  </span>
                  <div>
                    <div className="font-medium">{language.nativeName}</div>
                    <div className="text-gray-500 text-sm">{language.name}</div>
                  </div>
                  {language.code === i18n.language && (
                    <span className="ml-auto text-teal-500 text-xl">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileLanguageSelector;