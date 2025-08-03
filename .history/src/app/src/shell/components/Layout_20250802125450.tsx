/**
 * Main Layout Component
 * 
 * RESPONSIBILITY: Mobile-first responsive layout
 * ARCHITECTURE: Bootstrap-based, no framework fighting
 */

import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Mobile-first navigation */}
      <Navbar bg="primary" variant="dark" expand="sm" className="shadow-sm">
        <Container>
          <Navbar.Brand href="/help" className="fw-bold">
            <i className="bi bi-building me-2"></i>
            Opłata Miejscowa
          </Navbar.Brand>
          
          {/* Language switcher will be added here */}
          <div className="ms-auto">
            {/* TODO: Add language switcher component */}
            <span className="text-light small">PL</span>
          </div>
        </Container>
      </Navbar>

      {/* Main content area */}
      <main className="flex-grow-1">
        {children}
      </main>

      {/* Mobile-friendly footer */}
      <footer className="bg-light border-top py-3 mt-auto">
        <Container>
          <div className="row align-items-center">
            <div className="col-md-6">
              <small className="text-muted">
                © 2024 Opłata Miejscowa Online
              </small>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                Secure payment powered by imoje
              </small>
            </div>
          </div>
        </Container>
      </footer>
    </div>
  );
};

export default Layout;
