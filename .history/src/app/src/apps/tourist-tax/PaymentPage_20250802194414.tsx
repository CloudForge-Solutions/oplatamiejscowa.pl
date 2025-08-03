/**
 * Payment Page Component
 *
 * RESPONSIBILITY: Main payment page orchestration (mobile-first)
 * ARCHITECTURE: Single responsibility - coordinate payment flow and display reservation
 */

import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Row, Col, Alert, Spinner } from 'react-bootstrap';

// Context hooks
import { useTouristTax } from '../../shell/context/TouristTaxContext';
import { useLanguage } from '../../shell/context/LanguageContext';

// Components (TODO: Create these)
// import ReservationDisplay from './components/ReservationDisplay';
// import PaymentForm from './components/PaymentForm';
// import PaymentStatus from './components/PaymentStatus';

// Constants
import { MOBILE_CONSTANTS } from '@/constants';

const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { formatCurrency } = useLanguage();

  const {
    reservation,
    paymentStatus,
    isLoadingReservation,
    isLoadingPayment,
    isPolling,
    reservationError,
    paymentError,
    loadReservation,
    initiatePayment,
    clearErrors
  } = useTouristTax();

  // Load reservation on mount
  useEffect(() => {
    if (reservationId && !reservation) {
      loadReservation(reservationId);
    }
  }, [reservationId, reservation, loadReservation]);

  // Clear errors when component mounts
  useEffect(() => {
    clearErrors();
  }, [clearErrors]);

  // Loading state
  if (isLoadingReservation) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Loading reservation details...</p>
      </Container>
    );
  }

  // Error state
  if (reservationError) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error Loading Reservation
          </Alert.Heading>
          <p>{reservationError}</p>
          <button
            className="btn btn-outline-danger"
            onClick={() => reservationId && loadReservation(reservationId)}
            style={{ minHeight: `${MOBILE_CONSTANTS.MIN_TOUCH_TARGET}px` }}
          >
            <i className="bi bi-arrow-clockwise me-2"></i>
            Try Again
          </button>
        </Alert>
      </Container>
    );
  }

  // No reservation found
  if (!reservation) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="warning">
          <Alert.Heading>Reservation Not Found</Alert.Heading>
          <p>
            The reservation with ID <code>{reservationId}</code> could not be found.
            Please check your payment link or contact your accommodation provider.
          </p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Page Header */}
          <div className="text-center mb-4">
            <h1 className="h3 mb-2">Tourist Tax Payment</h1>
            <p className="text-muted">
              Complete your tourist tax payment for {reservation.accommodationName}
            </p>
          </div>

          {/* Payment Error Alert */}
          {paymentError && (
            <Alert variant="danger" dismissible onClose={clearErrors}>
              <Alert.Heading>Payment Error</Alert.Heading>
              <p>{paymentError}</p>
            </Alert>
          )}

          {/* Reservation Details Card */}
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Reservation Details
              </h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Guest Name</label>
                    <div className="fw-bold">{reservation.guestName}</div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Accommodation</label>
                    <div className="fw-bold">{reservation.accommodationName}</div>
                    <small className="text-muted">{reservation.accommodationAddress}</small>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label text-muted small">Stay Period</label>
                    <div className="fw-bold">
                      {new Date(reservation.checkInDate).toLocaleDateString()} - {' '}
                      {new Date(reservation.checkOutDate).toLocaleDateString()}
                    </div>
                    <small className="text-muted">
                      {reservation.numberOfNights} nights
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small">Guests</label>
                    <div className="fw-bold">{reservation.numberOfGuests} guests</div>
                  </div>
                </div>
              </div>

              {/* Tax Calculation */}
              <div className="bg-light p-3 rounded mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Total Tourist Tax</span>
                  <span className="h4 mb-0 text-primary fw-bold">
                    {formatCurrency(reservation.totalTaxAmount)}
                  </span>
                </div>
                <small className="text-muted">
                  {reservation.numberOfGuests} guests × {reservation.numberOfNights} nights × {formatCurrency(reservation.taxAmountPerNight)} per night
                </small>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-credit-card me-2"></i>
                Payment
              </h5>
            </div>
            <div className="card-body">
              {!paymentStatus ? (
                <div className="text-center">
                  <p className="mb-3">
                    Click the button below to proceed with your payment.
                  </p>
                  <button
                    className="btn btn-primary btn-lg"
                    onClick={initiatePayment}
                    disabled={isLoadingPayment}
                    style={{ minHeight: `${MOBILE_CONSTANTS.MIN_TOUCH_TARGET}px` }}
                  >
                    {isLoadingPayment ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-lock me-2"></i>
                        Pay {formatCurrency(reservation.totalTaxAmount)}
                      </>
                    )}
                  </button>
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="bi bi-shield-check me-1"></i>
                      Secure payment powered by imoje
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="mb-3">
                    {paymentStatus.status === 'processing' && (
                      <div className="text-info">
                        <Spinner animation="border" size="sm" className="me-2" />
                        {paymentStatus.message}
                      </div>
                    )}
                    {paymentStatus.status === 'completed' && (
                      <div className="text-success">
                        <i className="bi bi-check-circle me-2"></i>
                        {paymentStatus.message}
                      </div>
                    )}
                    {paymentStatus.status === 'failed' && (
                      <div className="text-danger">
                        <i className="bi bi-x-circle me-2"></i>
                        {paymentStatus.message}
                      </div>
                    )}
                  </div>

                  {isPolling && (
                    <small className="text-muted">
                      <i className="bi bi-arrow-clockwise me-1"></i>
                      Checking status...
                    </small>
                  )}

                  {paymentStatus.receiptUrl && (
                    <div className="mt-3">
                      <a
                        href={paymentStatus.receiptUrl}
                        className="btn btn-outline-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ minHeight: `${MOBILE_CONSTANTS.MIN_TOUCH_TARGET}px` }}
                      >
                        <i className="bi bi-download me-2"></i>
                        Download Receipt
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Help Section */}
          <div className="text-center text-muted">
            <small>
              Need help? Contact your accommodation provider or{' '}
              <a href="mailto:support@oplatamiejscowa.pl">support@oplatamiejscowa.pl</a>
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PaymentPage;
