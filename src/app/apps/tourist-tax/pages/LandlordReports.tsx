import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

/**
 * Landlord Reports Page
 * 
 * Generates and displays various reports for tax compliance and business insights.
 */
const LandlordReports: React.FC = () => {
  const { t } = useTranslation(['common', 'landlord']);
  const [reportType, setReportType] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('2024-01');

  // Mock data for demonstration
  const reportData = {
    summary: {
      totalStays: 15,
      totalRevenue: 540.00,
      totalTax: 180.00,
      averageStayLength: 3.2
    },
    monthlyBreakdown: [
      { month: '2024-01', stays: 15, revenue: 540.00, tax: 180.00 },
      { month: '2023-12', stays: 12, revenue: 432.00, tax: 144.00 },
      { month: '2023-11', stays: 8, revenue: 288.00, tax: 96.00 }
    ]
  };

  const handleGenerateReport = () => {
    // Implementation for report generation
    console.log('Generating report:', { reportType, selectedMonth });
  };

  const handleExportReport = (format: 'pdf' | 'excel') => {
    // Implementation for report export
    console.log('Exporting report as:', format);
  };

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="h3 mb-1">{t('landlord:reports.title', 'Raporty')}</h1>
              <p className="text-muted mb-0">
                {t('landlord:reports.subtitle', 'Analizy i raporty dla celów podatkowych')}
              </p>
            </div>
          </div>
        </Col>
      </Row>

      {/* Report Configuration */}
      <Row className="mb-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">{t('landlord:reports.configuration', 'Konfiguracja raportu')}</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('landlord:reports.type', 'Typ raportu')}</Form.Label>
                    <Form.Select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                    >
                      <option value="monthly">{t('landlord:reports.types.monthly', 'Miesięczny')}</option>
                      <option value="quarterly">{t('landlord:reports.types.quarterly', 'Kwartalny')}</option>
                      <option value="yearly">{t('landlord:reports.types.yearly', 'Roczny')}</option>
                      <option value="custom">{t('landlord:reports.types.custom', 'Niestandardowy')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('landlord:reports.period', 'Okres')}</Form.Label>
                    <Form.Control
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>&nbsp;</Form.Label>
                    <div className="d-grid">
                      <Button variant="primary" onClick={handleGenerateReport}>
                        <i className="bi bi-graph-up me-2"></i>
                        {t('landlord:reports.generate', 'Generuj raport')}
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0">
              <h5 className="mb-0">{t('landlord:reports.quickStats', 'Szybkie statystyki')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">{t('landlord:reports.totalStays', 'Łączne pobyty')}</span>
                <Badge bg="primary">{reportData.summary.totalStays}</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">{t('landlord:reports.totalRevenue', 'Łączny dochód')}</span>
                <Badge bg="success">{reportData.summary.totalRevenue.toFixed(2)} zł</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="text-muted">{t('landlord:reports.totalTax', 'Łączny podatek')}</span>
                <Badge bg="info">{reportData.summary.totalTax.toFixed(2)} zł</Badge>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span className="text-muted">{t('landlord:reports.avgStayLength', 'Średnia długość')}</span>
                <Badge bg="secondary">{reportData.summary.averageStayLength} dni</Badge>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Report Results */}
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <h5 className="mb-0">{t('landlord:reports.results', 'Wyniki raportu')}</h5>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleExportReport('excel')}
                >
                  <i className="bi bi-file-earmark-excel me-1"></i>
                  Excel
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => handleExportReport('pdf')}
                >
                  <i className="bi bi-file-earmark-pdf me-1"></i>
                  PDF
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th>{t('landlord:reports.table.month', 'Miesiąc')}</th>
                    <th>{t('landlord:reports.table.stays', 'Pobyty')}</th>
                    <th>{t('landlord:reports.table.revenue', 'Dochód')}</th>
                    <th>{t('landlord:reports.table.tax', 'Podatek')}</th>
                    <th>{t('landlord:reports.table.actions', 'Akcje')}</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlyBreakdown.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <span className="fw-medium">{row.month}</span>
                      </td>
                      <td>
                        <Badge bg="primary">{row.stays}</Badge>
                      </td>
                      <td>
                        <span className="fw-medium">{row.revenue.toFixed(2)} zł</span>
                      </td>
                      <td>
                        <span className="fw-medium text-success">{row.tax.toFixed(2)} zł</span>
                      </td>
                      <td>
                        <Button variant="outline-primary" size="sm">
                          <i className="bi bi-eye me-1"></i>
                          {t('landlord:reports.viewDetails', 'Szczegóły')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tax Compliance Notice */}
      <Row>
        <Col>
          <Card className="border-warning">
            <Card.Body>
              <div className="d-flex align-items-start">
                <div className="text-warning me-3">
                  <i className="bi bi-exclamation-triangle" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div>
                  <h6 className="mb-1">{t('landlord:reports.compliance.title', 'Informacja o zgodności podatkowej')}</h6>
                  <p className="mb-0 text-muted">
                    {t('landlord:reports.compliance.description', 'Raporty są generowane zgodnie z polskimi przepisami dotyczącymi opłaty miejscowej. Zalecamy regularne składanie raportów do odpowiednich urzędów.')}
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default LandlordReports;
