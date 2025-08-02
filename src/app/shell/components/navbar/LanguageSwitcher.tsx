// Language switcher component for Tourist Tax Payment System
// Bootstrap-compatible, desktop-only, no page reload

import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Language Switcher Component
 * 
 * Simple language switcher for Polish/English support
 * - Bootstrap Dropdown for consistent styling
 * - Desktop-optimized (no mobile considerations)
 * - No page reload on language change
 * - i18next integration
 */
const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'pl', name: 'Polski', flag: '🇵🇱' },
    { code: 'en', name: 'English', flag: '🇬🇧' }
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      
      // Update document language attribute
      document.documentElement.lang = languageCode;
      
      // Store preference in localStorage
      localStorage.setItem('tourist-tax-language', languageCode);
      
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  return (
    <Dropdown align="end" className="language-switcher">
      <Dropdown.Toggle
        variant="outline-light"
        size="sm"
        className="d-flex align-items-center border-0"
        title={t('navigation.navbar.language')}
      >
        <span className="me-1">{currentLanguage.flag}</span>
        <span className="d-none d-md-inline">
          {currentLanguage.name}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header className="text-muted small">
          {t('navigation.navbar.language')}
        </Dropdown.Header>

        {languages.map(language => (
          <Dropdown.Item
            key={language.code}
            active={language.code === i18n.language}
            onClick={() => handleLanguageChange(language.code)}
            className="d-flex align-items-center"
          >
            <span className="me-2">{language.flag}</span>
            <span>{language.name}</span>
            {language.code === i18n.language && (
              <i className="bi bi-check-lg ms-auto text-success"></i>
            )}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
