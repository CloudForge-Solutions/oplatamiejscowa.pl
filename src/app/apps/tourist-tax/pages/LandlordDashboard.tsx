import React from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Landlord Dashboard Overview Page
 * 
 * Main dashboard showing key metrics and recent activity.
 * This is the landing page for landlord mode.
 */
const LandlordDashboard: React.FC = () => {
  const { t } = useTranslation(['common', 'landlord']);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{t('landlord:dashboard.title', 'Dashboard')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:dashboard.subtitle', 'Przegląd aktywności i statystyk')}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Quick Stats */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-primary mb-2">
                <i className="bi bi-calendar-check" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">0</h4>
              <small className="text-muted">{t('landlord:stats.totalReservations', 'Rezerwacje')}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-warning mb-2">
                <i className="bi bi-clock-history" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">0</h4>
              <small className="text-muted">{t('landlord:stats.pendingPayments', 'Oczekujące płatności')}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-success mb-2">
                <i className="bi bi-check-circle" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">0</h4>
              <small className="text-muted">{t('landlord:stats.completedPayments', 'Opłacone')}</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <div className="text-info mb-2">
                <i className="bi bi-currency-exchange" style={{ fontSize: '2rem' }}></i>
              </div>
              <h4 className="mb-1">0,00 zł</h4>
              <small className="text-muted">{t('landlord:stats.totalRevenue', 'Łączny dochód')}</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Recent Activity */}
      <Row>
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">{t('landlord:dashboard.recentActivity', 'Ostatnia aktywność')}</h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="info" className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                {t('landlord:dashboard.noActivity', 'Brak ostatniej aktywności. Rozpocznij od importu rezerwacji lub dodania nowego pobytu.')}
              </Alert>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">{t('landlord:dashboard.quickActions', 'Szybkie akcje')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Alert variant="light" className="mb-0 text-center">
                  <i className="bi bi-plus-circle me-2"></i>
                  {t('landlord:dashboard.getStarted', 'Użyj menu nawigacji aby rozpocząć zarządzanie pobytami')}
                </Alert>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandlordDashboard;
