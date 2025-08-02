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

  // Mode state: 'tourist' or 'landlord'
  const [mode, setMode] = useState<'tourist' | 'landlord'>('tourist');

  const handleModeSwitch = useCallback((newMode: 'tourist' | 'landlord') => {
    setMode(newMode);
    // Navigate to appropriate route based on mode
    if (newMode === 'tourist') {
      navigate('/');
    } else {
      navigate('/landlord');
    }
  }, [navigate]);

  const isActiveRoute = (path: string) => {
    return location.pathname.startsWith(path);
  };

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
                variant={mode === 'tourist' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleModeSwitch('tourist')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-person me-1"></i>
                <span className="d-none d-md-inline">
                  {t('mode.tourist', 'Turysta')}
                </span>
              </Button>
              <Button
                variant={mode === 'landlord' ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => handleModeSwitch('landlord')}
                className="d-flex align-items-center"
              >
                <i className="bi bi-building me-1"></i>
                <span className="d-none d-md-inline">
                  {t('mode.landlord', 'Właściciel')}
                </span>
              </Button>
            </div>
          </div>

          {/* Navigation based on mode */}
          {mode === 'landlord' && (
            <Nav className="me-auto ms-4">
              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/dashboard') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/dashboard')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-speedometer2 me-1"></i>
                {t('navigation.dashboard', 'Panel')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/reservations') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/reservations')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-calendar-check me-1"></i>
                {t('navigation.reservations', 'Rezerwacje')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/payments') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/payments')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-credit-card me-1"></i>
                {t('navigation.payments', 'Płatności')}
              </Nav.Link>

              <Nav.Link
                className={`px-3 py-2 ${isActiveRoute('/landlord/reports') ? 'active fw-bold' : ''}`}
                onClick={() => navigate('/landlord/reports')}
                style={{ cursor: 'pointer' }}
              >
                <i className="bi bi-graph-up me-1"></i>
                {t('navigation.reports', 'Raporty')}
              </Nav.Link>
            </Nav>
          )}

          {/* Right Side Controls */}
          <div className="d-flex align-items-center gap-2">
            {/* Mode-specific action buttons */}
            {mode === 'landlord' && (
              <>
                {/* Generate Payment Bill Button */}
                <Button
                  variant="success"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => navigate('/landlord/generate-bill')}
                  title={t('actions.generateBill', 'Generuj rachunek z QR')}
                >
                  <i className="bi bi-qr-code me-2"></i>
                  <span className="d-none d-md-inline">
                    {t('actions.generateBill', 'QR Rachunek')}
                  </span>
                  <span className="d-md-none">QR</span>
                </Button>

                {/* Import Reservations Button */}
                <Button
                  variant="outline-primary"
                  size="sm"
                  className="d-flex align-items-center"
                  onClick={() => navigate('/landlord/import')}
                  title={t('actions.importReservations', 'Importuj rezerwacje')}
                >
                  <i className="bi bi-upload me-2"></i>
                  <span className="d-none d-lg-inline">
                    {t('actions.import', 'Import')}
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
                  {t('navigation.help', 'Pomoc')}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item>
                  <i className="bi bi-book me-2"></i>
                  {t('help.guide', 'Przewodnik')}
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bi bi-telephone me-2"></i>
                  {t('help.contact', 'Kontakt')}
                </Dropdown.Item>
                <Dropdown.Item>
                  <i className="bi bi-info-circle me-2"></i>
                  {t('help.about', 'O aplikacji')}
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
