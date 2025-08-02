// Reservation Preview Modal Component
// Shows parsed reservations with city selection and import options

import React, { useState, useCallback } from 'react';
import { Modal, Table, Form, Button, Alert, Badge, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { CityTaxRate } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';
import CitySelector from './CitySelector';

interface ReservationPreviewModalProps {
  show: boolean;
  onHide: () => void;
  reservations: BookingReservation[];
  onImport: (reservations: BookingReservation[], city: CityTaxRate) => void;
}

const ReservationPreviewModal: React.FC<ReservationPreviewModalProps> = ({
  show,
  onHide,
  reservations,
  onImport
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // State
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set(reservations.map(r => r.id)));
  const [selectedCity, setSelectedCity] = useState<CityTaxRate | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (show) {
      setSelectedReservations(new Set(reservations.map(r => r.id)));
      setSelectedCity(null);
    }
  }, [show, reservations]);

  // Selection handlers
  const toggleReservationSelection = useCallback((id: string) => {
    setSelectedReservations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedReservations(new Set(reservations.map(r => r.id)));
  }, [reservations]);

  const selectNone = useCallback(() => {
    setSelectedReservations(new Set());
  }, []);

  // City selection handler
  const handleCitySelect = useCallback((cityCode: string, cityName: string) => {
    // Find the full city data
    TaxCalculationService.getAvailableCities().then(response => {
      if (response.success && Array.isArray(response.data)) {
        const city = response.data.find(c => c.cityCode === cityCode);
        if (city) {
          setSelectedCity(city);
        }
      }
    }).catch(error => {
      console.error('Error loading cities:', error);
    });
  }, []);

  // Calculate tax amount for a reservation
  const calculateTaxAmount = useCallback((reservation: BookingReservation): number => {
    if (!selectedCity) return 0;
    return TaxCalculationService.calculateTouristTax(
      reservation.numberOfPersons,
      reservation.numberOfNights,
      selectedCity.taxRatePerNight
    );
  }, [selectedCity]);

  // Import handler
  const handleImport = useCallback(async () => {
    if (!selectedCity || selectedReservations.size === 0) return;

    setIsImporting(true);
    try {
      const selectedReservationData = reservations.filter(r => selectedReservations.has(r.id));

      // Add city information and tax calculations
      const reservationsWithCity = selectedReservationData.map(reservation => ({
        ...reservation,
        cityCode: selectedCity.cityCode,
        cityName: selectedCity.cityName,
        accommodationAddress: selectedCity.cityName,
        taxAmount: calculateTaxAmount(reservation)
      }));

      await onImport(reservationsWithCity, selectedCity);
      onHide();
    } catch (error) {
      console.error('Error importing reservations:', error);
    } finally {
      setIsImporting(false);
    }
  }, [selectedCity, selectedReservations, reservations, onImport, onHide, calculateTaxAmount]);

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'no_show': return 'warning';
      default: return 'secondary';
    }
  };

  const selectedCount = selectedReservations.size;
  const totalTax = reservations
    .filter(r => selectedReservations.has(r.id))
    .reduce((sum, r) => sum + calculateTaxAmount(r), 0);

  return (
    <Modal show={show} onHide={onHide} size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {t('import.previewReservations', 'Preview Reservations')} ({reservations.length})
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* City Selection */}
        <Row className="mb-4">
          <Col md={8}>
            <CitySelector
              selectedCityCode={selectedCity?.cityCode || ''}
              onCitySelect={handleCitySelect}
              isInvalid={false}
            />
          </Col>
          <Col md={4}>
            {selectedCity && (
              <Alert variant="info" className="mb-0">
                <strong>{t('import.taxRate', 'Tax Rate')}:</strong><br />
                {TaxCalculationService.formatCurrency(selectedCity.taxRatePerNight)} {t('import.perNight', 'per night')}
              </Alert>
            )}
          </Col>
        </Row>

        {/* Selection Summary */}
        <Alert variant="primary" className="mb-3">
          <Row>
            <Col md={6}>
              <strong>{selectedCount}</strong> {t('import.selectedReservations', 'selected reservations')}
              {' '} {t('common:of', 'of')} {' '} <strong>{reservations.length}</strong>
            </Col>
            <Col md={6} className="text-end">
              {selectedCity && (
                <>
                  <strong>{t('import.totalTax', 'Total Tax')}:</strong> {TaxCalculationService.formatCurrency(totalTax)}
                </>
              )}
            </Col>
          </Row>
        </Alert>

        {/* Reservations Table */}
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Table striped bordered hover size="sm">
            <thead className="sticky-top bg-light">
              <tr>
                <th style={{ width: '40px' }}>
                  <Form.Check
                    type="checkbox"
                    checked={selectedReservations.size === reservations.length && reservations.length > 0}
                    onChange={selectedReservations.size === reservations.length ? selectNone : selectAll}
                  />
                </th>
                <th>{t('fields.guestName', 'Guest Name')}</th>
                <th>{t('fields.checkInDate', 'Check-in')}</th>
                <th>{t('fields.checkOutDate', 'Check-out')}</th>
                <th>{t('fields.numberOfPersons', 'Persons')}</th>
                <th>{t('fields.numberOfNights', 'Nights')}</th>
                <th>{t('fields.status', 'Status')}</th>
                <th>{t('import.taxAmount', 'Tax Amount')}</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((reservation) => (
                <tr key={reservation.id}>
                  <td>
                    <Form.Check
                      type="checkbox"
                      checked={selectedReservations.has(reservation.id)}
                      onChange={() => toggleReservationSelection(reservation.id)}
                    />
                  </td>
                  <td>
                    <strong>{reservation.guestName}</strong>
                    <br />
                    <small className="text-muted">{reservation.guestCountry}</small>
                  </td>
                  <td>{reservation.checkInDate}</td>
                  <td>{reservation.checkOutDate}</td>
                  <td>{reservation.numberOfPersons}</td>
                  <td>{reservation.numberOfNights}</td>
                  <td>
                    <Badge bg={getStatusVariant(reservation.status)}>
                      {reservation.status}
                    </Badge>
                  </td>
                  <td>
                    {selectedCity ? (
                      <strong>{TaxCalculationService.formatCurrency(calculateTaxAmount(reservation))}</strong>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          {t('common:cancel', 'Cancel')}
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={!selectedCity || selectedReservations.size === 0 || isImporting}
        >
          {isImporting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              {t('import.importing', 'Importing...')}
            </>
          ) : (
            <>
              <i className="bi bi-check-lg me-2"></i>
              {t('import.importSelected', 'Import Selected')} ({selectedCount})
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReservationPreviewModal;
