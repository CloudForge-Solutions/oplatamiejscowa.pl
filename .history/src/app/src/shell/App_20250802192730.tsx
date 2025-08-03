// src/shell/App.tsx - Main application component with layered context architecture
// ARCHITECTURE COMPLIANCE: Layered Context Approach for Tourist Tax Application

import React, {lazy, Suspense, useEffect, useRef} from 'react';
import {BrowserRouter, Navigate, Route, Routes, useLocation} from 'react-router-dom';
import {QueryParamProvider} from 'use-query-params';
import {ReactRouter6Adapter} from 'use-query-params/adapters/react-router-6';
import { Container } from 'react-bootstrap';

// ARCHITECTURE COMPLIANCE: Layered Context Providers
import {ServiceProvider} from './context/ServiceContext';
import {LanguageProvider} from './context/LanguageContext';
import {TouristTaxProvider} from './context/TouristTaxContext';

// Shell components
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import HelpPage from './components/HelpPage';
import {logger} from '../platform/CentralizedLogger';

// ARCHITECTURE COMPLIANCE: Initialize i18n configuration
import './i18n/config';

// Lazy load pages for better performance
const PaymentPage = lazy(() => import('../apps/tourist-tax/PaymentPage'));

// Constants
import { MOBILE_CONSTANTS } from '@/constants';

/**
 * AppRoutes - Main routing configuration for Tourist Tax
 * ARCHITECTURE COMPLIANCE: Clean route structure with lazy loading
 */
const AppRoutes: React.FC = () => {
    return (
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
    );
};

/**
 * App - Main application component
 * ARCHITECTURE COMPLIANCE: Layered Context Architecture for Tourist Tax
 *
 * Layer 1: ServiceProvider (Core services)
 * Layer 2: BrowserRouter + QueryParamProvider (URL state)
 * Layer 3: LanguageProvider (i18n - depends on QueryParamProvider)
 * Layer 4: TouristTaxProvider (Payment flow management)
 */
const App: React.FC = () => {
    useEffect(() => {
        logger.info('🚀 Tourist Tax App component initializing');
    }, []);

    return (
        <ErrorBoundary>
            <BrowserRouter>
                <QueryParamProvider adapter={ReactRouter6Adapter}>
                    {/* ARCHITECTURE: Layered Context Approach */}
                    <ServiceProvider>        {/* Layer 1: Services (Static) */}
                        <LanguageProvider>     {/* Layer 2: Language (Semi-Static) */}
                            <TouristTaxProvider>     {/* Layer 3: Tourist Tax (Dynamic) */}
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
                                        <Suspense fallback={<LoadingSpinner />}>
                                            <AppRoutes />
                                        </Suspense>
                                    </Container>
                                </Layout>
                            </TouristTaxProvider>
                        </LanguageProvider>
                    </ServiceProvider>
                </QueryParamProvider>
            </BrowserRouter>
        </ErrorBoundary>
    );
};

export default App;
