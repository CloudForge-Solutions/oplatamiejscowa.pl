// Tourist Mode Navbar - Minimal Design
// Simple navigation for tourist tax payment

import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Tourist navbar component props
 */
interface TouristNavbarProps {
  onModeSwitch: (mode: 'landlord') => void;
}

/**
 * Tourist Navbar Component
 *
 * Minimal navigation for tourist mode with mode switching capability.
 *
 * @param props - Tourist navbar props
 * @returns JSX.Element
 */
const TouristNavbar: React.FC<TouristNavbarProps> = ({ onModeSwitch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm tourist-navbar">
      <Container fluid>
        {/* Brand Logo with Friendly Design */}
        <Navbar.Brand
          className="d-flex align-items-center me-4"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <div className="app-logo me-2 friendly-logo">
            <i className="bi bi-geo-alt-fill"></i>
          </div>
          <div>
            <span className="fw-bold text-dark">
              {t('app.name', 'Tourist Tax Online')}
            </span>
            <div className="friendly-tagline">
              {t('app.tagline', 'Szybko i bezpiecznie')}
            </div>
          </div>
        </Navbar.Brand>

        {/* Right Side Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* Switch to Landlord Mode */}
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onModeSwitch('landlord')}
            className="d-flex align-items-center"
            title={t('common:mode.landlord', 'Właściciel')}
          >
            <i className="bi bi-building me-1"></i>
            <span className="d-none d-md-inline">
              {t('common:mode.landlord', 'Właściciel')}
            </span>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />
        </div>
      </Container>
    </Navbar>
  );
};

export default TouristNavbar;
