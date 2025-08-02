import React, { useState } from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import PaymentForm from './components/PaymentForm';
import MobilePaymentSummary from './components/MobilePaymentSummary';
import ReceiptDisplay from './components/ReceiptDisplay';
import GDPRConsent from './components/GDPRConsent';
import { TouristTaxData, PaymentStatus } from './types/TouristTaxTypes';
import { useTaxCalculation } from './hooks/useTaxCalculation';
import { usePaymentProcessing } from './hooks/usePaymentProcessing';

const TouristTaxPage: React.FC = () => {
  const { t } = useTranslation('tourist-tax');
  const [currentStep, setCurrentStep] = useState<'form' | 'summary' | 'payment' | 'receipt'>(
    'form'
  );
  const [touristData, setTouristData] = useState<TouristTaxData | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('pending');
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { calculateTax, taxAmount, isCalculating } = useTaxCalculation();
  const { processPayment, isProcessing } = usePaymentProcessing();

  const handleFormSubmit = async (data: TouristTaxData) => {
    setTouristData(data);
    const calculatedTax = await calculateTax(data);

    if (calculatedTax > 0) {
      setCurrentStep('summary');
    }
  };

  const handlePaymentConfirm = async () => {
    if (!touristData) return;

    setCurrentStep('payment');

    try {
      const result = await processPayment({
        ...touristData,
        taxAmount: taxAmount
      });

      setTransactionId(result.transactionId);
      setPaymentStatus(result.status);

      if (result.status === 'completed') {
        setCurrentStep('receipt');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setPaymentStatus('failed');
    }
  };

  const handleBackToForm = () => {
    setCurrentStep('form');
    setTouristData(null);
    setPaymentStatus('pending');
    setTransactionId(null);
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'form':
        return <PaymentForm onSubmit={handleFormSubmit} isLoading={isCalculating} />;

      case 'summary':
        return (
          <PaymentSummary
            touristData={touristData as TouristTaxData}
            taxAmount={taxAmount}
            onConfirm={handlePaymentConfirm}
            onBack={handleBackToForm}
            isProcessing={isProcessing}
          />
        );

      case 'payment':
        return (
          <div className='text-center'>
            <div className='spinner-border text-primary' role='status'>
              <span className='visually-hidden'>{t('processing')}</span>
            </div>
            <p className='mt-3'>{t('redirectingToPayment')}</p>
          </div>
        );

      case 'receipt':
        return (
          <ReceiptDisplay
            touristData={touristData as TouristTaxData}
            taxAmount={taxAmount}
            transactionId={transactionId ?? ''}
            paymentStatus={paymentStatus}
            onNewPayment={handleBackToForm}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Container className='py-4'>
      <Row className='justify-content-center'>
        <Col lg={8} xl={6}>
          <Card className='shadow-sm'>
            <Card.Header className='bg-primary text-white'>
              <h2 className='mb-0 text-center'>{t('title')}</h2>
              <p className='mb-0 text-center opacity-75'>{t('subtitle')}</p>
            </Card.Header>

            <Card.Body className='p-4'>{renderCurrentStep()}</Card.Body>

            <Card.Footer className='bg-light'>
              <GDPRConsent />
            </Card.Footer>
          </Card>
        </Col>
      </Row>

      {/* Progress indicator */}
      <Row className='justify-content-center mt-3'>
        <Col lg={8} xl={6}>
          <div className='d-flex justify-content-between'>
            <div className={`step ${currentStep === 'form' ? 'active' : ''}`}>
              <span className='step-number'>1</span>
              <span className='step-label'>{t('steps.form')}</span>
            </div>
            <div className={`step ${currentStep === 'summary' ? 'active' : ''}`}>
              <span className='step-number'>2</span>
              <span className='step-label'>{t('steps.summary')}</span>
            </div>
            <div className={`step ${currentStep === 'payment' ? 'active' : ''}`}>
              <span className='step-number'>3</span>
              <span className='step-label'>{t('steps.payment')}</span>
            </div>
            <div className={`step ${currentStep === 'receipt' ? 'active' : ''}`}>
              <span className='step-number'>4</span>
              <span className='step-label'>{t('steps.receipt')}</span>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TouristTaxPage;
