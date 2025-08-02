/**
 * Dynamic Reservations List Component
 * Demonstrates how static page can display dynamic data from Azure Storage
 * Integrates with existing Bootstrap styling and i18n patterns
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Spinner, Alert, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useReservations, useCityConfigurations } from '../hooks/useApiData';
import { ReservationData } from '../services/ApiService';
import { formatCurrency, formatDate } from '../../../platform/utils/formatters';

interface DynamicReservationsListProps {
  selectedCityCode?: string;
  onReservationSelect?: (reservation: ReservationData) => void;
  showFilters?: boolean;
}

const DynamicReservationsList: React.FC<DynamicReservationsListProps> = ({
  selectedCityCode,
  onReservationSelect,
  showFilters = true
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);
  
  // Local state for filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [cityFilter, setCityFilter] = useState<string>(selectedCityCode || 'all');

  // API data hooks
  const {
    data: reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations
  } = useReservations(cityFilter === 'all' ? undefined : cityFilter);

  const {
    data: cityConfigs,
    loading: cityConfigsLoading,
    error: cityConfigsError
  } = useCityConfigurations();

  // Update city filter when prop changes
  useEffect(() => {
    if (selectedCityCode && selectedCityCode !== cityFilter) {
      setCityFilter(selectedCityCode);
    }
  }, [selectedCityCode, cityFilter]);

  /**
   * Filter reservations based on current filters
   */
  const filteredReservations = React.useMemo(() => {
    if (!reservations) return [];

    return reservations.filter(reservation => {
      // Status filter
      if (statusFilter !== 'all' && reservation.status !== statusFilter) {
        return false;
      }

      // Date filter
      if (dateFilter !== 'all') {
        const checkInDate = new Date(reservation.checkInDate);
        const now = new Date();
        const daysDiff = Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        switch (dateFilter) {
          case 'today':
            if (daysDiff !== 0) return false;
            break;
          case 'week':
            if (daysDiff < 0 || daysDiff > 7) return false;
            break;
          case 'month':
            if (daysDiff < 0 || daysDiff > 30) return false;
            break;
          case 'past':
            if (daysDiff >= 0) return false;
            break;
        }
      }

      return true;
    });
  }, [reservations, statusFilter, dateFilter]);

  /**
   * Get status badge variant
   */
  const getStatusBadgeVariant = (status: ReservationData['status']): string => {
    switch (status) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  /**
   * Get city name from configuration
   */
  const getCityName = (cityCode: string): string => {
    const cityConfig = cityConfigs?.find(config => config.cityCode === cityCode);
    return cityConfig?.cityName || cityCode;
  };

  /**
   * Handle reservation click
   */
  const handleReservationClick = (reservation: ReservationData) => {
    if (onReservationSelect) {
      onReservationSelect(reservation);
    }
  };

  /**
   * Handle refresh
   */
  const handleRefresh = async () => {
    await refetchReservations();
  };

  // Loading state
  if (reservationsLoading || cityConfigsLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status" className="me-2" />
          <span>{t('common:loading')}</span>
        </div>
      </Container>
    );
  }

  // Error state
  if (reservationsError || cityConfigsError) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>{t('common:error')}</Alert.Heading>
          <p>{reservationsError || cityConfigsError}</p>
          <Button variant="outline-danger" onClick={handleRefresh}>
            {t('common:retry')}
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>{t('tourist-tax:reservations.title')}</h2>
            <Button variant="outline-primary" onClick={handleRefresh} size="sm">
              <i className="bi bi-arrow-clockwise me-1"></i>
              {t('common:refresh')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters */}
      {showFilters && (
        <Row className="mb-4">
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t('tourist-tax:filters.status')}</Form.Label>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('common:all')}</option>
                <option value="pending">{t('tourist-tax:status.pending')}</option>
                <option value="paid">{t('tourist-tax:status.paid')}</option>
                <option value="cancelled">{t('tourist-tax:status.cancelled')}</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>{t('tourist-tax:filters.date')}</Form.Label>
              <Form.Select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="all">{t('common:all')}</option>
                <option value="today">{t('tourist-tax:filters.today')}</option>
                <option value="week">{t('tourist-tax:filters.thisWeek')}</option>
                <option value="month">{t('tourist-tax:filters.thisMonth')}</option>
                <option value="past">{t('tourist-tax:filters.past')}</option>
              </Form.Select>
            </Form.Group>
          </Col>
          {!selectedCityCode && (
            <Col md={4}>
              <Form.Group>
                <Form.Label>{t('tourist-tax:filters.city')}</Form.Label>
                <Form.Select
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="all">{t('common:all')}</option>
                  {cityConfigs?.map(config => (
                    <option key={config.cityCode} value={config.cityCode}>
                      {config.cityName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          )}
        </Row>
      )}

      {/* Reservations Table */}
      <Row>
        <Col>
          <Card>
            <Card.Header>
              <div className="d-flex justify-content-between align-items-center">
                <span>{t('tourist-tax:reservations.list')}</span>
                <Badge bg="secondary">{filteredReservations.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              {filteredReservations.length === 0 ? (
                <div className="text-center py-4">
                  <i className="bi bi-inbox display-4 text-muted"></i>
                  <p className="text-muted mt-2">{t('tourist-tax:reservations.empty')}</p>
                </div>
              ) : (
                <Table responsive hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>{t('tourist-tax:reservations.city')}</th>
                      <th>{t('tourist-tax:reservations.dates')}</th>
                      <th>{t('tourist-tax:reservations.guests')}</th>
                      <th>{t('tourist-tax:reservations.amount')}</th>
                      <th>{t('tourist-tax:reservations.status')}</th>
                      <th>{t('tourist-tax:reservations.platform')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReservations.map(reservation => (
                      <tr
                        key={reservation.id}
                        style={{ cursor: onReservationSelect ? 'pointer' : 'default' }}
                        onClick={() => handleReservationClick(reservation)}
                      >
                        <td>
                          <strong>{getCityName(reservation.cityCode)}</strong>
                          <br />
                          <small className="text-muted">{reservation.cityCode}</small>
                        </td>
                        <td>
                          <div>
                            {formatDate(reservation.checkInDate)} -
                            <br />
                            {formatDate(reservation.checkOutDate)}
                          </div>
                        </td>
                        <td>
                          <Badge bg="info">{reservation.guestCount}</Badge>
                        </td>
                        <td>
                          <strong>{formatCurrency(reservation.taxAmount, 'PLN')}</strong>
                        </td>
                        <td>
                          <Badge bg={getStatusBadgeVariant(reservation.status)}>
                            {t(`tourist-tax:status.${reservation.status}`)}
                          </Badge>
                        </td>
                        <td>
                          <small className="text-muted">{reservation.bookingPlatform}</small>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DynamicReservationsList;
