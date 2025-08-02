// Layout component for Tourist Tax Payment System
// Adapted from mVAT with dual-mode support

import React, { useCallback, useMemo } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './navbar/LanguageSwitcher';
import FloatingActionButton from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Detect current mode from route
  const currentMode = useMemo((): 'tourist' | 'landlord' => {
    return location.pathname.startsWith('/landlord') ? 'landlord' : 'tourist';
  }, [location.pathname]);

  const handleModeSwitch = useCallback((newMode: 'tourist' | 'landlord') => {
    // Navigate to appropriate route based on mode
    if (newMode === 'tourist') {
      navigate('/');
    } else {
      navigate('/landlord');
    }
  }, [navigate]);

  const isActiveRoute = useCallback((path: string) => {
    return location.pathname.startsWith(path);
  }, [location.pathname]);

  return (
    <div className="d-flex flex-column vh-100">
      {/* Professional Navbar - mVAT Standard */}
      <Navbar bg="white" expand="lg" className="navbar">
        <Container fluid>
          {/* Brand Logo */}
          <Navbar.Brand
            className="navbar-brand"
            onClick={() => navigate('/')}
          >
            <div className="app-logo">
              T
            </div>
            <span className="brand-text">
              {t('app.name', 'Opłata Miejscowa')}
            </span>
          </Navbar.Brand>

          {/* Mode Switcher - Central Toggle */}
          <div className="d-flex align-items-center me-auto">
            <div className="btn-group" role="group">
              <Button
                variant={currentMode === 'tourist' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleModeSwitch('tourist')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-person me-1"></i>
                <span className="d-none d-md-inline">
                  {t('common:mode.tourist', 'Turysta')}
                </span>
              </Button>
              <Button
                variant={currentMode === 'landlord' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleModeSwitch('landlord')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-building me-1"></i>
                <span className="d-none d-md-inline">
                  {t('common:mode.landlord', 'Właściciel')}
                </span>
              </Button>
            </div>
          </div>

          {/* Navigation based on mode */}
          {currentMode === 'landlord' && (
            <Nav className="me-auto ms-4">
              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/dashboard') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/dashboard')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-speedometer2 me-1"></i>
                {t('common:navigation.dashboard', 'Panel')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/reservations') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/reservations')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-calendar-check me-1"></i>
                {t('common:navigation.reservations', 'Rezerwacje')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/payments') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/payments')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-credit-card me-1"></i>
                {t('common:navigation.payments', 'Płatności')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/reports') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/reports')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-graph-up me-1"></i>
                {t('common:navigation.reports', 'Raporty')}
              </Nav.Link>
            </Nav>
          )}

          {/* Right Side Controls */}
          <div className="d-flex align-items-center gap-2">
            {/* Mode-specific action buttons */}
            {currentMode === 'landlord' && (
              <>
                {/* Generate Payment Bill Button */}
                <Button
                  variant="success"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => navigate('/landlord/generate-bill')}
                  title={t('common:actions.generateBill', 'Generuj rachunek z QR')}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  <span className="d-none d-md-inline">
                    {t('common:actions.generateBill', 'QR Rachunek')}
                  </span>
                  <span className="d-md-none">QR</span>
                </Button>

                {/* Import Reservations Button */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => navigate('/landlord/import')}
                  title={t('common:actions.importReservations', 'Importuj rezerwacje')}
                >
                  <i className="bi bi-upload me-2"></i>
                  <span className="d-none d-lg-inline">
                    {t('common:actions.import', 'Import')}
                  </span>
                </Button>
              </>
            )}

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

      {/* Main Content Area */}
      <main className="flex-grow-1 overflow-auto bg-light">
        {children}
      </main>

      {/* Floating Action Button - mVAT Professional UX */}
      <FloatingActionButton />

      {/* Development Mode Indicator */}
      {import.meta.env.DEV && (
        <div className="position-fixed bottom-0 end-0 m-3">
          <Badge bg="warning" className="text-dark">
            Mode: {mode} | Dev
          </Badge>
        </div>
      )}
    </div>
  );
};

export default Layout;
