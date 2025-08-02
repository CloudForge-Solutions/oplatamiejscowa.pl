// Floating Action Button - mVAT Professional Pattern
// Modern UX component for primary actions

import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface FABAction {
  id: string;
  icon: string;
  label: string;
  action: () => void;
  variant?: 'primary' | 'success' | 'info' | 'warning';
}

const FloatingActionButton: React.FC = () => {
  const { t } = useTranslation(['tourist-tax', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  // Determine actions based on current route
  const getActions = (): FABAction[] => {
    if (location.pathname.startsWith('/landlord')) {
      return [
        {
          id: 'generate-bill',
          icon: 'bi-qr-code',
          label: t('landlord.generateBill', 'Generate QR Bill'),
          action: () => navigate('/landlord/generate-bill'),
          variant: 'success'
        },
        {
          id: 'import-reservations',
          icon: 'bi-upload',
          label: t('landlord.importReservations', 'Import Reservations'),
          action: () => navigate('/landlord/import'),
          variant: 'info'
        },
        {
          id: 'new-payment',
          icon: 'bi-plus-circle',
          label: t('actions.newPayment', 'New Payment'),
          action: () => navigate('/'),
          variant: 'primary'
        }
      ];
    } else {
      // Tourist mode actions
      return [
        {
          id: 'new-payment',
          icon: 'bi-plus-circle',
          label: t('actions.newPayment', 'New Payment'),
          action: () => navigate('/'),
          variant: 'primary'
        },
        {
          id: 'landlord-mode',
          icon: 'bi-building',
          label: t('mode.landlord', 'Landlord Mode'),
          action: () => navigate('/landlord'),
          variant: 'info'
        }
      ];
    }
  };

  const actions = getActions();
  const primaryAction = actions[0];

  const handlePrimaryAction = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else if (actions.length === 1) {
      primaryAction.action();
    } else {
      setIsExpanded(true);
    }
  };

  const handleSecondaryAction = (action: FABAction) => {
    action.action();
    setIsExpanded(false);
  };

  return (
    <div className="fab-container">
      {/* Secondary Actions (when expanded) */}
      {isExpanded && actions.length > 1 && (
        <div className="fab-menu">
          {actions.slice(1).reverse().map((action, index) => (
            <OverlayTrigger
              key={action.id}
              placement="left"
              overlay={<Tooltip id={`fab-tooltip-${action.id}`}>{action.label}</Tooltip>}
            >
              <Button
                className={`fab-secondary fab-secondary-${index}`}
                variant={action.variant || 'secondary'}
                onClick={() => handleSecondaryAction(action)}
                style={{
                  animationDelay: `${index * 50}ms`
                }}
              >
                <i className={action.icon}></i>
              </Button>
            </OverlayTrigger>
          ))}
        </div>
      )}

      {/* Primary FAB */}
      <OverlayTrigger
        placement="left"
        overlay={
          <Tooltip id="fab-primary-tooltip">
            {isExpanded ? t('common:actions.close') : primaryAction.label}
          </Tooltip>
        }
      >
        <Button
          className={`fab-primary ${isExpanded ? 'fab-expanded' : ''}`}
          variant={primaryAction.variant || 'primary'}
          onClick={handlePrimaryAction}
        >
          <i className={isExpanded ? 'bi-x-lg' : primaryAction.icon}></i>
        </Button>
      </OverlayTrigger>
    </div>
  );
};

export default FloatingActionButton;
