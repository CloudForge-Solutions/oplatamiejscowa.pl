// Tourist Payment Form - Mobile-First Design
// Optimized for tourist users with simple, intuitive interface

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useTouristTaxCalculation } from '../hooks/useTouristTaxCalculation';
import { usePaymentProcessing } from '../hooks/usePaymentProcessing';
import CitySelector from './CitySelector';
import MobilePaymentSummary from './MobilePaymentSummary';
import PaymentReceipt from './PaymentReceipt';

interface TouristFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;

  // Stay Details
  cityId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfPersons: number;
  accommodationType: string;
  accommodationName: string;
  accommodationAddress: string;

  // GDPR Consents
  dataProcessingConsent: boolean;
  marketingConsent: boolean;
}

type FormStep = 'destination' | 'details' | 'summary' | 'payment' | 'receipt';

const TouristPaymentForm: React.FC = () => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // Form state
  const [currentStep, setCurrentStep] = useState<FormStep>('destination');
  const [formData, setFormData] = useState<TouristFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfPersons: 1,
    accommodationType: 'hotel',
    accommodationName: '',
    accommodationAddress: '',
    dataProcessingConsent: false,
    marketingConsent: false
  });

  const [errors, setErrors] = useState<Partial<TouristFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks
  const {
    calculateTax,
    taxCalculation,
    isCalculating,
    calculationError
  } = useTouristTaxCalculation();

  const {
    processPayment,
    paymentResult,
    isProcessing,
    paymentError
  } = usePaymentProcessing();

  // Step progress calculation
  const steps: FormStep[] = ['destination', 'details', 'summary', 'payment', 'receipt'];
  const currentStepIndex = steps.indexOf(currentStep);
  const progressPercentage = ((currentStepIndex + 1) / steps.length) * 100;

  // Form validation
  const validateStep = (step: FormStep): boolean => {
    const newErrors: Partial<TouristFormData> = {};

    switch (step) {
      case 'destination':
        if (!formData.cityId) {
          newErrors.cityId = t('validation.required', { field: t('fields.city') });
        }
        break;

      case 'details':
        if (!formData.firstName.trim()) {
          newErrors.firstName = t('validation.required', { field: t('fields.firstName') });
        }
        if (!formData.lastName.trim()) {
          newErrors.lastName = t('validation.required', { field: t('fields.lastName') });
        }
        if (!formData.email.trim()) {
          newErrors.email = t('validation.required', { field: t('fields.email') });
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          newErrors.email = t('validation.invalidEmail');
        }
        if (!formData.checkInDate) {
          newErrors.checkInDate = t('validation.required', { field: t('fields.checkInDate') });
        }
        if (!formData.checkOutDate) {
          newErrors.checkOutDate = t('validation.required', { field: t('fields.checkOutDate') });
        }
        if (formData.checkInDate && formData.checkOutDate &&
            new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
          newErrors.checkOutDate = t('validation.checkOutAfterCheckIn');
        }
        if (formData.numberOfPersons < 1) {
          newErrors.numberOfPersons = t('validation.minPersons');
        }
        if (!formData.accommodationName.trim()) {
          newErrors.accommodationName = t('validation.required', { field: t('fields.accommodationName') });
        }
        break;

      case 'summary':
        if (!formData.dataProcessingConsent) {
          newErrors.dataProcessingConsent = t('validation.gdprRequired');
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handleInputChange = (field: keyof TouristFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle step navigation
  const handleNextStep = async () => {
    if (!validateStep(currentStep)) {
      return;
    }

    if (currentStep === 'details') {
      // Calculate tax before moving to summary
      setIsSubmitting(true);
      try {
        await calculateTax({
          cityId: formData.cityId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfPersons: formData.numberOfPersons,
          accommodationType: formData.accommodationType
        });
        setCurrentStep('summary');
      } catch (error) {
        console.error('Tax calculation failed:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else if (currentStep === 'summary') {
      setCurrentStep('payment');
    } else {
      const nextStepIndex = currentStepIndex + 1;
      if (nextStepIndex < steps.length) {
        setCurrentStep(steps[nextStepIndex]);
      }
    }
  };

  const handlePreviousStep = () => {
    const prevStepIndex = currentStepIndex - 1;
    if (prevStepIndex >= 0) {
      setCurrentStep(steps[prevStepIndex]);
    }
  };

  // Handle payment submission
  const handlePayment = async () => {
    if (!taxCalculation) return;

    setIsSubmitting(true);
    try {
      const paymentData = {
        personalInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        },
        stayDetails: {
          cityId: formData.cityId,
          checkInDate: formData.checkInDate,
          checkOutDate: formData.checkOutDate,
          numberOfPersons: formData.numberOfPersons,
          accommodationType: formData.accommodationType,
          accommodationName: formData.accommodationName,
          accommodationAddress: formData.accommodationAddress
        },
        taxCalculation,
        consents: {
          dataProcessing: formData.dataProcessingConsent,
          marketing: formData.marketingConsent
        }
      };

      await processPayment(paymentData);
      setCurrentStep('receipt');
    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate nights
  const numberOfNights = formData.checkInDate && formData.checkOutDate
    ? Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Container className="py-4">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h1 className="h4 mb-0 text-primary">
            <i className="bi bi-geo-alt-fill me-2"></i>
            {t('title')}
          </h1>
          <small className="text-muted">
            {t('steps.' + currentStep)}
          </small>
        </div>
        <ProgressBar
          now={progressPercentage}
          variant="primary"
          style={{ height: '6px' }}
          className="rounded-pill"
        />
      </div>

      {/* Error Alerts */}
      {(calculationError || paymentError) && (
        <Alert variant="danger" className="mb-4">
          <i className="bi bi-exclamation-triangle me-2"></i>
          {calculationError || paymentError}
        </Alert>
      )}

      {/* Form Steps */}
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {currentStep === 'destination' && (
            <Card className="card-tourist">
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="bi bi-geo-alt me-2"></i>
                  {t('sections.destination')}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <CitySelector
                  value={formData.cityId}
                  onChange={(cityId) => handleInputChange('cityId', cityId)}
                  error={errors.cityId}
                />
              </Card.Body>
            </Card>
          )}

          {currentStep === 'details' && (
            <Card className="card-tourist">
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="bi bi-person me-2"></i>
                  {t('sections.personalInfo')}
                </Card.Title>
              </Card.Header>
              <Card.Body>
                <Form className="tourist-form">
                  {/* Personal Information Section */}
                  <div className="form-section">
                    <h6 className="section-title">
                      <i className="bi bi-person-circle"></i>
                      {t('sections.personalInfo')}
                    </h6>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.firstName')}</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                            placeholder={t('placeholders.firstName')}
                            isInvalid={!!errors.firstName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.firstName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.lastName')}</Form.Label>
                          <Form.Control
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                            placeholder={t('placeholders.lastName')}
                            isInvalid={!!errors.lastName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.lastName}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.email')}</Form.Label>
                          <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder={t('placeholders.email')}
                            isInvalid={!!errors.email}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.email}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.phone')}</Form.Label>
                          <Form.Control
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            placeholder={t('placeholders.phone')}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>

                  {/* Stay Details Section */}
                  <div className="form-section">
                    <h6 className="section-title">
                      <i className="bi bi-calendar-check"></i>
                      {t('sections.stayDetails')}
                    </h6>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.checkInDate')}</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.checkInDate}
                            onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            isInvalid={!!errors.checkInDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.checkInDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.checkOutDate')}</Form.Label>
                          <Form.Control
                            type="date"
                            value={formData.checkOutDate}
                            onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                            min={formData.checkInDate || new Date().toISOString().split('T')[0]}
                            isInvalid={!!errors.checkOutDate}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.checkOutDate}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.numberOfPersons')}</Form.Label>
                          <Form.Control
                            type="number"
                            min="1"
                            max="20"
                            value={formData.numberOfPersons}
                            onChange={(e) => handleInputChange('numberOfPersons', parseInt(e.target.value) || 1)}
                            isInvalid={!!errors.numberOfPersons}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.numberOfPersons}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>{t('fields.accommodationType')}</Form.Label>
                          <Form.Select
                            value={formData.accommodationType}
                            onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                          >
                            <option value="hotel">{t('accommodationTypes.hotel')}</option>
                            <option value="apartment">{t('accommodationTypes.apartment')}</option>
                            <option value="hostel">{t('accommodationTypes.hostel')}</option>
                            <option value="camping">{t('accommodationTypes.camping')}</option>
                            <option value="other">{t('accommodationTypes.other')}</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('fields.accommodationName')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.accommodationName}
                        onChange={(e) => handleInputChange('accommodationName', e.target.value)}
                        placeholder={t('placeholders.accommodationName')}
                        isInvalid={!!errors.accommodationName}
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.accommodationName}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>{t('fields.accommodationAddress')}</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.accommodationAddress}
                        onChange={(e) => handleInputChange('accommodationAddress', e.target.value)}
                        placeholder={t('placeholders.accommodationAddress')}
                      />
                    </Form.Group>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          )}

          {currentStep === 'summary' && taxCalculation && (
            <MobilePaymentSummary
              formData={formData}
              taxCalculation={taxCalculation}
              numberOfNights={numberOfNights}
              onConsentChange={handleInputChange}
              errors={errors}
            />
          )}

          {currentStep === 'payment' && (
            <Card className="card-payment">
              <Card.Header>
                <Card.Title className="mb-0">
                  <i className="bi bi-credit-card me-2"></i>
                  {t('sections.payment')}
                </Card.Title>
              </Card.Header>
              <Card.Body className="text-center">
                {isProcessing ? (
                  <div>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p>{t('payment.processing')}</p>
                  </div>
                ) : (
                  <div>
                    <div className="payment-summary-card mb-4">
                      <div className="amount-display">
                        {taxCalculation?.totalAmount.toFixed(2)} zł
                      </div>
                      <div className="amount-details">
                        {t('summary.totalAmount')}
                      </div>
                    </div>
                    <p className="text-muted mb-4">
                      {t('payment.redirectingToPayment')}
                    </p>
                    <Button
                      variant="success"
                      size="lg"
                      onClick={handlePayment}
                      disabled={isSubmitting}
                      className="w-100"
                    >
                      {isSubmitting ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" />
                          {t('buttons.processing')}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check me-2"></i>
                          {t('buttons.payNow')}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {currentStep === 'receipt' && paymentResult && (
            <PaymentReceipt
              paymentResult={paymentResult}
              formData={formData}
              taxCalculation={taxCalculation}
            />
          )}

          {/* Navigation Buttons */}
          {currentStep !== 'receipt' && (
            <div className="d-flex justify-content-between mt-4">
              <Button
                variant="outline-secondary"
                onClick={handlePreviousStep}
                disabled={currentStepIndex === 0 || isSubmitting}
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t('common:actions.back')}
              </Button>

              {currentStep !== 'payment' && (
                <Button
                  variant="primary"
                  onClick={handleNextStep}
                  disabled={isSubmitting || isCalculating}
                >
                  {isSubmitting || isCalculating ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      {isCalculating ? t('buttons.calculating') : t('common:status.processing')}
                    </>
                  ) : (
                    <>
                      {t('common:actions.next')}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TouristPaymentForm;
