import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Bootstrap Icons (Bootstrap CSS is imported via main.scss)
import 'bootstrap-icons/font/bootstrap-icons.css';

// Import i18n configuration
import './i18n/config';

// Import shell components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import NotFoundPage from './components/NotFoundPage';

// Import tourist tax components
import TouristPaymentForm from '../apps/tourist-tax/components/TouristPaymentForm';
import LandlordDashboard from '../apps/tourist-tax/components/LandlordDashboard';

// Import context providers
import { LanguageProvider } from './context/LanguageContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Tourist Mode Routes */}
              <Route path='/' element={<TouristPaymentForm />} />
              <Route path='/tourist' element={<TouristPaymentForm />} />
              <Route path='/pay' element={<TouristPaymentForm />} />

              {/* Landlord Mode Routes */}
              <Route path='/landlord' element={<LandlordOverview />} />
              <Route path='/landlord/dashboard' element={<LandlordOverview />} />
              <Route path='/landlord/reservations' element={<LandlordReservations />} />
              <Route path='/landlord/payments' element={<LandlordPayments />} />
              <Route path='/landlord/reports' element={<LandlordReports />} />
              <Route path='/landlord/generate-bill' element={<LandlordGenerateBill />} />
              <Route path='/landlord/import' element={<LandlordImport />} />

              {/* Legacy routes */}
              <Route path='/tourist-tax' element={<TouristTaxPage />} />
              <Route path='/payment' element={<Navigate to='/' replace />} />

              {/* 404 page */}
              <Route path='*' element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
