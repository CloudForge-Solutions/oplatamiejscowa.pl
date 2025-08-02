// Mobile Payment Summary Component - Mobile-First Design
// Shows tax calculation breakdown and GDPR consents

import React from 'react';
import { Card, Row, Col, Form, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TaxCalculationResult } from '../types/TaxCalculation';

interface MobilePaymentSummaryProps {
  formData: any;
  taxCalculation: TaxCalculationResult;
  numberOfNights: number;
  onConsentChange: (field: string, value: boolean) => void;
  errors: any;
}

const MobilePaymentSummary: React.FC<MobilePaymentSummaryProps> = ({
  formData,
  taxCalculation,
  numberOfNights,
  onConsentChange,
  errors
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  return (
    <div>
      {/* Payment Summary Card */}
      <Card className="card-payment mb-4">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="bi bi-calculator me-2"></i>
            {t('sections.paymentSummary')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {/* Stay Information */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('summary.stayPeriod')}</h6>
            <Row className="g-3">
              <Col sm={6}>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t('fields.checkInDate')}:</span>
                  <strong>{new Date(formData.checkInDate).toLocaleDateString()}</strong>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t('fields.checkOutDate')}:</span>
                  <strong>{new Date(formData.checkOutDate).toLocaleDateString()}</strong>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t('summary.numberOfNights')}:</span>
                  <strong>{numberOfNights}</strong>
                </div>
              </Col>
              <Col sm={6}>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">{t('summary.numberOfPersons')}:</span>
                  <strong>{formData.numberOfPersons}</strong>
                </div>
              </Col>
            </Row>
          </div>

          {/* Tax Calculation Breakdown */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('summary.breakdown')}</h6>
            <div className="bg-light rounded p-3">
              <div className="d-flex justify-content-between mb-2">
                <span>{t('summary.taxRatePerNight')}:</span>
                <span>{taxCalculation.ratePerNight.toFixed(2)} zł</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t('summary.numberOfNights')}:</span>
                <span>{numberOfNights}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>{t('summary.numberOfPersons')}:</span>
                <span>{formData.numberOfPersons}</span>
              </div>
              <hr className="my-2" />
              <div className="d-flex justify-content-between fw-bold text-primary">
                <span>{t('summary.totalAmount')}:</span>
                <span className="fs-5">{taxCalculation.totalAmount.toFixed(2)} zł</span>
              </div>
            </div>
          </div>

          {/* Guest Information */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('sections.personalInfo')}</h6>
            <div className="bg-light rounded p-3">
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">{t('fields.firstName')}:</span>
                <span>{formData.firstName}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">{t('fields.lastName')}:</span>
                <span>{formData.lastName}</span>
              </div>
              <div className="d-flex justify-content-between mb-1">
                <span className="text-muted">{t('fields.email')}:</span>
                <span>{formData.email}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">{t('fields.accommodationName')}:</span>
                <span>{formData.accommodationName}</span>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <h6 className="text-muted mb-3">{t('summary.paymentMethod')}</h6>
            <div className="bg-light rounded p-3">
              <div className="d-flex align-items-center">
                <i className="bi bi-shield-check text-success me-2"></i>
                <span>{t('payment.securePayment')}</span>
              </div>
              <small className="text-muted mt-2 d-block">
                {t('payment.acceptedMethods')}
              </small>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* GDPR Consents */}
      <Card className="mb-4">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="bi bi-shield-check me-2"></i>
            {t('gdpr.title')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {/* Required Data Processing Consent */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="dataProcessingConsent"
              checked={formData.dataProcessingConsent}
              onChange={(e) => onConsentChange('dataProcessingConsent', e.target.checked)}
              isInvalid={!!errors.dataProcessingConsent}
              label={
                <div>
                  <span>{t('gdpr.dataProcessing')}</span>
                  <span className="text-danger ms-1">*</span>
                  <br />
                  <small className="text-muted">{t('gdpr.required')}</small>
                </div>
              }
            />
            {errors.dataProcessingConsent && (
              <div className="invalid-feedback d-block">
                {errors.dataProcessingConsent}
              </div>
            )}
          </Form.Group>

          {/* Optional Marketing Consent */}
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="marketingConsent"
              checked={formData.marketingConsent}
              onChange={(e) => onConsentChange('marketingConsent', e.target.checked)}
              label={
                <div>
                  <span>{t('gdpr.emailMarketing')}</span>
                  <br />
                  <small className="text-muted">{t('gdpr.optional')}</small>
                </div>
              }
            />
          </Form.Group>

          {/* GDPR Links */}
          <div className="mt-3 pt-3 border-top">
            <small className="text-muted">
              <a href="#privacy" className="text-decoration-none me-3">
                {t('gdpr.privacyPolicy')}
              </a>
              <a href="#terms" className="text-decoration-none">
                {t('gdpr.termsOfService')}
              </a>
            </small>
          </div>
        </Card.Body>
      </Card>

      {/* Information Box */}
      <Alert variant="info" className="mb-4">
        <Alert.Heading className="h6">
          <i className="bi bi-info-circle me-2"></i>
          {t('info.whyPayOnline')}
        </Alert.Heading>
        <p className="mb-2 small">
          {t('info.onlinePaymentBenefits')}
        </p>
        <hr />
        <div className="d-flex align-items-center">
          <i className="bi bi-shield-check text-success me-2"></i>
          <small className="mb-0">
            <strong>{t('info.securePayment')}</strong> - {t('info.securePaymentDescription')}
          </small>
        </div>
      </Alert>
    </div>
  );
};

export default MobilePaymentSummary;
