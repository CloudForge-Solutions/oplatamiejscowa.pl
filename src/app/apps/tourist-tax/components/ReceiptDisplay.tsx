import React from 'react';
import { Card, Row, Col, Button, Badge, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TouristTaxData, PaymentStatus } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';

interface ReceiptDisplayProps {
  touristData: TouristTaxData;
  taxAmount: number;
  transactionId: string;
  paymentStatus: PaymentStatus;
  onNewPayment: () => void;
}

const ReceiptDisplay: React.FC<ReceiptDisplayProps> = ({
  touristData,
  taxAmount,
  transactionId,
  paymentStatus,
  onNewPayment
}) => {
  const { t } = useTranslation('tourist-tax');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusVariant = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
      case 'cancelled':
        return 'danger';
      case 'processing':
      case 'pending':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return t('receipt.paymentSuccessful');
      case 'failed':
        return t('receipt.paymentFailed');
      case 'cancelled':
        return 'Płatność anulowana';
      case 'processing':
        return 'Płatność w trakcie realizacji';
      case 'pending':
        return 'Oczekiwanie na płatność';
      default:
        return 'Nieznany status';
    }
  };

  const downloadReceipt = () => {
    // Create receipt content
    const receiptContent = `
POTWIERDZENIE PŁATNOŚCI OPŁATY MIEJSCOWEJ

Numer transakcji: ${transactionId}
Data płatności: ${new Date().toLocaleDateString('pl-PL')}
Status: ${getStatusText(paymentStatus)}

DANE TURYSTY:
Imię i nazwisko: ${touristData.firstName} ${touristData.lastName}
E-mail: ${touristData.email}
${touristData.phone ? `Telefon: ${touristData.phone}` : ''}

SZCZEGÓŁY POBYTU:
Miasto: ${touristData.cityName}
Okres pobytu: ${formatDate(touristData.checkInDate)} - ${formatDate(touristData.checkOutDate)}
Liczba nocy: ${touristData.numberOfNights}
Liczba osób: ${touristData.numberOfPersons}
Typ zakwaterowania: ${t(`accommodationTypes.${touristData.accommodationType}`)}
${touristData.accommodationName ? `Nazwa obiektu: ${touristData.accommodationName}` : ''}

KALKULACJA OPŁATY:
Stawka za noc: ${TaxCalculationService.formatCurrency(touristData.taxRatePerNight)}
Liczba nocy: ${touristData.numberOfNights}
Liczba osób: ${touristData.numberOfPersons}
ŁĄCZNA KWOTA: ${TaxCalculationService.formatCurrency(taxAmount)}

Płatność zrealizowana przez: imoje (ING Bank Śląski)
Operator systemu: Opłata Miejscowa Online

---
To potwierdzenie zachowaj na potrzeby ewentualnej kontroli.
    `;

    // Create and download file
    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `potwierdzenie-oplata-miejscowa-${transactionId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Status Alert */}
      <Alert variant={getStatusVariant(paymentStatus)} className='text-center mb-4'>
        <Alert.Heading>
          <i
            className={`bi ${paymentStatus === 'completed' ? 'bi-check-circle' : paymentStatus === 'failed' ? 'bi-x-circle' : 'bi-clock'} me-2`}
          ></i>
          {getStatusText(paymentStatus)}
        </Alert.Heading>
        {paymentStatus === 'completed' && <p className='mb-0'>{t('receipt.confirmationSent')}</p>}
      </Alert>

      {/* Transaction Details */}
      <Card className='mb-4'>
        <Card.Header>
          <h6 className='mb-0'>Szczegóły transakcji</h6>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <p>
                <strong>{t('receipt.transactionId')}:</strong>
              </p>
              <p className='font-monospace text-muted'>{transactionId}</p>
            </Col>
            <Col md={6}>
              <p>
                <strong>{t('receipt.paymentDate')}:</strong>
              </p>
              <p className='text-muted'>{new Date().toLocaleString('pl-PL')}</p>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <p>
                <strong>Status płatności:</strong>
              </p>
              <Badge bg={getStatusVariant(paymentStatus)} className='fs-6'>
                {getStatusText(paymentStatus)}
              </Badge>
            </Col>
            <Col md={6}>
              <p>
                <strong>Kwota:</strong>
              </p>
              <p className='fs-5 text-primary fw-bold'>
                {TaxCalculationService.formatCurrency(taxAmount)}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tourist Information */}
      <Card className='mb-4'>
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
                <strong>Okres pobytu:</strong> {formatDate(touristData.checkInDate)} -{' '}
                {formatDate(touristData.checkOutDate)}
              </p>
              <p>
                <strong>Liczba nocy:</strong> {touristData.numberOfNights}
              </p>
              <p>
                <strong>Liczba osób:</strong> {touristData.numberOfPersons}
              </p>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Payment Summary */}
      <Card className='mb-4'>
        <Card.Header>
          <h6 className='mb-0'>Podsumowanie płatności</h6>
        </Card.Header>
        <Card.Body>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <span>Stawka za noc:</span>
            <span>{TaxCalculationService.formatCurrency(touristData.taxRatePerNight)}</span>
          </div>
          <div className='d-flex justify-content-between align-items-center mb-2'>
            <span>Liczba nocy × Liczba osób:</span>
            <span>
              {touristData.numberOfNights} × {touristData.numberOfPersons}
            </span>
          </div>
          <hr />
          <div className='d-flex justify-content-between align-items-center'>
            <strong>Łączna kwota:</strong>
            <strong className='fs-5 text-primary'>
              {TaxCalculationService.formatCurrency(taxAmount)}
            </strong>
          </div>
          <small className='text-muted d-block mt-2'>
            Płatność zrealizowana przez imoje (ING Bank Śląski)
          </small>
        </Card.Body>
      </Card>

      {/* Action Buttons */}
      <Row>
        <Col md={6}>
          <Button
            variant='outline-primary'
            size='lg'
            className='w-100 mb-3'
            onClick={downloadReceipt}
          >
            <i className='bi bi-download me-2'></i>
            {t('buttons.downloadReceipt')}
          </Button>
        </Col>
        <Col md={6}>
          <Button variant='primary' size='lg' className='w-100 mb-3' onClick={onNewPayment}>
            <i className='bi bi-plus-circle me-2'></i>
            {t('buttons.newPayment')}
          </Button>
        </Col>
      </Row>

      {/* Important Notice */}
      <Alert variant='info' className='mt-4'>
        <h6>Ważne informacje:</h6>
        <ul className='mb-0'>
          <li>{t('receipt.keepReceipt')}</li>
          <li>Opłata została przekazana bezpośrednio do gminy {touristData.cityName}</li>
          <li>W przypadku pytań skontaktuj się z naszym wsparciem</li>
          <li>Numer referencyjny: {transactionId}</li>
        </ul>
      </Alert>
    </div>
  );
};

export default ReceiptDisplay;
