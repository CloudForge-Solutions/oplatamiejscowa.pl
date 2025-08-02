// Layout component for Tourist Tax Payment System
// Adapted from mVAT with dual-mode support

import React, { useCallback, useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import TouristNavbar from './navbar/TouristNavbar';
import LandlordNavbar from './navbar/LandlordNavbar';
import FloatingActionButton from './FloatingActionButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
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

  return (
    <div className="d-flex flex-column vh-100">
      {/* Mode-specific Navbar */}
      {currentMode === 'tourist' ? (
        <TouristNavbar onModeSwitch={handleModeSwitch} />
      ) : (
        <LandlordNavbar onModeSwitch={handleModeSwitch} />
      )}

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
            Mode: {currentMode} | Dev
          </Badge>
        </div>
      )}
    </div>
  );
};

export default Layout;
