import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import StaysManager from '../components/StaysManager';

/**
 * Landlord Reservations Page
 * 
 * Manages all reservations and stays for the landlord.
 * Uses the StaysManager component for full functionality.
 */
const LandlordReservations: React.FC = () => {
  const { t } = useTranslation(['common', 'landlord']);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{t('landlord:reservations.title', 'Pobyty')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:reservations.subtitle', 'Zarządzaj pobytami i rezerwacjami')}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <StaysManager />
        </Col>
      </Row>
    </Container>
  );
};

export default LandlordReservations;
