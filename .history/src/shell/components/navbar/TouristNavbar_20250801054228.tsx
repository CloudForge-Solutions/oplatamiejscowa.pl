// Tourist Mode Navbar - Minimal Design
// Simple navigation for tourist tax payment

import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface TouristNavbarProps {
  onModeSwitch: (mode: 'landlord') => void;
}

const TouristNavbar: React.FC<TouristNavbarProps> = ({ onModeSwitch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Navbar bg="white" className="navbar border-bottom">
      <Container fluid>
        {/* Brand Logo */}
        <Navbar.Brand
          className="navbar-brand"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <div className="app-logo">
            T
          </div>
          <span className="brand-text">
            {t('app.name', 'Opłata Miejscowa')}
          </span>
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
