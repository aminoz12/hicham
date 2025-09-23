import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useTranslation = (namespace?: string) => {
  const { t, i18n } = useI18nTranslation(namespace);

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
  };

  const getCurrentLanguage = () => {
    return i18n.language;
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
