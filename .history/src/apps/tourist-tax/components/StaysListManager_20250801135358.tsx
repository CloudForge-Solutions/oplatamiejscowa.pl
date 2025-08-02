// Stays List Manager - Handles stays display, grouping, and basic operations
// Single Responsibility: Stays list management and display

import React, { useMemo } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';

interface CityGroup {
  cityName: string;
  cityCode: string;
  reservations: BookingReservation[];
  stats: {
    total: number;
    confirmed: number;
    pending: number;
    totalTax: number;
  };
}

interface StaysListManagerProps {
  reservations: BookingReservation[];
  selectedStays: Set<string>;
  onStaySelectionChange: (stayId: string, selected: boolean) => void;
  onDeleteStay?: (stayId: string) => void;
  onEditStay?: (stayId: string) => void;
  isLoading?: boolean;
}

const StaysListManager: React.FC<StaysListManagerProps> = ({
  reservations,
  selectedStays,
  onStaySelectionChange,
  onDeleteStay,
  onEditStay,
  isLoading = false
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // Group reservations by city
  const cityGroups = useMemo((): CityGroup[] => {
    const groups = new Map<string, CityGroup>();

    reservations.forEach(reservation => {
      const cityKey = reservation.accommodationAddress || 'Unknown';
      
      if (!groups.has(cityKey)) {
        groups.set(cityKey, {
          cityName: cityKey,
          cityCode: reservation.cityCode || 'unknown',
          reservations: [],
          stats: {
            total: 0,
            confirmed: 0,
            pending: 0,
            totalTax: 0
          }
        });
      }

      const group = groups.get(cityKey)!;
      group.reservations.push(reservation);
      group.stats.total++;
      
      if (reservation.status === 'confirmed') {
        group.stats.confirmed++;
      } else {
        group.stats.pending++;
      }
      
      group.stats.totalTax += reservation.taxAmount || 0;
    });

    return Array.from(groups.values()).sort((a, b) => a.cityName.localeCompare(b.cityName));
  }, [reservations]);

  // Get status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'no_show': return 'warning';
      default: return 'secondary';
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: 'PLN'
    }).format(amount);
  };

  // Handle individual stay selection
  const handleStaySelection = (stayId: string, checked: boolean) => {
    onStaySelectionChange(stayId, checked);
  };

  // Handle group selection
  const handleGroupSelection = (group: CityGroup, checked: boolean) => {
    group.reservations.forEach(reservation => {
      onStaySelectionChange(reservation.id, checked);
    });
  };

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common:loading', 'Loading...')}</span>
        </div>
      </div>
    );
  }

  if (cityGroups.length === 0) {
    return null; // Empty state handled by parent component
  }

  return (
    <div>
      {cityGroups.map((group, index) => {
        const groupSelected = group.reservations.every(r => selectedStays.has(r.id));
        const groupPartiallySelected = group.reservations.some(r => selectedStays.has(r.id)) && !groupSelected;

        return (
          <Accordion key={group.cityCode} className="mb-3">
            <Accordion.Item eventKey={index.toString()}>
              <Accordion.Header>
                <div className="d-flex align-items-center w-100 me-3">
                  <Form.Check
                    type="checkbox"
                    checked={groupSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = groupPartiallySelected;
                    }}
                    onChange={(e) => handleGroupSelection(group, e.target.checked)}
                    className="me-3"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-grow-1">
                    <h6 className="mb-1">{group.cityName}</h6>
                    <div className="d-flex gap-3 text-muted small">
                      <span>
                        <i className="bi bi-house me-1"></i>
                        {group.stats.total} {t('stays.stays', 'stays')}
                      </span>
                      <span>
                        <i className="bi bi-check-circle me-1"></i>
                        {group.stats.confirmed} {t('stays.confirmed', 'confirmed')}
                      </span>
                      <span>
                        <i className="bi bi-clock me-1"></i>
                        {group.stats.pending} {t('stays.pending', 'pending')}
                      </span>
                      <span>
                        <i className="bi bi-currency-exchange me-1"></i>
                        {formatCurrency(group.stats.totalTax)}
                      </span>
                    </div>
                  </div>
                </div>
              </Accordion.Header>
              <Accordion.Body>
                <Table responsive hover size="sm">
                  <thead>
                    <tr>
                      <th style={{ width: '40px' }}></th>
                      <th>{t('fields.guestName', 'Guest Name')}</th>
                      <th>{t('fields.checkInDate', 'Check-in')}</th>
                      <th>{t('fields.checkOutDate', 'Check-out')}</th>
                      <th>{t('fields.numberOfPersons', 'Persons')}</th>
                      <th>{t('fields.numberOfNights', 'Nights')}</th>
                      <th>{t('fields.status', 'Status')}</th>
                      <th>{t('fields.taxAmount', 'Tax Amount')}</th>
                      <th>{t('common:actions', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.reservations.map((reservation) => (
                      <tr key={reservation.id}>
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedStays.has(reservation.id)}
                            onChange={(e) => handleStaySelection(reservation.id, e.target.checked)}
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
                          <Badge bg={getStatusVariant(reservation.status)}>
                            {reservation.status}
                          </Badge>
                        </td>
                        <td>
                          <strong>{formatCurrency(reservation.taxAmount || 0)}</strong>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            {onEditStay && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => onEditStay(reservation.id)}
                              >
                                <i className="bi bi-pencil"></i>
                              </Button>
                            )}
                            {onDeleteStay && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => onDeleteStay(reservation.id)}
                              >
                                <i className="bi bi-trash"></i>
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        );
      })}
    </div>
  );
};

export default StaysListManager;
