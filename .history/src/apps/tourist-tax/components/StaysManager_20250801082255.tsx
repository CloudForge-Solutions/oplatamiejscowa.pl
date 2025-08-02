/**
 * StaysManager - Unified component for managing stays (reservations and payments)
 * Replaces separate reservations and payments pages with city grouping and selection
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner, Accordion } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { reservationRepository, ReservationFilter, ReservationStats } from '../repositories/ReservationRepository';
import { TaxCalculationService } from '../services/TaxCalculationService';

// Logger for consistency
const logger = {
  info: (message: string, data?: any) => console.log(`[StaysManager] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[StaysManager] ${message}`, error || ''),
  debug: (message: string, data?: any) => import.meta.env.DEV && console.debug(`[StaysManager] ${message}`, data || '')
};

interface StaysManagerProps {
  onStaySelect?: (reservation: BookingReservation) => void;
  showActions?: boolean;
}

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

const StaysManager: React.FC<StaysManagerProps> = ({
  onStaySelect,
  showActions = true
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // State management
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [cityGroups, setCityGroups] = useState<CityGroup[]>([]);
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<ReservationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [taxStatusFilter, setTaxStatusFilter] = useState<string>('all');

  // Load reservations on component mount
  useEffect(() => {
    loadStays();
  }, []);

  // Group reservations by city when data changes
  useEffect(() => {
    groupReservationsByCity();
  }, [reservations, searchTerm, statusFilter, taxStatusFilter]);

  /**
   * Load all reservations from IndexedDB
   */
  const loadStays = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize repository if needed
      await reservationRepository.initialize();

      // Load reservations and stats
      const [reservationData, statsData] = await Promise.all([
        reservationRepository.findAll(),
        reservationRepository.getStats()
      ]);

      setReservations(reservationData);
      setStats(statsData);

      logger.info('✅ Stays loaded from IndexedDB', {
        count: reservationData.length,
        stats: statsData
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('❌ Failed to load stays', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Group reservations by city and apply filters
   */
  const groupReservationsByCity = () => {
    let filteredReservations = reservations;

    // Apply filters
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredReservations = filteredReservations.filter(r =>
        r.guestName.toLowerCase().includes(searchLower) ||
        r.reservationNumber.toLowerCase().includes(searchLower) ||
        (r.guestEmail && r.guestEmail.toLowerCase().includes(searchLower))
      );
    }

    if (statusFilter !== 'all') {
      filteredReservations = filteredReservations.filter(r => r.status === statusFilter);
    }

    if (taxStatusFilter !== 'all') {
      filteredReservations = filteredReservations.filter(r => r.taxStatus === taxStatusFilter);
    }

    // Group by city (using accommodationName as city proxy for now)
    const cityMap = new Map<string, BookingReservation[]>();

    filteredReservations.forEach(reservation => {
      // Extract city from accommodation name or use a default
      const cityKey = reservation.accommodationName || 'Unknown City';

      if (!cityMap.has(cityKey)) {
        cityMap.set(cityKey, []);
      }
      cityMap.get(cityKey)!.push(reservation);
    });

    // Convert to city groups with stats
    const groups: CityGroup[] = Array.from(cityMap.entries()).map(([cityName, cityReservations]) => {
      const confirmed = cityReservations.filter(r => r.status === 'confirmed');
      const pending = cityReservations.filter(r => r.status === 'pending');
      const totalTax = cityReservations.reduce((sum, r) => sum + (r.taxAmount || 0), 0);

      return {
        cityName,
        cityCode: cityName.substring(0, 3).toUpperCase(),
        reservations: cityReservations,
        stats: {
          total: cityReservations.length,
          confirmed: confirmed.length,
          pending: pending.length,
          totalTax
        }
      };
    });

    // Sort groups by total reservations (descending)
    groups.sort((a, b) => b.stats.total - a.stats.total);

    setCityGroups(groups);
    logger.debug('🏙️ Reservations grouped by city', {
      totalCities: groups.length,
      totalReservations: filteredReservations.length
    });
  };

  /**
   * Handle stay selection
   */
  const toggleStaySelection = (stayId: string) => {
    const newSelected = new Set(selectedStays);
    if (newSelected.has(stayId)) {
      newSelected.delete(stayId);
    } else {
      newSelected.add(stayId);
    }
    setSelectedStays(newSelected);
  };

  /**
   * Select all stays in a city group
   */
  const toggleCitySelection = (cityGroup: CityGroup) => {
    const cityStayIds = cityGroup.reservations.map(r => r.id);
    const newSelected = new Set(selectedStays);

    const allSelected = cityStayIds.every(id => newSelected.has(id));

    if (allSelected) {
      // Deselect all in this city
      cityStayIds.forEach(id => newSelected.delete(id));
    } else {
      // Select all in this city
      cityStayIds.forEach(id => newSelected.add(id));
    }

    setSelectedStays(newSelected);
  };

  /**
   * Select all stays
   */
  const selectAllStays = () => {
    const allStayIds = cityGroups.flatMap(group => group.reservations.map(r => r.id));
    setSelectedStays(new Set(allStayIds));
  };

  /**
   * Clear all selections
   */
  const clearAllSelections = () => {
    setSelectedStays(new Set());
  };

  /**
   * Handle stay deletion
   */
  const handleDelete = async (id: string) => {
    if (!confirm(t('common:confirmDelete', 'Are you sure you want to delete this stay?'))) {
      return;
    }

    try {
      await reservationRepository.delete(id);
      await loadStays(); // Reload data

      // Remove from selection if it was selected
      const newSelected = new Set(selectedStays);
      newSelected.delete(id);
      setSelectedStays(newSelected);

      logger.info('🗑️ Stay deleted', { id });
    } catch (err) {
      logger.error('❌ Failed to delete stay', { id, error: err });
      setError(`Failed to delete stay: ${err.message}`);
    }
  };

  /**
   * Handle bulk deletion of selected stays
   */
  const handleBulkDelete = async () => {
    if (selectedStays.size === 0) return;

    const confirmMessage = t('stays.confirmBulkDelete',
      `Are you sure you want to delete ${selectedStays.size} selected stays? This action cannot be undone.`
    );

    if (!confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);

      // Delete all selected stays
      const deletePromises = Array.from(selectedStays).map(id =>
        reservationRepository.delete(id)
      );

      await Promise.all(deletePromises);
      await loadStays(); // Reload data

      // Clear selections
      setSelectedStays(new Set());

      logger.info('🗑️ Bulk delete completed', { count: selectedStays.size });
    } catch (err) {
      logger.error('❌ Failed to bulk delete stays', { error: err });
      setError(`Failed to delete stays: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get status badge variant
   */
  const getStatusVariant = (status: BookingReservation['status']) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'no_show': return 'warning';
      default: return 'secondary';
    }
  };

  /**
   * Get tax status badge variant
   */
  const getTaxStatusVariant = (taxStatus?: BookingReservation['taxStatus']) => {
    switch (taxStatus) {
      case 'paid': return 'success';
      case 'exempted': return 'info';
      default: return 'warning';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" className="me-2" />
          {t('common:loading', 'Loading...')}
        </Card.Body>
      </Card>
    );
  }

  return (
    <div>
      {/* Statistics Card */}
      {stats && (
        <Card className="mb-4">
          <Card.Body>
            <Row>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="mb-1">{stats.total}</h4>
                  <small className="text-muted">{t('stats.totalReservations', 'Total Stays')}</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="mb-1 text-success">{stats.confirmed}</h4>
                  <small className="text-muted">{t('stats.confirmed', 'Confirmed')}</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="mb-1 text-warning">{stats.pending}</h4>
                  <small className="text-muted">{t('stats.pending', 'Pending')}</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="text-center">
                  <h4 className="mb-1 text-primary">{TaxCalculationService.formatCurrency(stats.totalTaxAmount)}</h4>
                  <small className="text-muted">{t('stats.totalTaxAmount', 'Total Tax')}</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}

      {/* Filters and Selection Controls */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('common:search', 'Search')}</Form.Label>
                <Form.Control
                  type="text"
                  placeholder={t('stays.searchPlaceholder', 'Search by guest name, reservation number...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('fields.status')}</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">{t('common:all', 'All')}</option>
                  <option value="confirmed">{t('status.confirmed', 'Confirmed')}</option>
                  <option value="pending">{t('status.pending', 'Pending')}</option>
                  <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
                  <option value="no_show">{t('status.noShow', 'No Show')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>{t('fields.taxStatus', 'Tax Status')}</Form.Label>
                <Form.Select
                  value={taxStatusFilter}
                  onChange={(e) => setTaxStatusFilter(e.target.value)}
                >
                  <option value="all">{t('common:all', 'All')}</option>
                  <option value="pending">{t('taxStatus.pending', 'Pending')}</option>
                  <option value="paid">{t('taxStatus.paid', 'Paid')}</option>
                  <option value="exempted">{t('taxStatus.exempted', 'Exempted')}</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2}>
              <Form.Group>
                <Form.Label>{t('stays.selection', 'Selection')}</Form.Label>
                <div className="d-grid gap-1">
                  <Button variant="outline-primary" size="sm" onClick={selectAllStays}>
                    {t('stays.selectAll', 'Select All')}
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={clearAllSelections}>
                    {t('stays.clearSelection', 'Clear')}
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>

          {selectedStays.size > 0 && (
            <Row className="mt-3">
              <Col>
                <Alert variant="info" className="mb-0">
                  <i className="bi bi-check-square me-2"></i>
                  {selectedStays.size} {t('stays.selectedStays', 'stays selected')}
                  <Button variant="outline-danger" size="sm" className="ms-3">
                    <i className="bi bi-trash me-1"></i>
                    {t('stays.deleteSelected', 'Delete Selected')}
                  </Button>
                </Alert>
              </Col>
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          <i className="bi bi-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      {/* City Groups Accordion */}
      <Card>
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="bi bi-building me-2"></i>
            {t('stays.title', 'Stays by City')} ({cityGroups.reduce((sum, group) => sum + group.stats.total, 0)})
          </Card.Title>
        </Card.Header>
        <Card.Body className="p-0">
          {cityGroups.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox display-4 text-muted"></i>
              <p className="mt-3 text-muted">
                {reservations.length === 0
                  ? t('stays.noStaysYet', 'No stays yet. Import data from Booking.com to get started.')
                  : t('stays.noMatchingStays', 'No stays match your current filters.')
                }
              </p>
            </div>
          ) : (
            <Accordion defaultActiveKey="0" flush>
              {cityGroups.map((cityGroup, index) => (
                <Accordion.Item eventKey={index.toString()} key={cityGroup.cityCode}>
                  <Accordion.Header>
                    <div className="d-flex justify-content-between align-items-center w-100 me-3">
                      <div>
                        <strong>{cityGroup.cityName}</strong>
                        <Badge bg="primary" className="ms-2">{cityGroup.stats.total}</Badge>
                      </div>
                      <div className="d-flex gap-2">
                        <Badge bg="success">{cityGroup.stats.confirmed} confirmed</Badge>
                        <Badge bg="warning">{cityGroup.stats.pending} pending</Badge>
                        <Badge bg="info">{TaxCalculationService.formatCurrency(cityGroup.stats.totalTax)}</Badge>
                      </div>
                    </div>
                  </Accordion.Header>
                  <Accordion.Body className="p-0">
                    <div className="p-3 border-bottom bg-light">
                      <Form.Check
                        type="checkbox"
                        label={`Select all ${cityGroup.stats.total} stays in ${cityGroup.cityName}`}
                        checked={cityGroup.reservations.every(r => selectedStays.has(r.id))}
                        onChange={() => toggleCitySelection(cityGroup)}
                      />
                    </div>
                    <Table striped hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th width="40"></th>
                          <th>{t('fields.guestName')}</th>
                          <th>{t('fields.checkInDate')}</th>
                          <th>{t('fields.checkOutDate')}</th>
                          <th>{t('fields.numberOfPersons')}</th>
                          <th>{t('fields.numberOfNights')}</th>
                          <th>{t('fields.status')}</th>
                          <th>{t('fields.taxStatus')}</th>
                          <th>{t('import.taxAmount')}</th>
                          {showActions && <th>{t('common:actions', 'Actions')}</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {cityGroup.reservations.map((reservation) => (
                          <tr
                            key={reservation.id}
                            className={selectedStays.has(reservation.id) ? 'table-active' : ''}
                            style={{ cursor: onStaySelect ? 'pointer' : 'default' }}
                            onClick={() => onStaySelect?.(reservation)}
                          >
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedStays.has(reservation.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleStaySelection(reservation.id);
                                }}
                              />
                            </td>
                            <td>
                              <strong>{reservation.guestName}</strong>
                              <br />
                              <small className="text-muted">{reservation.guestCountry}</small>
                            </td>
                            <td>{new Date(reservation.checkInDate).toLocaleDateString()}</td>
                            <td>{new Date(reservation.checkOutDate).toLocaleDateString()}</td>
                            <td>{reservation.numberOfPersons}</td>
                            <td>{reservation.numberOfNights}</td>
                            <td>
                              <Badge bg={getStatusVariant(reservation.status)}>
                                {reservation.status}
                              </Badge>
                            </td>
                            <td>
                              <Badge bg={getTaxStatusVariant(reservation.taxStatus)}>
                                {reservation.taxStatus || 'pending'}
                              </Badge>
                            </td>
                            <td>
                              {reservation.taxAmount ? (
                                <strong className="text-success">
                                  {TaxCalculationService.formatCurrency(reservation.taxAmount)}
                                </strong>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            {showActions && (
                              <td>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(reservation.id);
                                  }}
                                >
                                  <i className="bi bi-trash"></i>
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default StaysManager;
