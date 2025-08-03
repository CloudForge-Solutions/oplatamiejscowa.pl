/**
 * Floating Action Button - Tourist Tax Application
 * 
 * RESPONSIBILITY: Provide quick access to help and support during payment flow
 * ARCHITECTURE: Mobile-first design with contextual actions
 * FEATURES: Help, support, and payment assistance
 */

import React, { useState, useCallback } from 'react';
import { Button, Dropdown } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { logger } from '../../platform/CentralizedLogger';

interface QuickAction {
  action: string;
  label: string;
  icon: string;
  variant: string;
  href?: string;
  onClick?: () => void;
}

const FloatingActionButton: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const [showActions, setShowActions] = useState(false);

  // Don't show FAB on certain pages where it might interfere
  const hiddenPaths = ['/help', '/contact', '/success', '/error'];
  const shouldHide = hiddenPaths.some(path => location.pathname.startsWith(path));

  const handleMainAction = useCallback(() => {
    logger.info('🔘 FAB main action clicked - Help requested', {
      pathname: location.pathname,
      timestamp: new Date().toISOString()
    });

    // Navigate to help page
    window.open('/help', '_blank');
  }, [location.pathname]);

  const handleQuickAction = useCallback((action: QuickAction) => {
    logger.info('🔘 Quick action selected', {
      action: action.action,
      label: action.label,
      pathname: location.pathname
    });

    if (action.href) {
      window.open(action.href, '_blank');
    } else if (action.onClick) {
      action.onClick();
    }

    setShowActions(false);
  }, [location.pathname]);

  // Don't render if on hidden paths
  if (shouldHide) {
    return null;
  }

  const quickActions: QuickAction[] = [
    {
      action: 'help',
      label: t('fab.help', 'Help & FAQ'),
      icon: 'bi-question-circle',
      variant: 'info',
      href: '/help'
    },
    {
      action: 'contact',
      label: t('fab.contact', 'Contact Support'),
      icon: 'bi-headset',
      variant: 'primary',
      href: '/contact'
    },
    {
      action: 'payment-info',
      label: t('fab.paymentInfo', 'Payment Information'),
      icon: 'bi-credit-card',
      variant: 'success',
      href: '/help#payment'
    },
    {
      action: 'language',
      label: t('fab.language', 'Change Language'),
      icon: 'bi-translate',
      variant: 'secondary',
      onClick: () => {
        // Focus on language switcher in navbar
        const languageSwitcher = document.querySelector('.language-switcher button');
        if (languageSwitcher) {
          (languageSwitcher as HTMLElement).click();
        }
      }
    }
  ];

  return (
    <div
      className="position-fixed"
      style={{
        bottom: '20px',
        right: '20px',
        zIndex: 1050
      }}
    >
      {/* Quick Actions Dropdown */}
      <Dropdown
        show={showActions}
        onToggle={setShowActions}
        drop="up"
        align="end"
        className="mb-2"
      >
        <Dropdown.Toggle
          as={Button}
          variant="outline-primary"
          className="rounded-circle d-flex align-items-center justify-content-center"
          style={{
            width: '50px',
            height: '50px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            backgroundColor: 'white'
          }}
          title={t('fab.quickActions', 'Quick Actions')}
        >
          <i className="bi bi-three-dots" style={{ fontSize: '1.2rem' }}></i>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="shadow-lg border-0"
          style={{
            minWidth: '220px',
            borderRadius: '12px',
            marginBottom: '10px'
          }}
        >
          <Dropdown.Header className="text-muted small">
            <i className="bi bi-lightning me-1"></i>
            {t('fab.quickActions', 'Quick Actions')}
          </Dropdown.Header>
          <Dropdown.Divider />

          {quickActions.map((actionItem, index) => (
            <Dropdown.Item
              key={index}
              onClick={() => handleQuickAction(actionItem)}
              className="d-flex align-items-center py-2"
              style={{
                borderRadius: '8px',
                margin: '0.25rem 0.5rem',
                transition: 'all 0.2s ease'
              }}
            >
              <i className={`${actionItem.icon} me-3 text-${actionItem.variant}`}></i>
              <span>{actionItem.label}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Main FAB Button */}
      <Button
        variant="primary"
        className="rounded-circle d-flex align-items-center justify-content-center"
        onClick={handleMainAction}
        style={{
          width: '60px',
          height: '60px',
          border: 'none',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        title={t('fab.help', 'Get Help')}
      >
        <i className="bi bi-question-circle" style={{ fontSize: '1.5rem' }}></i>
      </Button>
    </div>
  );
};

export default FloatingActionButton;
