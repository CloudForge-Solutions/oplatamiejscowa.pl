import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import i18n configuration
import './i18n/config';

// Import components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import NotFoundPage from './components/NotFoundPage';

// Import tourist tax app
import TouristTaxPage from '../apps/tourist-tax/TouristTaxPage';

// Import context providers
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Main tourist tax route */}
              <Route path="/" element={<TouristTaxPage />} />
              <Route path="/tourist-tax" element={<TouristTaxPage />} />

              {/* Redirect old paths */}
              <Route path="/payment" element={<Navigate to="/" replace />} />
              <Route path="/pay" element={<Navigate to="/" replace />} />

              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
