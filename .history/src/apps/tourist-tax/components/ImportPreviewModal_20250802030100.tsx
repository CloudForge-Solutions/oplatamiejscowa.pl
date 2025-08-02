// Import Preview Modal - Modal for reviewing and importing reservations with city selection
// Single Responsibility: Import preview and city selection UI

import React, { useState, useCallback, useEffect } from 'react';
import { Modal, Button, Alert, Form, Row, Col, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';
import { createComponentLogger } from '../../../platform/logging';

interface CityTaxRate {
  cityCode: string;
  cityName: string;
  rate: number;
  currency: string;
  effectiveDate: string;
}

interface ImportPreviewModalProps {
  show: boolean;
  reservations: BookingReservation[];
  onHide: () => void;
  onImport: (reservations: BookingReservation[], selectedCity: CityTaxRate) => void;
}

// Major Polish cities for quick selection
const MAJOR_CITIES = [
  { code: 'krakow', name: 'Kraków' },
  { code: 'warszawa', name: 'Warszawa' },
  { code: 'gdansk', name: 'Gdańsk' },
  { code: 'wroclaw', name: 'Wrocław' },
  { code: 'poznan', name: 'Poznań' },
  { code: 'katowice', name: 'Katowice' },
  { code: 'lodz', name: 'Łódź' },
  { code: 'szczecin', name: 'Szczecin' }
];

const ImportPreviewModal: React.FC<ImportPreviewModalProps> = ({
  show,
  reservations,
  onHide,
  onImport
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // State
  const [selectedCity, setSelectedCity] = useState<CityTaxRate | null>(null);
  const [availableCities, setAvailableCities] = useState<CityTaxRate[]>([]);
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load available cities on mount
  useEffect(() => {
    if (show) {
      loadAvailableCities();
      // Select all reservations by default
      setSelectedReservations(new Set(reservations.map(r => r.id)));
    }
  }, [show, reservations]);

  // Load available cities
  const loadAvailableCities = async () => {
    try {
      setIsLoading(true);
      const response = await TaxCalculationService.getAvailableCities();
      if (response.success && Array.isArray(response.data)) {
        setAvailableCities(response.data);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle city selection from dropdown
  const handleCitySelect = useCallback((cityCode: string) => {
    const city = availableCities.find(c => c.cityCode === cityCode);
    if (city) {
      setSelectedCity(city);
    }
  }, [availableCities]);

  // Handle quick city button selection
  const handleQuickCitySelect = useCallback((cityCode: string) => {
    const city = availableCities.find(c => c.cityCode === cityCode);
    if (city) {
      setSelectedCity(city);
    }
  }, [availableCities]);

  // Handle reservation selection
  const handleReservationSelect = useCallback((reservationId: string, selected: boolean) => {
    setSelectedReservations(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(reservationId);
      } else {
        newSet.delete(reservationId);
      }
      return newSet;
    });
  }, []);

  // Handle select all/none
  const handleSelectAll = useCallback((selectAll: boolean) => {
    if (selectAll) {
      setSelectedReservations(new Set(reservations.map(r => r.id)));
    } else {
      setSelectedReservations(new Set());
    }
  }, [reservations]);

  // Handle import
  const handleImport = useCallback(() => {
    if (!selectedCity || selectedReservations.size === 0) return;

    const selectedReservationsList = reservations.filter(r => selectedReservations.has(r.id));
    onImport(selectedReservationsList, selectedCity);
  }, [selectedCity, selectedReservations, reservations, onImport]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  const selectedCount = selectedReservations.size;
  const allSelected = selectedCount === reservations.length && reservations.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < reservations.length;

  return (
    <Modal show={show} onHide={onHide} size="xl" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-eye me-2"></i>
          {t('import.previewReservations', 'Preview Reservations')} ({reservations.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* City Selection Section */}
        <Alert variant="info" className="mb-4">
          <h6 className="alert-heading">
            <i className="bi bi-geo-alt me-2"></i>
            {t('import.selectCity', 'Select City')}
          </h6>
          <p className="mb-3">
            {t('import.selectCityDescription', 'Choose the city where these reservations are located to calculate correct tax rates.')}
          </p>

          {/* City Dropdown */}
          <Row className="mb-3">
            <Col md={6}>
              <Form.Select
                value={selectedCity?.cityCode || ''}
                onChange={(e) => handleCitySelect(e.target.value)}
                disabled={isLoading}
              >
                <option value="">{t('import.selectCityPlaceholder', 'Select a city...')}</option>
                {availableCities.map(city => (
                  <option key={city.cityCode} value={city.cityCode}>
                    {city.cityName} ({formatCurrency(city.rate)}/night)
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Quick City Buttons */}
          <div className="mb-2">
            <small className="text-muted">{t('import.quickSelect', 'Quick select:')}</small>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {MAJOR_CITIES.map(city => {
              const cityData = availableCities.find(c => c.cityCode === city.code);
              return (
                <Button
                  key={city.code}
                  variant={selectedCity?.cityCode === city.code ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleQuickCitySelect(city.code)}
                  disabled={!cityData}
                >
                  {city.name}
                  {cityData && (
                    <small className="ms-1">({formatCurrency(cityData.rate)})</small>
                  )}
                </Button>
              );
            })}
          </div>
        </Alert>

        {/* Selected City Info */}
        {selectedCity && (
          <Alert variant="success" className="mb-4">
            <strong>{t('import.selectedCity', 'Selected City')}:</strong> {selectedCity.cityName}
            <br />
            <strong>{t('import.taxRate', 'Tax Rate')}:</strong> {formatCurrency(selectedCity.rate)} per night
          </Alert>
        )}

        {/* Reservations Table */}
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>
              {t('import.reservationsToImport', 'Reservations to Import')}
              <Badge bg="primary" className="ms-2">{selectedCount} selected</Badge>
            </h6>
            <div>
              <Form.Check
                type="checkbox"
                label={t('common:selectAll', 'Select All')}
                checked={allSelected}
                ref={(input) => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
              />
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <Table striped bordered hover size="sm">
              <thead className="sticky-top bg-light">
                <tr>
                  <th style={{ width: '40px' }}></th>
                  <th>{t('fields.guestName', 'Guest Name')}</th>
                  <th>{t('fields.checkInDate', 'Check-in')}</th>
                  <th>{t('fields.checkOutDate', 'Check-out')}</th>
                  <th>{t('fields.numberOfPersons', 'Persons')}</th>
                  <th>{t('fields.numberOfNights', 'Nights')}</th>
                  <th>{t('fields.estimatedTax', 'Estimated Tax')}</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((reservation) => {
                  const estimatedTax = selectedCity
                    ? selectedCity.rate * reservation.numberOfNights * reservation.numberOfPersons
                    : 0;

                  return (
                    <tr key={reservation.id}>
                      <td>
                        <Form.Check
                          type="checkbox"
                          checked={selectedReservations.has(reservation.id)}
                          onChange={(e) => handleReservationSelect(reservation.id, e.target.checked)}
                        />
                      </td>
                      <td>
                        <div>
                          <strong>{reservation.guestName}</strong>
                          <br />
                          <small className="text-muted">{reservation.guestCountry}</small>
                        </div>
                      </td>
                      <td>{reservation.checkInDate}</td>
                      <td>{reservation.checkOutDate}</td>
                      <td>{reservation.numberOfPersons}</td>
                      <td>{reservation.numberOfNights}</td>
                      <td>
                        <strong>{formatCurrency(estimatedTax)}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('common:cancel', 'Cancel')}
        </Button>
        <Button
          variant="success"
          onClick={handleImport}
          disabled={!selectedCity || selectedCount === 0}
        >
          <i className="bi bi-check-lg me-2"></i>
          {t('import.importSelected', 'Import Selected')} ({selectedCount})
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImportPreviewModal;
