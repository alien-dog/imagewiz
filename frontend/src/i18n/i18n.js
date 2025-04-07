import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import English resources (always available as fallback)
import commonEN from './locales/en/common.json';
import authEN from './locales/en/auth.json';
import pricingEN from './locales/en/pricing.json';
import blogEN from './locales/en/blog.json';
import cmsEN from './locales/en/cms.json';

// Define supported languages with their native names
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  { code: 'ms', name: 'Malaysian', nativeName: 'Bahasa Melayu' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska' },
  { code: 'zh-TW', name: 'Traditional Chinese', nativeName: '繁體中文' }
];

// Create resources object with English translations
const resources = {
  en: {
    common: commonEN,
    auth: authEN,
    pricing: pricingEN,
    blog: blogEN,
    cms: cmsEN
  }
};

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize configuration
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES.map(lang => lang.code),
    
    // Default namespace
    defaultNS: 'common',
    
    // Namespace configuration
    ns: ['common', 'auth', 'pricing', 'blog', 'cms', 'dashboard', 'editor'],
    
    // Debugging in development mode
    debug: process.env.NODE_ENV === 'development',
    
    // React specific settings
    react: {
      useSuspense: true,
    },
    
    // Interpolation configuration
    interpolation: {
      escapeValue: false, // Not needed for React
    },
    
    // Enable local caching
    detection: {
      order: ['localStorage', 'cookie', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      lookupCookie: 'i18next',
      caches: ['localStorage', 'cookie'],
    },
  });

// Utility function to change language
export const changeLanguage = async (lng) => {
  await i18n.changeLanguage(lng);
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr'; // Set RTL for Arabic
  
  // Store language preference
  localStorage.setItem('i18nextLng', lng);
};

// Export i18n instance
export default i18n;