import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TouristTaxData, FormValidationError } from '../types/TouristTaxTypes';

interface StayDetailsFormProps {
  formData: Partial<TouristTaxData>;
  onChange: (field: keyof TouristTaxData, value: any) => void;
  onBlur: (field: string) => void;
  errors: FormValidationError[];
  touched: Record<string, boolean>;
}

const StayDetailsForm: React.FC<StayDetailsFormProps> = ({
  formData,
  onChange,
  onBlur,
  errors,
  touched
}) => {
  const { t } = useTranslation('tourist-tax');

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field);
  };

  const isFieldInvalid = (field: string) => {
    return touched[field] && !!getFieldError(field);
  };

  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  // Calculate minimum checkout date (day after checkin)
  const minCheckOutDate = formData.checkInDate
    ? new Date(new Date(formData.checkInDate).getTime() + 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]
    : today;

  return (
    <>
      {/* Check-in and Check-out Dates */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.checkInDate')} *</Form.Label>
            <Form.Control
              type='date'
              value={formData.checkInDate || ''}
              min={today}
              onChange={e => onChange('checkInDate', e.target.value)}
              onBlur={() => onBlur('checkInDate')}
              isInvalid={isFieldInvalid('checkInDate')}
            />
            <Form.Control.Feedback type='invalid'>
              {getFieldError('checkInDate')?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.checkOutDate')} *</Form.Label>
            <Form.Control
              type='date'
              value={formData.checkOutDate || ''}
              min={minCheckOutDate}
              onChange={e => onChange('checkOutDate', e.target.value)}
              onBlur={() => onBlur('checkOutDate')}
              isInvalid={isFieldInvalid('checkOutDate')}
            />
            <Form.Control.Feedback type='invalid'>
              {getFieldError('checkOutDate')?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {/* Number of Persons */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.numberOfPersons')} *</Form.Label>
            <Form.Control
              type='number'
              min='1'
              max='20'
              value={formData.numberOfPersons || 1}
              onChange={e => onChange('numberOfPersons', parseInt(e.target.value) || 1)}
              onBlur={() => onBlur('numberOfPersons')}
              isInvalid={isFieldInvalid('numberOfPersons')}
            />
            <Form.Control.Feedback type='invalid'>
              {getFieldError('numberOfPersons')?.message}
            </Form.Control.Feedback>
            <Form.Text className='text-muted'>
              Liczba osób podlegających opłacie miejscowej
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.accommodationType')}</Form.Label>
            <Form.Select
              value={formData.accommodationType || 'hotel'}
              onChange={e => onChange('accommodationType', e.target.value as any)}
            >
              <option value='hotel'>{t('accommodationTypes.hotel')}</option>
              <option value='apartment'>{t('accommodationTypes.apartment')}</option>
              <option value='hostel'>{t('accommodationTypes.hostel')}</option>
              <option value='camping'>{t('accommodationTypes.camping')}</option>
              <option value='other'>{t('accommodationTypes.other')}</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      {/* Accommodation Details */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.accommodationName')}</Form.Label>
            <Form.Control
              type='text'
              value={formData.accommodationName || ''}
              onChange={e => onChange('accommodationName', e.target.value)}
              placeholder={t('placeholders.accommodationName')}
            />
            <Form.Text className='text-muted'>
              Opcjonalne - nazwa hotelu, apartamentu itp.
            </Form.Text>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3'>
            <Form.Label>{t('fields.accommodationAddress')}</Form.Label>
            <Form.Control
              type='text'
              value={formData.accommodationAddress || ''}
              onChange={e => onChange('accommodationAddress', e.target.value)}
              placeholder={t('placeholders.accommodationAddress')}
            />
            <Form.Text className='text-muted'>Opcjonalne - adres zakwaterowania</Form.Text>
          </Form.Group>
        </Col>
      </Row>

      {/* Stay Duration Preview */}
      {formData.checkInDate && formData.checkOutDate && (
        <div className='alert alert-info'>
          <div className='d-flex justify-content-between align-items-center'>
            <div>
              <strong>Okres pobytu:</strong> {formData.checkInDate} - {formData.checkOutDate}
            </div>
            <div>
              <strong>Liczba nocy:</strong>{' '}
              {Math.ceil(
                (new Date(formData.checkOutDate).getTime() -
                  new Date(formData.checkInDate).getTime()) /
                  (1000 * 60 * 60 * 24)
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StayDetailsForm;
