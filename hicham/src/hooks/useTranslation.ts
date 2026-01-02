import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

  const changeLanguage = async (language: string) => {
    try {
      await i18n.changeLanguage(language);
      // Force a re-render by updating localStorage
      localStorage.setItem('i18nextLng', language);
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  const getCurrentLanguage = () => {
    return i18n.language || 'en';
  };

  const isRTL = () => {
    return i18n.language === 'ar';
  };

  return {
    t,
    changeLanguage,
    getCurrentLanguage,
    isRTL,
    i18n,
  };
};

export default useTranslation;
