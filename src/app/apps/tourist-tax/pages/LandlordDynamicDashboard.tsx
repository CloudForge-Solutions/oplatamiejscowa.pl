/**
 * Landlord Dynamic Dashboard - Example of Static Page with Dynamic Data
 * Demonstrates how GitHub Pages static site can display real-time data from Azure Storage
 * Uses the new API service and hooks for seamless data integration
 */

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Button, Badge, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useReservations, useCityConfigurations } from '../hooks/useApiData';
import DynamicReservationsList from '../components/DynamicReservationsList';
import { ReservationData } from '../services/ApiService';
import { formatCurrency } from '../../../platform/utils/formatters';
import { STORAGE_KEYS, PLATFORM_EVENTS } from '../../../constants';

const LandlordDynamicDashboard: React.FC = () => {
  const { t } = useTranslation(['landlord', 'common']);
  
  // Local state
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [refreshInterval, setRefreshInterval] = useState<number>(30000); // 30 seconds
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // API data hooks - these automatically handle caching and real-time updates
  const {
    data: reservations,
    loading: reservationsLoading,
    error: reservationsError,
    refetch: refetchReservations
  } = useReservations(selectedCity === 'all' ? undefined : selectedCity);

  const {
    data: cityConfigs,
    loading: cityConfigsLoading,
    error: cityConfigsError
  } = useCityConfigurations();

  /**
   * Calculate dashboard statistics
   */
  const dashboardStats = React.useMemo(() => {
    if (!reservations) {
      return {
        totalReservations: 0,
        pendingPayments: 0,
        totalRevenue: 0,
        todayReservations: 0
      };
    }

    const today = new Date().toISOString().split('T')[0];
    
    return {
      totalReservations: reservations.length,
      pendingPayments: reservations.filter(r => r.status === 'pending').length,
      totalRevenue: reservations
        .filter(r => r.status === 'paid')
        .reduce((sum, r) => sum + r.taxAmount, 0),
      todayReservations: reservations.filter(r => 
        r.createdAt?.split('T')[0] === today
      ).length
    };
  }, [reservations]);

  /**
   * Handle city selection change
   */
  const handleCityChange = (cityCode: string) => {
    setSelectedCity(cityCode);
    setLastRefresh(new Date());
  };

  /**
   * Handle manual refresh
   */
  const handleManualRefresh = async () => {
    await refetchReservations();
    setLastRefresh(new Date());
  };

  /**
   * Handle reservation selection
   */
  const handleReservationSelect = (reservation: ReservationData) => {
    // Navigate to reservation details or open modal
    console.log('Selected reservation:', reservation);
  };

  // Auto-refresh effect
  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => {
        refetchReservations();
        setLastRefresh(new Date());
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [refreshInterval, refetchReservations]);

  // Loading state for initial load
  if (reservationsLoading && cityConfigsLoading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status" className="me-2" />
          <span>{t('common:loading')}</span>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1>{t('landlord:dashboard.title')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:dashboard.subtitle')} • 
                <small className="ms-1">
                  {t('common:lastUpdated')}: {lastRefresh.toLocaleTimeString()}
                </small>
              </p>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-primary" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={reservationsLoading}
              >
                {reservationsLoading ? (
                  <Spinner animation="border" size="sm" className="me-1" />
                ) : (
                  <i className="bi bi-arrow-clockwise me-1"></i>
                )}
                {t('common:refresh')}
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      {/* Error Alerts */}
      {(reservationsError || cityConfigsError) && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" dismissible>
              <Alert.Heading>{t('common:warning')}</Alert.Heading>
              <p>{t('landlord:dashboard.dataError')}</p>
              <p className="mb-0">
                <small>{reservationsError || cityConfigsError}</small>
              </p>
            </Alert>
          </Col>
        </Row>
      )}

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-primary">{dashboardStats.totalReservations}</div>
              <div className="text-muted">{t('landlord:stats.totalReservations')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-warning">{dashboardStats.pendingPayments}</div>
              <div className="text-muted">{t('landlord:stats.pendingPayments')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-success">
                {formatCurrency(dashboardStats.totalRevenue)}
              </div>
              <div className="text-muted">{t('landlord:stats.totalRevenue')}</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <div className="display-6 text-info">{dashboardStats.todayReservations}</div>
              <div className="text-muted">{t('landlord:stats.todayReservations')}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* City Filter */}
      <Row className="mb-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">{t('landlord:filters.cityFilter')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  variant={selectedCity === 'all' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleCityChange('all')}
                >
                  {t('common:all')}
                  {selectedCity === 'all' && (
                    <Badge bg="light" text="dark" className="ms-1">
                      {dashboardStats.totalReservations}
                    </Badge>
                  )}
                </Button>
                {cityConfigs?.map(city => {
                  const cityReservations = reservations?.filter(r => r.cityCode === city.cityCode).length || 0;
                  return (
                    <Button
                      key={city.cityCode}
                      variant={selectedCity === city.cityCode ? 'primary' : 'outline-primary'}
                      size="sm"
                      onClick={() => handleCityChange(city.cityCode)}
                    >
                      {city.cityName}
                      <Badge bg="light" text="dark" className="ms-1">
                        {cityReservations}
                      </Badge>
                    </Button>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">{t('landlord:settings.autoRefresh')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex gap-2">
                {[0, 10000, 30000, 60000].map(interval => (
                  <Button
                    key={interval}
                    variant={refreshInterval === interval ? 'primary' : 'outline-primary'}
                    size="sm"
                    onClick={() => setRefreshInterval(interval)}
                  >
                    {interval === 0 ? t('common:off') : `${interval / 1000}s`}
                  </Button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Dynamic Reservations List */}
      <Row>
        <Col>
          <DynamicReservationsList
            selectedCityCode={selectedCity === 'all' ? undefined : selectedCity}
            onReservationSelect={handleReservationSelect}
            showFilters={true}
          />
        </Col>
      </Row>

      {/* Real-time Status Indicator */}
      <div className="position-fixed bottom-0 end-0 m-3">
        <Badge 
          bg={reservationsLoading ? 'warning' : (reservationsError ? 'danger' : 'success')}
          className="d-flex align-items-center gap-1"
        >
          {reservationsLoading ? (
            <>
              <Spinner animation="border" size="sm" />
              {t('common:syncing')}
            </>
          ) : reservationsError ? (
            <>
              <i className="bi bi-exclamation-triangle"></i>
              {t('common:offline')}
            </>
          ) : (
            <>
              <i className="bi bi-check-circle"></i>
              {t('common:online')}
            </>
          )}
        </Badge>
      </div>
    </Container>
  );
};

export default LandlordDynamicDashboard;
