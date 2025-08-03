/**
 * Language Switcher Component - Tourist Tax Application
 *
 * ARCHITECTURE COMPLIANCE: Layer 2 (Language Context) integration
 * - Bootstrap Dropdown for consistent styling
 * - Mobile-first responsive design
 * - No page reload on language change
 * - Event-driven updates
 * - Tourist tax specific language options
 */

import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useLanguage } from '../../context/LanguageContext';
import { logger } from '../../../platform/CentralizedLogger';

const LanguageSwitcher: React.FC = () => {
  const {
    currentLanguage,
    availableLanguages,
    switchLanguage,
    getLanguageName,
    getLanguageFlag,
    t
  } = useLanguage();

  // CRITICAL FIX: Only log on actual language changes, not every render
  const lastLanguageRef = React.useRef(currentLanguage);
  if (lastLanguageRef.current !== currentLanguage) {
    logger.info('🌐 LanguageSwitcher language changed', {
      from: lastLanguageRef.current,
      to: currentLanguage,
      availableLanguages,
      hasContext: !!currentLanguage
    });
    lastLanguageRef.current = currentLanguage;
  }

  const handleLanguageChange = async (language: string) => {
    try {
      logger.info('🌐 User initiated language change', {
        from: currentLanguage,
        to: language
      });

      await switchLanguage(language);
    } catch (error) {
      logger.error('❌ Language change failed', {
        language,
        error: error instanceof Error ? error.message : String(error)
      });

      // Could show toast notification here in the future
      console.error('Failed to change language:', error);
    }
  };

  return (
    <Dropdown align="end" className="language-switcher">
      <Dropdown.Toggle
        variant="outline-light"
        size="sm"
        className="d-flex align-items-center border-0"
        title={t('language.switchLanguage', 'Switch Language')}
      >
        <span className="me-1">{getLanguageFlag(currentLanguage)}</span>
        <span className="d-none d-md-inline">
          {getLanguageName(currentLanguage)}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Header className="text-muted small">
          {t('language.selectLanguage', 'Select Language')}
        </Dropdown.Header>

        {availableLanguages.map(language => (
          <Dropdown.Item
            key={language}
            active={language === currentLanguage}
            onClick={() => handleLanguageChange(language)}
            className="d-flex align-items-center"
          >
            <span className="me-2">{getLanguageFlag(language)}</span>
            <span>{getLanguageName(language)}</span>
            {language === currentLanguage && (
              <i className="bi bi-check-lg ms-auto text-success"></i>
            )}
          </Dropdown.Item>
        ))}

        <Dropdown.Divider />
        <Dropdown.ItemText className="text-muted small">
          {t('language.currentLanguage', 'Current')}: {getLanguageName(currentLanguage)}
        </Dropdown.ItemText>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
