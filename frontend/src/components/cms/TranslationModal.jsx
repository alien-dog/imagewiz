import React, { useState } from 'react';
import { Languages, X, Check, AlertCircle, Loader2 } from 'lucide-react';

/**
 * TranslationModal component for selecting languages to translate a post to
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {Function} props.onTranslate - Function to call with selected languages when translating
 * @param {Array} props.languages - List of all available languages
 * @param {Array} props.existingTranslations - List of language codes that already have translations
 */
const TranslationModal = ({ 
  isOpen, 
  onClose, 
  onTranslate, 
  languages, 
  existingTranslations = [], 
  isLoading = false 
}) => {
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  if (!isOpen) return null;
  
  // Filter to only show languages that are active
  const activeLanguages = languages.filter(lang => lang.is_active);
  
  // Handle language selection toggle
  const toggleLanguage = (langCode) => {
    if (selectedLanguages.includes(langCode)) {
      setSelectedLanguages(selectedLanguages.filter(code => code !== langCode));
      setSelectAll(false);
    } else {
      setSelectedLanguages([...selectedLanguages, langCode]);
      // Check if all languages are now selected
      if (selectedLanguages.length + 1 === activeLanguages.length) {
        setSelectAll(true);
      }
    }
  };
  
  // Handle select all toggle
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedLanguages([]);
      setSelectAll(false);
    } else {
      // Select all language codes except those that already have translations
      const allLanguageCodes = activeLanguages.map(lang => lang.code);
      setSelectedLanguages(allLanguageCodes);
      setSelectAll(true);
    }
  };
  
  // Check if a language already has a translation
  const hasTranslation = (langCode) => {
    return existingTranslations.includes(langCode);
  };
  
  // Handle translate button click
  const handleTranslate = () => {
    if (selectedLanguages.length === 0) return;
    onTranslate(selectedLanguages);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <Languages className="h-5 w-5 mr-2" />
            Translate Post
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600">
            Select the languages you want to translate this post to. The current content will be used as the source.
          </p>
          
          {/* Select All Option */}
          <div className="flex items-center mt-4 mb-2">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Select All Languages</span>
            </label>
          </div>
          
          {/* Language Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            {activeLanguages.map(lang => (
              <div key={lang.code} className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700 flex items-center">
                    {lang.flag || ''} {lang.name}
                    {hasTranslation(lang.code) && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                        Exists
                      </span>
                    )}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
        
        {selectedLanguages.length === 0 && (
          <div className="text-yellow-600 bg-yellow-50 p-3 rounded-lg flex items-start mb-4">
            <AlertCircle className="h-5 w-5 mr-2 text-yellow-700 mt-0.5" />
            <div>
              <p className="text-sm font-medium">Please select at least one language to translate to.</p>
            </div>
          </div>
        )}
        
        <div className="flex justify-end mt-4 space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleTranslate}
            className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50 flex items-center"
            disabled={selectedLanguages.length === 0 || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Translating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Translate to {selectedLanguages.length} {selectedLanguages.length === 1 ? 'language' : 'languages'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TranslationModal;