import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import QRPaymentBillGenerator from '../components/QRPaymentBillGenerator';

/**
 * Landlord Generate Bill Page
 * 
 * Generates QR payment bills for tourist tax collection.
 * Uses the QRPaymentBillGenerator component.
 */
const LandlordGenerateBill: React.FC = () => {
  const { t } = useTranslation(['common', 'landlord']);

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{t('landlord:generateBill.title', 'Generuj rachunek QR')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:generateBill.subtitle', 'Twórz rachunki z kodami QR do płatności opłaty miejscowej')}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col>
          <QRPaymentBillGenerator />
        </Col>
      </Row>
    </Container>
  );
};

export default LandlordGenerateBill;
