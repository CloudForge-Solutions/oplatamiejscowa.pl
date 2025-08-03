/**
 * Main Layout Component - Tourist Tax Application
 *
 * RESPONSIBILITY: Mobile-first responsive layout for payment flow
 * ARCHITECTURE: Bootstrap-based, layered context integration
 * FEATURES: Simple navigation, language switching, payment focus
 */

import React from 'react';
import { Navbar, Container, Alert, Button } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';

// ARCHITECTURE COMPLIANCE: Layered Context Hooks
import { useLanguage } from '../context/LanguageContext';
import { logger } from '../../platform/CentralizedLogger';

// Components
import LanguageSwitcher from './navbar/LanguageSwitcher';
import FloatingActionButton from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { t } = useLanguage();
  const location = useLocation();

  // Log layout renders for debugging (only in development)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      logger.debug('🏗️ Layout rendered', {
        pathname: location.pathname,
        timestamp: new Date().toISOString()
      });
    }
  }, [location.pathname]);

  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Mobile-first navigation */}
      <Navbar bg="primary" variant="dark" expand="sm" className="shadow-sm">
        <Container>
          <Navbar.Brand
            href="/"
            className="fw-bold d-flex align-items-center"
            title={t('app.title', 'Tourist Tax Online Payment')}
          >
            <i className="bi bi-building me-2"></i>
            <span className="d-none d-sm-inline">Opłata Miejscowa</span>
            <span className="d-sm-none">OM</span>
          </Navbar.Brand>

          {/* Right side controls */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            {/* Language Switcher */}
            <LanguageSwitcher />

            {/* Help/Info button */}
            <Button
              variant="outline-light"
              size="sm"
              href="/help"
              title={t('navigation.help', 'Help')}
              className="border-0"
            >
              <i className="bi bi-question-circle"></i>
              <span className="d-none d-md-inline ms-1">
                {t('navigation.help', 'Help')}
              </span>
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* Main content area */}
      <main className="flex-grow-1 bg-light">
        {children}
      </main>

      {/* Mobile-friendly footer */}
      <footer className="bg-white border-top py-3 mt-auto">
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-muted">
                © 2024 {t('app.title', 'Tourist Tax Online Payment')}
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                {t('footer.securePayment', 'Secure payment powered by imoje')}
              </small>
            </div>
          </div>
        </Container>
      </footer>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Development Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="position-fixed bottom-0 start-0 m-3">
          <div className="badge bg-warning text-dark">
            <i className="bi bi-code-slash me-1"></i>
            Development Mode
            <br />
            <small>Tourist Tax App</small>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
