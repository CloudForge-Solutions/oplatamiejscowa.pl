// Payment Receipt Component
// Display payment confirmation and receipt details

import React from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface PaymentReceiptProps {
  paymentData: {
    transactionId: string;
    amount: number;
    currency: string;
    guestName: string;
    guestEmail: string;
    cityName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfPersons: number;
    numberOfNights: number;
    paymentDate: string;
    status: 'success' | 'failed' | 'pending';
  };
  onDownloadReceipt?: () => void;
  onEmailReceipt?: () => void;
  onNewPayment?: () => void;
}

const PaymentReceipt: React.FC<PaymentReceiptProps> = ({
  paymentData,
  onDownloadReceipt,
  onEmailReceipt,
  onNewPayment
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  const getStatusVariant = () => {
    switch (paymentData.status) {
      case 'success': return 'success';
      case 'failed': return 'danger';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusIcon = () => {
    switch (paymentData.status) {
      case 'success': return 'bi-check-circle';
      case 'failed': return 'bi-x-circle';
      case 'pending': return 'bi-clock';
      default: return 'bi-info-circle';
    }
  };

  return (
    <div className="text-center">
      <Card className="card-payment">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className={`bi ${getStatusIcon()} me-2`}></i>
            {t('receipt.title', 'Payment Receipt')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Alert variant={getStatusVariant()} className="mb-4">
            <h5 className="mb-2">
              {paymentData.status === 'success' && t('receipt.paymentSuccessful', 'Payment Successful!')}
              {paymentData.status === 'failed' && t('receipt.paymentFailed', 'Payment Failed')}
              {paymentData.status === 'pending' && t('receipt.paymentPending', 'Payment Pending')}
            </h5>
            <p className="mb-0">
              {paymentData.status === 'success' && t('receipt.successMessage', 'Your tourist tax payment has been processed successfully.')}
              {paymentData.status === 'failed' && t('receipt.failedMessage', 'There was an issue processing your payment. Please try again.')}
              {paymentData.status === 'pending' && t('receipt.pendingMessage', 'Your payment is being processed. You will receive confirmation shortly.')}
            </p>
          </Alert>

          {/* Payment Details */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('receipt.paymentDetails', 'Payment Details')}</h6>
            <div className="bg-light rounded p-3">
              <div className="row g-2">
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('receipt.transactionId', 'Transaction ID')}:</span>
                    <strong className="font-monospace">{paymentData.transactionId}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('receipt.amount', 'Amount')}:</span>
                    <strong className="text-success">{paymentData.amount.toFixed(2)} {paymentData.currency}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('receipt.paymentDate', 'Payment Date')}:</span>
                    <strong>{new Date(paymentData.paymentDate).toLocaleString()}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('receipt.status', 'Status')}:</span>
                    <strong className={`text-${getStatusVariant()}`}>
                      {t(`receipt.status${paymentData.status.charAt(0).toUpperCase() + paymentData.status.slice(1)}`, paymentData.status)}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stay Details */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('receipt.stayDetails', 'Stay Details')}</h6>
            <div className="bg-light rounded p-3">
              <div className="row g-2">
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.guestName', 'Guest Name')}:</span>
                    <strong>{paymentData.guestName}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.cityName', 'City')}:</span>
                    <strong>{paymentData.cityName}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.checkInDate', 'Check-in')}:</span>
                    <strong>{new Date(paymentData.checkInDate).toLocaleDateString()}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.checkOutDate', 'Check-out')}:</span>
                    <strong>{new Date(paymentData.checkOutDate).toLocaleDateString()}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.numberOfPersons', 'Persons')}:</span>
                    <strong>{paymentData.numberOfPersons}</strong>
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">{t('fields.numberOfNights', 'Nights')}:</span>
                    <strong>{paymentData.numberOfNights}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="d-flex gap-2 flex-wrap justify-content-center">
            {paymentData.status === 'success' && (
              <>
                {onDownloadReceipt && (
                  <Button variant="primary" onClick={onDownloadReceipt}>
                    <i className="bi bi-download me-2"></i>
                    {t('receipt.downloadReceipt', 'Download Receipt')}
                  </Button>
                )}
                {onEmailReceipt && (
                  <Button variant="outline-primary" onClick={onEmailReceipt}>
                    <i className="bi bi-envelope me-2"></i>
                    {t('receipt.emailReceipt', 'Email Receipt')}
                  </Button>
                )}
              </>
            )}
            
            {paymentData.status === 'failed' && onNewPayment && (
              <Button variant="primary" onClick={onNewPayment}>
                <i className="bi bi-arrow-repeat me-2"></i>
                {t('receipt.tryAgain', 'Try Again')}
              </Button>
            )}

            {onNewPayment && (
              <Button variant="outline-secondary" onClick={onNewPayment}>
                <i className="bi bi-plus-circle me-2"></i>
                {t('receipt.newPayment', 'New Payment')}
              </Button>
            )}
          </div>

          {/* Important Information */}
          {paymentData.status === 'success' && (
            <Alert variant="info" className="mt-4">
              <h6 className="mb-2">
                <i className="bi bi-info-circle me-2"></i>
                {t('receipt.importantInfo', 'Important Information')}
              </h6>
              <ul className="mb-0 small text-start">
                <li>{t('receipt.keepReceipt', 'Please keep this receipt for your records')}</li>
                <li>{t('receipt.emailConfirmation', 'A confirmation email has been sent to')} {paymentData.guestEmail}</li>
                <li>{t('receipt.validPayment', 'This payment is valid for the specified stay period')}</li>
                <li>{t('receipt.contactSupport', 'If you have any questions, please contact our support team')}</li>
              </ul>
            </Alert>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default PaymentReceipt;
