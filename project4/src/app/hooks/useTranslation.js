"use client";
import { useLanguage } from '../context/LanguageContext';
import { t } from '../translations';

export const useTranslation = () => {
  const { language } = useLanguage();
  
  return (key) => t(key, language);
}; 