/**
 * HelpPage Component - Tourist Tax Application
 *
 * RESPONSIBILITY: Provide guidance for users without direct payment links
 * ARCHITECTURE: Mobile-first responsive design with proper i18n integration
 */

import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useLanguage } from '../context/LanguageContext';
import { eventBus, PLATFORM_EVENTS } from '../../platform/EventBus';
import { logger } from '../../platform/CentralizedLogger';

const HelpPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Container className="text-center py-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          {/* Main heading */}
          <h1 className="display-5 fw-bold text-primary mb-4">
            {t('app.title', 'Tourist Tax Online Payment')}
          </h1>

          {/* Main instruction */}
          <p className="lead mb-4">
            {t('help.mainInstruction',
              'To pay your tourist tax, please use the payment link provided by your accommodation.'
            )}
          </p>

          {/* Secondary instruction */}
          <p className="text-muted mb-5">
            {t('help.noLinkInstruction',
              'If you don\'t have a payment link, please contact your accommodation provider.'
            )}
          </p>

          {/* Help section */}
          <div className="mt-5 pt-4 border-top">
            <h3 className="h5 mb-3">
              {t('help.needAssistance', 'Need Assistance?')}
            </h3>
            <p className="text-muted small mb-4">
              {t('help.contactSupport',
                'For technical support or questions about your tourist tax payment, please contact our support team.'
              )}
            </p>

            {/* Contact button */}
            <Button
              variant="outline-primary"
              size="lg"
              href="mailto:support@example.com"
              className="d-flex align-items-center justify-content-center mx-auto"
              style={{ maxWidth: '300px' }}
            >
              <i className="bi bi-envelope me-2"></i>
              {t('help.contactButton', 'Contact Support')}
            </Button>
          </div>

          {/* Additional info */}
          <div className="mt-5">
            <small className="text-muted">
              {t('help.securePayment', 'All payments are processed securely through our certified payment system.')}
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default HelpPage;
