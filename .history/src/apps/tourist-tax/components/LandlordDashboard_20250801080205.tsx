// Landlord Dashboard - Desktop Management Interface
// Comprehensive dashboard for managing reservations, payments, and generating QR bills

import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Nav, Tab, Badge, Button, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import QRPaymentBillGenerator from './QRPaymentBillGenerator';
import BookingReservationImport from './BookingReservationImport';
import ReservationManager from './ReservationManager';
import { BookingReservation } from '../types/BookingTypes';
import { reservationRepository } from '../repositories/ReservationRepository';

interface DashboardStats {
  totalReservations: number;
  pendingPayments: number;
  completedPayments: number;
  totalTaxCollected: number;
  thisMonthRevenue: number;
}

const LandlordDashboard: React.FC = () => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  const [activeTab, setActiveTab] = useState('overview');
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReservations: 0,
    pendingPayments: 0,
    completedPayments: 0,
    totalTaxCollected: 0,
    thisMonthRevenue: 0
  });

  // Load reservations from IndexedDB
  useEffect(() => {
    loadReservationsFromDB();
  }, []);

  const loadReservationsFromDB = async () => {
    try {
      await reservationRepository.initialize();
      const reservationData = await reservationRepository.findAll();
      setReservations(reservationData);
      calculateStats(reservationData);
    } catch (error) {
      console.error('Error loading reservations from IndexedDB:', error);
    }
  };

  // Calculate dashboard statistics
  const calculateStats = (reservationList: BookingReservation[]) => {
    const confirmed = reservationList.filter(r => r.status === 'confirmed');
    const pending = confirmed.filter(r => r.taxStatus === 'pending');
    const paid = confirmed.filter(r => r.taxStatus === 'paid');

    const totalTax = confirmed.reduce((sum, r) => sum + (r.taxAmount || 0), 0);

    // Calculate this month's revenue
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthReservations = confirmed.filter(r => {
      const checkIn = new Date(r.checkInDate);
      return checkIn.getMonth() === thisMonth && checkIn.getFullYear() === thisYear;
    });
    const thisMonthRevenue = thisMonthReservations.reduce((sum, r) => sum + (r.taxAmount || 0), 0);

    setStats({
      totalReservations: confirmed.length,
      pendingPayments: pending.length,
      completedPayments: paid.length,
      totalTaxCollected: totalTax,
      thisMonthRevenue
    });
  };

  // Handle imported reservations
  const handleReservationsImported = (newReservations: BookingReservation[]) => {
    const updatedReservations = [...reservations, ...newReservations];
    setReservations(updatedReservations);
    calculateStats(updatedReservations);

    // Save to localStorage
    localStorage.setItem('landlord-reservations', JSON.stringify(updatedReservations));

    // Switch to reservations tab
    setActiveTab('reservations');
  };

  // Handle bill generated
  const handleBillGenerated = (billData: any, billUrl: string) => {
    console.log('Bill generated:', billData, billUrl);
    // In a real app, you might save this to a database or send via email
  };

  // Mark payment as completed
  const markPaymentCompleted = (reservationId: string) => {
    const updatedReservations = reservations.map(r =>
      r.id === reservationId ? { ...r, taxStatus: 'paid' as const } : r
    );
    setReservations(updatedReservations);
    calculateStats(updatedReservations);
    localStorage.setItem('landlord-reservations', JSON.stringify(updatedReservations));
  };

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">
            <i className="bi bi-building me-2 text-primary"></i>
            {t('landlord.dashboard', 'Landlord Dashboard')}
          </h2>
          <p className="text-muted mb-0">
            {t('landlord.dashboardSubtitle', 'Manage tourist tax payments for your property')}
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="success" onClick={() => setActiveTab('generate-bill')}>
            <i className="bi bi-qr-code me-2"></i>
            {t('landlord.generateBill', 'Generate QR Bill')}
          </Button>
          <Button variant="outline-primary" onClick={() => setActiveTab('import')}>
            <i className="bi bi-upload me-2"></i>
            {t('landlord.importReservations', 'Import Reservations')}
          </Button>
        </div>
      </div>

      {/* Dashboard Tabs */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'overview')}>
        <Nav variant="tabs" className="mb-4">
          <Nav.Item>
            <Nav.Link eventKey="overview">
              <i className="bi bi-speedometer2 me-2"></i>
              {t('landlord.overview', 'Overview')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reservations">
              <i className="bi bi-calendar-check me-2"></i>
              {t('landlord.reservations', 'Reservations')}
              {stats.totalReservations > 0 && (
                <Badge bg="primary" className="ms-2">{stats.totalReservations}</Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="payments">
              <i className="bi bi-credit-card me-2"></i>
              {t('landlord.payments', 'Payments')}
              {stats.pendingPayments > 0 && (
                <Badge bg="warning" className="ms-2">{stats.pendingPayments}</Badge>
              )}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="generate-bill">
              <i className="bi bi-qr-code me-2"></i>
              {t('landlord.generateBill', 'Generate QR Bill')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="import">
              <i className="bi bi-upload me-2"></i>
              {t('landlord.import', 'Import')}
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="reports">
              <i className="bi bi-graph-up me-2"></i>
              {t('landlord.reports', 'Reports')}
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Tab.Content>
          {/* Overview Tab */}
          <Tab.Pane eventKey="overview">
            <Row>
              {/* Statistics Cards */}
              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 border-primary">
                  <Card.Body className="text-center">
                    <div className="display-6 text-primary mb-2">
                      <i className="bi bi-calendar-check"></i>
                    </div>
                    <h3 className="mb-1">{stats.totalReservations}</h3>
                    <p className="text-muted mb-0">{t('stats.totalReservations', 'Total Reservations')}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 border-warning">
                  <Card.Body className="text-center">
                    <div className="display-6 text-warning mb-2">
                      <i className="bi bi-clock"></i>
                    </div>
                    <h3 className="mb-1">{stats.pendingPayments}</h3>
                    <p className="text-muted mb-0">{t('stats.pendingPayments', 'Pending Payments')}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 border-success">
                  <Card.Body className="text-center">
                    <div className="display-6 text-success mb-2">
                      <i className="bi bi-check-circle"></i>
                    </div>
                    <h3 className="mb-1">{stats.completedPayments}</h3>
                    <p className="text-muted mb-0">{t('stats.completedPayments', 'Completed Payments')}</p>
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={3} md={6} className="mb-4">
                <Card className="h-100 border-info">
                  <Card.Body className="text-center">
                    <div className="display-6 text-info mb-2">
                      <i className="bi bi-currency-exchange"></i>
                    </div>
                    <h3 className="mb-1">{stats.totalTaxCollected.toFixed(2)} zł</h3>
                    <p className="text-muted mb-0">{t('stats.totalTaxCollected', 'Total Tax Collected')}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* Recent Activity */}
            <Row>
              <Col lg={8}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">{t('landlord.recentReservations', 'Recent Reservations')}</h5>
                  </Card.Header>
                  <Card.Body>
                    {reservations.length === 0 ? (
                      <Alert variant="info">
                        <i className="bi bi-info-circle me-2"></i>
                        {t('landlord.noReservations', 'No reservations imported yet. Use the Import tab to get started.')}
                      </Alert>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>{t('fields.guestName')}</th>
                              <th>{t('fields.checkInDate')}</th>
                              <th>{t('fields.numberOfPersons')}</th>
                              <th>{t('stats.taxAmount')}</th>
                              <th>{t('stats.status')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reservations.slice(0, 5).map((reservation) => (
                              <tr key={reservation.id}>
                                <td>
                                  <strong>{reservation.guestName}</strong>
                                  <br />
                                  <small className="text-muted">{reservation.guestCountry}</small>
                                </td>
                                <td>{new Date(reservation.checkInDate).toLocaleDateString()}</td>
                                <td>{reservation.numberOfPersons}</td>
                                <td>
                                  {reservation.taxAmount ? (
                                    <span className="text-success fw-bold">
                                      {reservation.taxAmount.toFixed(2)} zł
                                    </span>
                                  ) : (
                                    <span className="text-muted">-</span>
                                  )}
                                </td>
                                <td>
                                  <Badge bg={reservation.taxStatus === 'paid' ? 'success' : 'warning'}>
                                    {reservation.taxStatus}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </Col>

              <Col lg={4}>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">{t('landlord.quickActions', 'Quick Actions')}</h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button
                        variant="success"
                        onClick={() => setActiveTab('generate-bill')}
                      >
                        <i className="bi bi-qr-code me-2"></i>
                        {t('landlord.generateBill')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => setActiveTab('import')}
                      >
                        <i className="bi bi-upload me-2"></i>
                        {t('landlord.importReservations')}
                      </Button>
                      <Button
                        variant="outline-primary"
                        onClick={() => setActiveTab('reports')}
                      >
                        <i className="bi bi-graph-up me-2"></i>
                        {t('landlord.viewReports')}
                      </Button>
                    </div>

                    <hr />

                    <div className="text-center">
                      <h6 className="text-muted">{t('stats.thisMonth', 'This Month')}</h6>
                      <div className="display-6 text-primary">
                        {stats.thisMonthRevenue.toFixed(2)} zł
                      </div>
                      <small className="text-muted">{t('stats.taxRevenue', 'Tax Revenue')}</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Tab.Pane>

          {/* Reservations Tab */}
          <Tab.Pane eventKey="reservations">
            <Card>
              <Card.Header>
                <h5 className="mb-0">{t('landlord.allReservations', 'All Reservations')}</h5>
              </Card.Header>
              <Card.Body>
                {reservations.length === 0 ? (
                  <Alert variant="info">
                    <i className="bi bi-info-circle me-2"></i>
                    {t('landlord.noReservationsYet', 'No reservations available. Import your Booking.com data to get started.')}
                  </Alert>
                ) : (
                  <div className="table-responsive">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>{t('fields.reservationNumber')}</th>
                          <th>{t('fields.guestName')}</th>
                          <th>{t('fields.checkInDate')}</th>
                          <th>{t('fields.checkOutDate')}</th>
                          <th>{t('fields.numberOfPersons')}</th>
                          <th>{t('stats.taxAmount')}</th>
                          <th>{t('stats.status')}</th>
                          <th>{t('common:actions.actions')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reservations.map((reservation) => (
                          <tr key={reservation.id}>
                            <td>{reservation.reservationNumber}</td>
                            <td>
                              <strong>{reservation.guestName}</strong>
                              <br />
                              <small className="text-muted">{reservation.guestCountry}</small>
                            </td>
                            <td>{new Date(reservation.checkInDate).toLocaleDateString()}</td>
                            <td>{new Date(reservation.checkOutDate).toLocaleDateString()}</td>
                            <td>{reservation.numberOfPersons}</td>
                            <td>
                              {reservation.taxAmount ? (
                                <span className="text-success fw-bold">
                                  {reservation.taxAmount.toFixed(2)} zł
                                </span>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <Badge bg={reservation.taxStatus === 'paid' ? 'success' : 'warning'}>
                                {reservation.taxStatus}
                              </Badge>
                            </td>
                            <td>
                              {reservation.taxStatus === 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline-success"
                                  onClick={() => markPaymentCompleted(reservation.id)}
                                >
                                  <i className="bi bi-check"></i>
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Tab.Pane>

          {/* Payments Tab */}
          <Tab.Pane eventKey="payments">
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              {t('landlord.paymentsInfo', 'Payment tracking and management features coming soon.')}
            </Alert>
          </Tab.Pane>

          {/* Generate Bill Tab */}
          <Tab.Pane eventKey="generate-bill">
            <QRPaymentBillGenerator onBillGenerated={handleBillGenerated} />
          </Tab.Pane>

          {/* Import Tab */}
          <Tab.Pane eventKey="import">
            <BookingReservationImport onReservationsImported={handleReservationsImported} />
          </Tab.Pane>

          {/* Reports Tab */}
          <Tab.Pane eventKey="reports">
            <Alert variant="info">
              <i className="bi bi-info-circle me-2"></i>
              {t('landlord.reportsInfo', 'Detailed reporting and analytics features coming soon.')}
            </Alert>
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>
    </Container>
  );
};

export default LandlordDashboard;
