/**
 * StaysManager - Unified component for managing stays (reservations and payments)
 * Replaces separate reservations and payments pages with city grouping and selection
 */

import React, { useState, useEffect } from 'react';
import { Card, Table, Badge, Button, Form, Row, Col, Alert, Spinner, Accordion, Collapse } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { reservationRepository, ReservationFilter, ReservationStats } from '../repositories/ReservationRepository';
import { TaxCalculationService } from '../services/TaxCalculationService';
import BookingReservationImport from './BookingReservationImport';

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

  // Debug: Log component mount
  console.log('🏠 StaysManager component mounted');

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

  // Import section state
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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
        stats: statsData,
        sampleReservations: reservationData.slice(0, 3).map(r => ({
          id: r.id,
          guestName: r.guestName,
          accommodationName: r.accommodationName,
          guestCountry: r.guestCountry
        }))
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

    // Group by city (extract city from accommodation address or use accommodation name)
    const cityMap = new Map<string, BookingReservation[]>();

    filteredReservations.forEach(reservation => {
      // Use city information from import, fallback to address extraction
      let cityKey = 'Unknown City';

      // First priority: use cityName from import
      if (reservation.cityName) {
        cityKey = reservation.cityName;
      }
      // Second priority: try to extract city from accommodation address
      else if (reservation.accommodationAddress) {
        // Common Polish city patterns in addresses
        const cityPatterns = [
          /Kraków|Krakow/i,
          /Warszawa|Warsaw/i,
          /Gdańsk|Gdansk/i,
          /Wrocław|Wroclaw/i,
          /Poznań|Poznan/i,
          /Zakopane/i,
          /Łódź|Lodz/i,
          /Katowice/i,
          /Lublin/i,
          /Białystok|Bialystok/i
        ];

        for (const pattern of cityPatterns) {
          const match = reservation.accommodationAddress.match(pattern);
          if (match) {
            cityKey = match[0];
            break;
          }
        }
      }

      // If no city found in address, try accommodation name
      if (cityKey === 'Unknown City' && reservation.accommodationName) {
        const cityPatterns = [
          /Kraków|Krakow/i,
          /Warszawa|Warsaw/i,
          /Gdańsk|Gdansk/i,
          /Wrocław|Wroclaw/i,
          /Poznań|Poznan/i,
          /Zakopane/i,
          /Łódź|Lodz/i,
          /Katowice/i,
          /Lublin/i,
          /Białystok|Bialystok/i
        ];

        for (const pattern of cityPatterns) {
          const match = reservation.accommodationName.match(pattern);
          if (match) {
            cityKey = match[0];
            break;
          }
        }

        // If still no match, use accommodation name as fallback
        if (cityKey === 'Unknown City') {
          cityKey = reservation.accommodationName;
        }
      }

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

      // Generate proper city code based on known cities
      let cityCode = 'UNK';
      const cityLower = cityName.toLowerCase();

      if (cityLower.includes('kraków') || cityLower.includes('krakow')) {
        cityCode = 'KRK';
      } else if (cityLower.includes('warszawa') || cityLower.includes('warsaw')) {
        cityCode = 'WAW';
      } else if (cityLower.includes('gdańsk') || cityLower.includes('gdansk')) {
        cityCode = 'GDN';
      } else if (cityLower.includes('wrocław') || cityLower.includes('wroclaw')) {
        cityCode = 'WRO';
      } else if (cityLower.includes('poznań') || cityLower.includes('poznan')) {
        cityCode = 'POZ';
      } else if (cityLower.includes('zakopane')) {
        cityCode = 'ZAK';
      } else if (cityLower.includes('łódź') || cityLower.includes('lodz')) {
        cityCode = 'LDZ';
      } else if (cityLower.includes('katowice')) {
        cityCode = 'KAT';
      } else if (cityLower.includes('lublin')) {
        cityCode = 'LUB';
      } else if (cityLower.includes('białystok') || cityLower.includes('bialystok')) {
        cityCode = 'BIA';
      } else {
        // Generate code from first 3 characters if no match
        cityCode = cityName.substring(0, 3).toUpperCase();
      }

      return {
        cityName,
        cityCode,
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
   * Handle imported reservations
   */
  const handleReservationsImported = (importedReservations: BookingReservation[]) => {
    logger.info('Reservations imported successfully', { count: importedReservations.length });

    // Reload stays to include the newly imported ones
    loadStays();

    // Close the import section
    setShowImportSection(false);

    // Show success message
    setError(null);
  };

  /**
   * Handle drag & drop events
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(file =>
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (excelFile) {
      // Show import modal
      setShowImportModal(true);
      logger.info('Excel file dropped', { fileName: excelFile.name, fileSize: excelFile.size });
    } else {
      setError('Please drop a valid Excel file (.xlsx or .xls)');
    }
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

  // Debug logging
  logger.debug('StaysManager render', {
    reservationsCount: reservations.length,
    cityGroupsCount: cityGroups.length,
    selectedStaysCount: selectedStays.size,
    isLoading,
    error
  });

  return (
    <div>

      {/* Simple Import Section */}
      {reservations.length === 0 ? (
        <div
          className={`mb-4 p-5 text-center border-2 border-dashed rounded-3 ${
            isDragOver
              ? 'border-primary bg-primary bg-opacity-10'
              : 'border-secondary bg-light'
          }`}
          style={{
            transition: 'all 0.2s ease',
            cursor: 'pointer',
            minHeight: '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => setShowImportSection(!showImportSection)}
        >
          <div className="mb-3">
            <i className={`bi bi-upload display-4 ${isDragOver ? 'text-primary' : 'text-muted'}`}></i>
          </div>
          <h5 className={isDragOver ? 'text-primary' : 'text-dark'}>
            {isDragOver
              ? t('import.dropFile', 'Drop your Excel file here')
              : t('stays.noStaysYet', 'No stays yet. Import data from Booking.com to get started.')
            }
          </h5>
          <p className={`mb-3 ${isDragOver ? 'text-primary' : 'text-muted'}`}>
            {isDragOver
              ? t('import.supportedFormats', 'Supported formats: .xlsx, .xls')
              : t('import.dropFile', 'Drop your Excel file here')
            }
          </p>
          {!isDragOver && (
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                setShowImportModal(true);
              }}
            >
              <i className="bi bi-upload me-2"></i>
              {t('common:actions.import', 'Import Reservations')}
            </Button>
          )}
        </div>
      ) : (
        <div className="mb-3 text-end">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setShowImportSection(!showImportSection)}
          >
            <i className="bi bi-plus-circle me-1"></i>
            {t('common:actions.import', 'Import More')}
          </Button>
        </div>
      )}

      {/* Import Modal */}
      <BookingReservationImport
        show={showImportModal}
        onHide={() => setShowImportModal(false)}
        onReservationsImported={handleReservationsImported}
      />



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
          <Row className="align-items-center">
            <Col md={4}>
              <Card.Title className="mb-0">
                <i className="bi bi-building me-2"></i>
                {t('stays.title', 'Stays by City')} ({cityGroups.reduce((sum, group) => sum + group.stats.total, 0)})
              </Card.Title>
            </Col>
            <Col md={8}>
              <Row className="g-2">
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder={t('stays.searchPlaceholder', 'Search by guest name...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="sm"
                  />
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="all">{t('common:all', 'All Status')}</option>
                    <option value="confirmed">{t('status.confirmed', 'Confirmed')}</option>
                    <option value="pending">{t('status.pending', 'Pending')}</option>
                    <option value="cancelled">{t('status.cancelled', 'Cancelled')}</option>
                  </Form.Select>
                </Col>
                <Col md={3}>
                  <Form.Select
                    value={taxStatusFilter}
                    onChange={(e) => setTaxStatusFilter(e.target.value)}
                    size="sm"
                  >
                    <option value="all">{t('common:all', 'All Tax')}</option>
                    <option value="pending">{t('taxStatus.pending', 'Pending')}</option>
                    <option value="paid">{t('taxStatus.paid', 'Paid')}</option>
                    <option value="exempted">{t('taxStatus.exempted', 'Exempted')}</option>
                  </Form.Select>
                </Col>
                <Col md={2}>
                  <div className="d-flex gap-1">
                    <Button variant="outline-primary" size="sm" onClick={selectAllStays} title={t('stays.selectAll', 'Select All')}>
                      <i className="bi bi-check-all"></i>
                    </Button>
                    <Button variant="outline-secondary" size="sm" onClick={clearAllSelections} title={t('stays.clearSelection', 'Clear')}>
                      <i className="bi bi-x-circle"></i>
                    </Button>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

          {selectedStays.size > 0 && (
            <Row className="mt-2">
              <Col>
                <Alert variant="info" className="mb-0 py-2">
                  <i className="bi bi-check-square me-2"></i>
                  {selectedStays.size} {t('stays.selectedStays', 'stays selected')}
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="ms-3"
                    onClick={handleBulkDelete}
                    disabled={isLoading}
                  >
                    <i className="bi bi-trash me-1"></i>
                    {t('stays.deleteSelected', 'Delete Selected')}
                  </Button>
                </Alert>
              </Col>
            </Row>
          )}
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
