import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enProducts from '../locales/en/products.json';
import enHome from '../locales/en/home.json';

import frCommon from '../locales/fr/common.json';
import frNavigation from '../locales/fr/navigation.json';
import frProducts from '../locales/fr/products.json';
import frHome from '../locales/fr/home.json';

import itCommon from '../locales/it/common.json';
import itNavigation from '../locales/it/navigation.json';
import itProducts from '../locales/it/products.json';
import itHome from '../locales/it/home.json';

import arCommon from '../locales/ar/common.json';
import arNavigation from '../locales/ar/navigation.json';
import arProducts from '../locales/ar/products.json';
import arHome from '../locales/ar/home.json';

import esCommon from '../locales/es/common.json';
import esNavigation from '../locales/es/navigation.json';
import esProducts from '../locales/es/products.json';
import esHome from '../locales/es/home.json';

const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    products: enProducts,
    home: enHome,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    products: frProducts,
    home: frHome,
  },
  it: {
    common: itCommon,
    navigation: itNavigation,
    products: itProducts,
    home: itHome,
  },
  ar: {
    common: arCommon,
    navigation: arNavigation,
    products: arProducts,
    home: arHome,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    products: esProducts,
    home: esHome,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: true, // Enable debug to see what's happening
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },

    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },

    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'navigation', 'products', 'home'],

    // RTL support - removed hardcoded lng
    supportedLngs: ['en', 'fr', 'it', 'ar', 'es'],
    
    // React options
    react: {
      useSuspense: false,
    },
  })
  .then(() => {
    console.log('i18n initialized successfully');
    console.log('Current language:', i18n.language);
    console.log('Available languages:', i18n.languages);
  })
  .catch((error) => {
    console.error('i18n initialization failed:', error);
  });

export default i18n;
