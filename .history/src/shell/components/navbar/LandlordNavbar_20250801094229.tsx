// Landlord Mode Navbar - Full Featured
// Complete navigation for property management

import React, { useCallback } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

/**
 * Landlord navbar component props
 */
interface LandlordNavbarProps {
  onModeSwitch: (mode: 'tourist') => void;
}

/**
 * Landlord Navbar Component
 *
 * Full-featured navigation for landlord mode with complete menu and actions.
 *
 * @param props - Landlord navbar props
 * @returns JSX.Element
 */
const LandlordNavbar: React.FC<LandlordNavbarProps> = ({ onModeSwitch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Check if a route is currently active
   */
  const isActiveRoute = useCallback((path: string): boolean => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <Navbar bg="white" expand="lg" className="border-bottom shadow-sm">
      <Container fluid>
        {/* Brand Logo */}
        <Navbar.Brand
          className="d-flex align-items-center me-4"
          onClick={() => navigate('/landlord')}
          style={{ cursor: 'pointer' }}
        >
          <div className="app-logo me-2">
            T
          </div>
          <span className="fw-bold text-dark">
            {t('app.name', 'Tourist Tax Online')}
          </span>
        </Navbar.Brand>

        {/* Main Navigation */}
        <Nav className="me-auto">
          <Nav.Link
            className={isActiveRoute('/landlord/dashboard') || location.pathname === '/landlord' ? 'active' : ''}
            onClick={() => navigate('/landlord')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-speedometer2 me-1"></i>
            {t('common:navigation.dashboard', 'Dashboard')}
          </Nav.Link>

          <Nav.Link
            className={isActiveRoute('/landlord/reservations') ? 'active' : ''}
            onClick={() => navigate('/landlord/reservations')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-calendar-check me-1"></i>
            {t('common:navigation.reservations', 'Stays & Payments')}
          </Nav.Link>

          <Nav.Link
            className={isActiveRoute('/landlord/reports') ? 'active' : ''}
            onClick={() => navigate('/landlord/reports')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-graph-up me-1"></i>
            {t('common:navigation.reports', 'Reports')}
          </Nav.Link>
        </Nav>

        {/* Right Side Controls */}
        <div className="d-flex align-items-center gap-2">
          {/* Quick Actions */}
          <Button
            variant="success"
            size="sm"
            className="d-flex align-items-center"
            onClick={() => navigate('/landlord/generate-bill')}
            title={t('common:actions.generateBill', 'Generuj rachunek z QR')}
          >
            <i className="bi bi-qr-code me-1"></i>
            <span className="d-none d-md-inline">
              {t('common:actions.generateBill', 'QR Rachunek')}
            </span>
          </Button>

          <Button
            variant="outline-primary"
            size="sm"
            className="d-flex align-items-center"
            onClick={() => navigate('/landlord/import')}
            title={t('common:actions.importReservations', 'Importuj rezerwacje')}
          >
            <i className="bi bi-upload me-1"></i>
            <span className="d-none d-lg-inline">
              {t('common:actions.import', 'Import')}
            </span>
          </Button>

          {/* Switch to Tourist Mode */}
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onModeSwitch('tourist')}
            className="d-flex align-items-center"
            title={t('common:mode.tourist', 'Turysta')}
          >
            <i className="bi bi-person me-1"></i>
            <span className="d-none d-md-inline">
              {t('common:mode.tourist', 'Turysta')}
            </span>
          </Button>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Help/Support */}
          <Dropdown align="end">
            <Dropdown.Toggle variant="outline-secondary" size="sm" id="help-menu">
              <i className="bi bi-question-circle"></i>
              <span className="ms-1 d-none d-md-inline">
                {t('common:navigation.help', 'Pomoc')}
              </span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item>
                <i className="bi bi-book me-2"></i>
                {t('common:help.guide', 'Przewodnik')}
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-telephone me-2"></i>
                {t('common:help.contact', 'Kontakt')}
              </Dropdown.Item>
              <Dropdown.Item>
                <i className="bi bi-info-circle me-2"></i>
                {t('common:help.about', 'O aplikacji')}
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Container>
    </Navbar>
  );
};

export default LandlordNavbar;
