// NotFoundPage component for Tourist Tax Payment System
// Proper 404 handling with Polish content

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          <div className="mb-4">
            <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '4rem' }}></i>
          </div>
          
          <h1 className="display-1 text-muted">404</h1>
          <h2 className="mb-3">Strona nie została znaleziona</h2>
          
          <p className="lead text-muted mb-4">
            Strona, której szukasz, nie istnieje lub została przeniesiona.
            Sprawdź adres URL lub wróć do strony głównej.
          </p>
          
          <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
            <Button 
              variant="primary" 
              onClick={handleGoHome}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-house me-2"></i>
              Strona główna
            </Button>
            
            <Button 
              variant="outline-secondary" 
              onClick={() => window.history.back()}
              className="d-flex align-items-center justify-content-center"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Wstecz
            </Button>
          </div>
          
          <hr className="my-4" />
          
          <div className="text-muted">
            <small>
              Jeśli uważasz, że to błąd, skontaktuj się z pomocą techniczną.
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;
