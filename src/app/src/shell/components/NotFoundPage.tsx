/**
 * NotFoundPage Component - Tourist Tax Application
 * 
 * RESPONSIBILITY: Handle 404 errors with proper navigation
 * ARCHITECTURE: Mobile-first responsive design with clear CTAs
 */

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          {/* 404 Icon */}
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '4rem' }}></i>
          </div>
          
          {/* Error Message */}
          <h1 className="display-4 fw-bold text-primary mb-3">404</h1>
          <h2 className="h4 mb-3">
            {t('error.pageNotFound', 'Page Not Found')}
          </h2>
          <p className="lead text-muted mb-4">
            {t('error.pageNotFoundDescription', 
              'The page you\'re looking for doesn\'t exist or has been moved. Please check the URL or return to the payment page.'
            )}
          </p>

          {/* Action Buttons */}
          <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
            <Button 
              variant="primary" 
              size="lg"
              onClick={handleGoHome}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-house me-2"></i>
              {t('navigation.goHome', 'Go to Payment Page')}
            </Button>
            
            <Button 
              variant="outline-secondary" 
              size="lg"
              onClick={handleGoBack}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-arrow-left me-2"></i>
              {t('navigation.goBack', 'Go Back')}
            </Button>
          </div>

          {/* Help Section */}
          <div className="mt-5 pt-4 border-top">
            <p className="text-muted small mb-3">
              {t('error.needHelp', 'Need help with your tourist tax payment?')}
            </p>
            <Button 
              variant="link" 
              href="/help"
              className="text-decoration-none"
            >
              <i className="bi bi-question-circle me-1"></i>
              {t('navigation.help', 'Help & Support')}
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
