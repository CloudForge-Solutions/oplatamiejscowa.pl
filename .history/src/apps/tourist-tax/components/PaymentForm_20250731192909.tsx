import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import CitySelector from './CitySelector';
import StayDetailsForm from './StayDetailsForm';
import { TouristTaxData, FormValidationError } from '../types/TouristTaxTypes';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PaymentFormProps {
  onSubmit: (data: TouristTaxData) => void;
  isLoading: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, isLoading }) => {
  const { t } = useTranslation('tourist-tax');
  const { getStoredFormData, storeFormData } = useLocalStorage();

  const [formData, setFormData] = useState<Partial<TouristTaxData>>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    cityCode: '',
    cityName: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfPersons: 1,
    accommodationType: 'hotel',
    accommodationName: '',
    accommodationAddress: '',
    gdprConsents: [
      { type: 'data_processing', given: false, timestamp: '' },
      { type: 'email_marketing', given: false, timestamp: '' }
    ]
  });

  const [errors, setErrors] = useState<FormValidationError[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load saved form data on component mount
  useEffect(() => {
    const savedData = getStoredFormData();
    if (savedData) {
      setFormData(prev => ({ ...prev, ...savedData }));
    }
  }, [getStoredFormData]);

  // Auto-save form data as user types
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      storeFormData(formData);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData, storeFormData]);

  const handleInputChange = (field: keyof TouristTaxData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field when user starts typing
    if (errors.some(error => error.field === field)) {
      setErrors(prev => prev.filter(error => error.field !== field));
    }
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = (): FormValidationError[] => {
    const newErrors: FormValidationError[] = [];

    // Required fields validation
    if (!formData.firstName?.trim()) {
      newErrors.push({
        field: 'firstName',
        message: t('validation.required', { field: t('fields.firstName') }),
        code: 'REQUIRED'
      });
    }

    if (!formData.lastName?.trim()) {
      newErrors.push({
        field: 'lastName',
        message: t('validation.required', { field: t('fields.lastName') }),
        code: 'REQUIRED'
      });
    }

    if (!formData.email?.trim()) {
      newErrors.push({
        field: 'email',
        message: t('validation.required', { field: t('fields.email') }),
        code: 'REQUIRED'
      });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({
        field: 'email',
        message: t('validation.invalidEmail'),
        code: 'INVALID_EMAIL'
      });
    }

    if (!formData.cityCode) {
      newErrors.push({
        field: 'cityCode',
        message: t('validation.required', { field: t('fields.city') }),
        code: 'REQUIRED'
      });
    }

    if (!formData.checkInDate) {
      newErrors.push({
        field: 'checkInDate',
        message: t('validation.required', { field: t('fields.checkInDate') }),
        code: 'REQUIRED'
      });
    }

    if (!formData.checkOutDate) {
      newErrors.push({
        field: 'checkOutDate',
        message: t('validation.required', { field: t('fields.checkOutDate') }),
        code: 'REQUIRED'
      });
    }

    // Date validation
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkIn < today) {
        newErrors.push({
          field: 'checkInDate',
          message: t('validation.pastDate'),
          code: 'PAST_DATE'
        });
      }

      if (checkOut <= checkIn) {
        newErrors.push({
          field: 'checkOutDate',
          message: t('validation.checkOutAfterCheckIn'),
          code: 'INVALID_DATE_RANGE'
        });
      }
    }

    // Number of persons validation
    if (!formData.numberOfPersons || formData.numberOfPersons < 1) {
      newErrors.push({
        field: 'numberOfPersons',
        message: t('validation.minPersons'),
        code: 'MIN_VALUE'
      });
    }

    // GDPR consent validation
    const dataProcessingConsent = formData.gdprConsents?.find(c => c.type === 'data_processing');
    if (!dataProcessingConsent?.given) {
      newErrors.push({
        field: 'gdprConsents',
        message: t('validation.gdprRequired'),
        code: 'GDPR_REQUIRED'
      });
    }

    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      // Calculate number of nights
      const checkIn = new Date(formData.checkInDate as string);
      const checkOut = new Date(formData.checkOutDate as string);
      const numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

      // Add timestamps to consents
      const updatedConsents = formData.gdprConsents?.map(consent => ({
        ...consent,
        timestamp: new Date().toISOString()
      })) ?? [];

      const completeData: TouristTaxData = {
        ...formData as TouristTaxData,
        numberOfNights,
        taxRatePerNight: 0, // Will be calculated by the service
        totalTaxAmount: 0, // Will be calculated by the service
        gdprConsents: updatedConsents
      };

      onSubmit(completeData);
    }
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const isFieldInvalid = (field: string) => {
    return touched[field] && !!getFieldError(field);
  };

  return (
    <Form onSubmit={handleSubmit}>
      {errors.length > 0 && (
        <Alert variant="danger">
          <Alert.Heading>{t('validation.formErrors')}</Alert.Heading>
          <ul className="mb-0">
            {errors.map((error, index) => (
              <li key={index}>{error.message}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Personal Information */}
      <h5 className="mb-3">{t('sections.personalInfo')}</h5>
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('fields.firstName')} *</Form.Label>
            <Form.Control
              type="text"
              value={formData.firstName || ''}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
              isInvalid={isFieldInvalid('firstName')}
              placeholder={t('placeholders.firstName')}
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError('firstName')?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('fields.lastName')} *</Form.Label>
            <Form.Control
              type="text"
              value={formData.lastName || ''}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
              isInvalid={isFieldInvalid('lastName')}
              placeholder={t('placeholders.lastName')}
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError('lastName')?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('fields.email')} *</Form.Label>
            <Form.Control
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              isInvalid={isFieldInvalid('email')}
              placeholder={t('placeholders.email')}
            />
            <Form.Control.Feedback type="invalid">
              {getFieldError('email')?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>{t('fields.phone')}</Form.Label>
            <Form.Control
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder={t('placeholders.phone')}
            />
          </Form.Group>
        </Col>
      </Row>

      {/* City Selection */}
      <h5 className="mb-3 mt-4">{t('sections.destination')}</h5>
      <CitySelector
        selectedCityCode={formData.cityCode || ''}
        onCitySelect={(cityCode, cityName) => {
          handleInputChange('cityCode', cityCode);
          handleInputChange('cityName', cityName);
        }}
        isInvalid={isFieldInvalid('cityCode')}
        errorMessage={getFieldError('cityCode')?.message}
      />

      {/* Stay Details */}
      <h5 className="mb-3 mt-4">{t('sections.stayDetails')}</h5>
      <StayDetailsForm
        formData={formData}
        onChange={handleInputChange}
        onBlur={handleBlur}
        errors={errors}
        touched={touched}
      />

      {/* Submit Button */}
      <div className="d-grid gap-2 mt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" />
              {t('buttons.calculating')}
            </>
          ) : (
            t('buttons.calculateTax')
          )}
        </Button>
      </div>
    </Form>
  );
};

export default PaymentForm;
