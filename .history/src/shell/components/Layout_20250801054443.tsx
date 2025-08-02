// Layout component for Tourist Tax Payment System
// Adapted from mVAT with dual-mode support

import React, { useCallback, useMemo } from 'react';
import { Badge } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import TouristNavbar from './navbar/TouristNavbar';
import LandlordNavbar from './navbar/LandlordNavbar';
import FloatingActionButton from './FloatingActionButton';

/**
 * Application mode types
 */
export type AppMode = 'tourist' | 'landlord';

/**
 * Layout component props
 */
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Mode switch handler type
 */
type ModeHandler = (mode: AppMode) => void;

/**
 * Main Layout Component
 *
 * Provides the application shell with mode-specific navigation.
 * Automatically detects current mode from route and renders appropriate navbar.
 *
 * @param props - Layout component props
 * @returns JSX.Element
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Detect current mode from route
  const currentMode = useMemo((): AppMode => {
    return location.pathname.startsWith('/landlord') ? 'landlord' : 'tourist';
  }, [location.pathname]);

  /**
   * Handle mode switching with proper navigation
   */
  const handleModeSwitch = useCallback<ModeHandler>((newMode: AppMode) => {
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
