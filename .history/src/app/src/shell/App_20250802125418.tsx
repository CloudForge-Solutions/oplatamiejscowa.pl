/**
 * Root Application Component
 * 
 * ARCHITECTURE: 3-layer context architecture
 * - ServiceContext: Static services (never change)
 * - LanguageContext: Semi-static (infrequent changes)
 * - TouristTaxContext: Dynamic (payment flow changes)
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

// Context providers (3-layer architecture)
import { ServiceProvider } from './context/ServiceContext';
import { LanguageProvider } from './context/LanguageContext';
import { TouristTaxProvider } from './context/TouristTaxContext';

// Shell components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';

// Application pages
import PaymentPage from '../apps/tourist-tax/PaymentPage';

// Constants
import { MOBILE_CONSTANTS } from '../constants';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ServiceProvider>
        <LanguageProvider>
          <TouristTaxProvider>
            <Layout>
              <Container 
                fluid 
                className="p-0"
                style={{ 
                  minHeight: '100vh',
                  // Mobile-first responsive design
                  maxWidth: window.innerWidth < MOBILE_CONSTANTS.VIEWPORT_BREAKPOINTS.MOBILE 
                    ? '100%' 
                    : '1200px'
                }}
              >
                <Routes>
                  {/* Payment route with reservation ID */}
                  <Route 
                    path="/p/:reservationId" 
                    element={<PaymentPage />} 
                  />
                  
                  {/* Default redirect to help page */}
                  <Route 
                    path="/" 
                    element={<Navigate to="/help" replace />} 
                  />
                  
                  {/* Help page for users without direct payment link */}
                  <Route 
                    path="/help" 
                    element={
                      <Container className="text-center py-5">
                        <h1>Opłata Miejscowa Online</h1>
                        <p className="lead">
                          To pay your tourist tax, please use the payment link 
                          provided by your accommodation.
                        </p>
                        <p className="text-muted">
                          If you don't have a payment link, please contact 
                          your accommodation provider.
                        </p>
                      </Container>
                    } 
                  />
                  
                  {/* Catch-all route */}
                  <Route 
                    path="*" 
                    element={<Navigate to="/help" replace />} 
                  />
                </Routes>
              </Container>
            </Layout>
          </TouristTaxProvider>
        </LanguageProvider>
      </ServiceProvider>
    </ErrorBoundary>
  );
};

export default App;
