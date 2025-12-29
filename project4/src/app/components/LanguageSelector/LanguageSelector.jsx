"use client";
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/app/context/LanguageContext';
import styles from './LanguageSelector.module.css';
import { MdKeyboardArrowDown } from 'react-icons/md';

const LanguageSelector = () => {
  const { language, changeLanguage, isClient } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'VI', name: 'Tiếng Việt', flag: '🇻🇳' }
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode) => {
    changeLanguage(langCode);
    setIsOpen(false);
  };

  const handleToggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className={styles.languageSelector}>
        <div className={styles.languageButton}>
          <div className={styles.flagContainer}>
            <span className={styles.currentFlag}>🇺🇸</span>
          </div>
          <MdKeyboardArrowDown size={14} className={styles.arrow} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.languageSelector} ref={dropdownRef}>
      <button 
        className={styles.languageButton}
        onClick={handleToggleDropdown}
        aria-label="Select Language"
        type="button"
      >
        <div className={styles.flagContainer}>
          <span className={styles.currentFlag}>{currentLanguage?.flag || '🇺🇸'}</span>
        </div>
        <MdKeyboardArrowDown 
          size={14} 
          className={`${styles.arrow} ${isOpen ? styles.arrowUp : ''}`}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {languages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`${styles.dropdownItem} ${
                language === lang.code ? styles.active : ''
              }`}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <div className={styles.flagContainer}>
                <span className={styles.flag}>{lang.flag}</span>
              </div>
              <span className={styles.langName}>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector; 