import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import BookingReservationImport from '../components/BookingReservationImport';

/**
 * Landlord Import Page
 * 
 * Imports reservations from various booking platforms.
 * Uses the BookingReservationImport component.
 */
const LandlordImport: React.FC = () => {
  const { t } = useTranslation(['common', 'landlord']);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{t('landlord:import.title', 'Import rezerwacji')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:import.subtitle', 'Importuj rezerwacje z platform rezerwacyjnych')}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <BookingReservationImport />
        </Col>
      </Row>
    </Container>
  );
};

export default LandlordImport;
