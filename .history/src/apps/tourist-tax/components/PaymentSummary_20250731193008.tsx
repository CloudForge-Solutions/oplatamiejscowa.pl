import React from 'react';
import { Card, Row, Col, Button, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TouristTaxData } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';

interface PaymentSummaryProps {
  touristData: TouristTaxData;
  taxAmount: number;
  onConfirm: () => void;
  onBack: () => void;
  isProcessing: boolean;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  touristData,
  taxAmount,
  onConfirm,
  onBack,
  isProcessing
}) => {
  const { t } = useTranslation('tourist-tax');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h4 className='mb-4'>{t('sections.paymentSummary')}</h4>

      {/* Tourist Information */}
      <Card className='mb-3'>
        <Card.Header>
          <h6 className='mb-0'>Dane turysty</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>Imię i nazwisko:</strong> {touristData.firstName} {touristData.lastName}
              </p>
              <p>
                <strong>E-mail:</strong> {touristData.email}
              </p>
              {touristData.phone && (
                <p>
                  <strong>Telefon:</strong> {touristData.phone}
                </p>
              )}
            </Col>
            <Col md={6}>
              <p>
                <strong>Miasto:</strong> {touristData.cityName}
              </p>
              <p>
                <strong>Typ zakwaterowania:</strong>{' '}
                {t(`accommodationTypes.${touristData.accommodationType}`)}
              </p>
              {touristData.accommodationName && (
                <p>
                  <strong>Nazwa obiektu:</strong> {touristData.accommodationName}
                </p>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Stay Details */}
      <Card className='mb-3'>
        <Card.Header>
          <h6 className='mb-0'>Szczegóły pobytu</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>{t('summary.stayPeriod')}:</strong>
              </p>
              <p className='text-muted'>
                {formatDate(touristData.checkInDate)} - {formatDate(touristData.checkOutDate)}
              </p>
            </Col>
            <Col md={3}>
              <p>
                <strong>{t('summary.numberOfNights')}:</strong>
              </p>
              <Badge bg='primary' className='fs-6'>
                {touristData.numberOfNights}
              </Badge>
            </Col>
            <Col md={3}>
              <p>
                <strong>{t('summary.numberOfPersons')}:</strong>
              </p>
              <Badge bg='info' className='fs-6'>
                {touristData.numberOfPersons}
              </Badge>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tax Calculation */}
      <Card className='mb-4'>
        <Card.Header>
          <h6 className='mb-0'>{t('summary.breakdown')}</h6>
        </Card.Header>
        <Card.Body>
          <Table responsive>
            <tbody>
              <tr>
                <td>{t('summary.taxRatePerNight')}</td>
                <td className='text-end'>
                  {TaxCalculationService.formatCurrency(touristData.taxRatePerNight)}
                </td>
              </tr>
              <tr>
                <td>Liczba nocy × Liczba osób</td>
                <td className='text-end'>
                  {touristData.numberOfNights} × {touristData.numberOfPersons}
                </td>
              </tr>
              <tr className='table-active'>
                <td>
                  <strong>{t('summary.totalAmount')}</strong>
                </td>
                <td className='text-end'>
                  <strong className='fs-5 text-primary'>
                    {TaxCalculationService.formatCurrency(taxAmount)}
                  </strong>
                </td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Payment Method Info */}
      <Card className='mb-4'>
        <Card.Header>
          <h6 className='mb-0'>{t('summary.paymentMethod')}</h6>
        </Card.Header>
        <Card.Body>
          <div className='d-flex align-items-center mb-3'>
            <img
              src='/assets/images/tpay-logo.png'
              alt='Tpay'
              height='30'
              className='me-3'
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <p className='mb-1'>
                <strong>Tpay - Trusted Payments</strong>
              </p>
              <small className='text-muted'>{t('payment.securePayment')}</small>
            </div>
          </div>

          <p className='mb-2'>
            <strong>{t('payment.acceptedMethods')}:</strong>
          </p>
          <div className='d-flex flex-wrap gap-2'>
            <Badge bg='outline-secondary'>BLIK</Badge>
            <Badge bg='outline-secondary'>Przelewy bankowe</Badge>
            <Badge bg='outline-secondary'>Karty płatnicze</Badge>
            <Badge bg='outline-secondary'>Apple Pay</Badge>
            <Badge bg='outline-secondary'>Google Pay</Badge>
          </div>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <Row>
        <Col md={6}>
          <Button
            variant='outline-secondary'
            size='lg'
            className='w-100'
            onClick={onBack}
            disabled={isProcessing}
          >
            {t('buttons.backToForm')}
          </Button>
        </Col>
        <Col md={6}>
          <Button
            variant='primary'
            size='lg'
            className='w-100'
            onClick={onConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <span className='spinner-border spinner-border-sm me-2' role='status' />
                {t('buttons.processing')}
              </>
            ) : (
              <>
                {t('buttons.payNow')} - {TaxCalculationService.formatCurrency(taxAmount)}
              </>
            )}
          </Button>
        </Col>
      </Row>

      {/* Important Notice */}
      <div className='alert alert-info mt-4'>
        <h6>Ważne informacje:</h6>
        <ul className='mb-0'>
          <li>Płatność jest bezpieczna i szyfrowana</li>
          <li>Po zakończeniu płatności otrzymasz potwierdzenie na e-mail</li>
          <li>Opłata miejscowa zostanie przekazana bezpośrednio do gminy</li>
          <li>W przypadku problemów skontaktuj się z naszym wsparciem</li>
        </ul>
      </div>
    </div>
  );
};

export default PaymentSummary;
