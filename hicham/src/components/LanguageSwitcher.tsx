import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface Language {
  code: string;
  name: string;
  flag: string;
  dir: 'ltr' | 'rtl';
}

const languages: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹', dir: 'ltr' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'es', name: 'Español', flag: '🇪🇸', dir: 'ltr' }
];

const LanguageSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { changeLanguage, getCurrentLanguage } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const currentLang = getCurrentLanguage();
    return languages.find(lang => lang.code === currentLang) || languages[0];
  });

  useEffect(() => {
    const currentLang = getCurrentLanguage();
    const lang = languages.find(l => l.code === currentLang) || languages[0];
    setSelectedLanguage(lang);
    
    // Update document direction for RTL languages
    document.documentElement.dir = lang.dir;
    document.documentElement.lang = lang.code;
  }, [getCurrentLanguage]);

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setIsOpen(false);
    
    // Change language using i18next
    changeLanguage(language.code);
    
    // Update document direction for RTL languages
    document.documentElement.dir = language.dir;
    document.documentElement.lang = language.code;
    
    // Store language preference in the format i18next expects
    localStorage.setItem('i18nextLng', language.code);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-gray-600" />
        <span className="text-sm font-medium text-gray-700">
          {selectedLanguage.flag}
        </span>
        <span className="hidden sm:inline text-sm text-gray-600">
          {selectedLanguage.code.toUpperCase()}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden"
            >
              <div className="py-2">
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-gray-50 ${
                      selectedLanguage.code === language.code
                        ? 'bg-primary-50 text-primary-700'
                        : 'text-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{language.flag}</span>
                      <span className="font-medium">{language.name}</span>
                    </div>
                    {selectedLanguage.code === language.code && (
                      <Check className="h-4 w-4 text-primary-600" />
                    )}
                  </button>
                ))}
              </div>
              
              {/* Footer */}
              <div className="border-t border-gray-100 px-4 py-2">
                <p className="text-xs text-gray-500 text-center">
                  More languages coming soon
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
