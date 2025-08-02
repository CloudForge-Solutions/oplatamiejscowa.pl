import React from 'react';
import { Container, Navbar, Nav } from 'react-bootstrap';

import LanguageSwitcher from './navbar/LanguageSwitcher';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {

  return (
    <div className="min-vh-100 bg-light">
      {/* Navigation */}
      <Navbar bg="white" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary">
            <i className="bi bi-geo-alt-fill me-2"></i>
            Opłata Miejscowa
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#info" className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                Informacje
              </Nav.Link>
              <Nav.Link href="#help" className="text-muted">
                <i className="bi bi-question-circle me-1"></i>
                Pomoc
              </Nav.Link>
              <LanguageSwitcher />
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content */}
      <main className="py-4">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark text-light py-4 mt-auto">
        <Container>
          <div className="row">
            <div className="col-md-6">
              <h6>Opłata Miejscowa Online</h6>
              <p className="text-muted mb-0">
                Bezpieczna płatność opłaty miejscowej dla turystów w Polsce
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <div className="mb-2">
                <a href="#privacy" className="text-light text-decoration-none me-3">
                  Polityka prywatności
                </a>
                <a href="#terms" className="text-light text-decoration-none me-3">
                  Regulamin
                </a>
                <a href="#contact" className="text-light text-decoration-none">
                  Kontakt
                </a>
              </div>
              <small className="text-muted">
                © 2024 Opłata Miejscowa. Wszystkie prawa zastrzeżone.
              </small>
            </div>
          </div>

          {/* Security badges */}
          <div className="row mt-3 pt-3 border-top border-secondary">
            <div className="col-12 text-center">
              <small className="text-muted">
                <i className="bi bi-shield-check me-2"></i>
                Płatności zabezpieczone przez Tpay
                <span className="mx-3">|</span>
                <i className="bi bi-lock me-2"></i>
                Szyfrowanie SSL/TLS
                <span className="mx-3">|</span>
                <i className="bi bi-check-circle me-2"></i>
                GDPR Compliant
              </small>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
