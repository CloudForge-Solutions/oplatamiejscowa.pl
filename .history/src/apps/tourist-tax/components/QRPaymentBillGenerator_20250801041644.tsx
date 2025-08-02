// QR Payment Bill Generator - Dual Language Support
// Generate payment bills with QR codes for foreign and domestic tourists

import React, { useState, useRef } from 'react';
import { Card, Form, Button, Row, Col, Alert, Spinner, Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface BillData {
  // Guest Information
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestNationality: string;

  // Accommodation Details
  accommodationName: string;
  accommodationAddress: string;
  accommodationType: string;

  // Stay Details
  checkInDate: string;
  checkOutDate: string;
  numberOfPersons: number;
  numberOfNights: number;

  // Tax Calculation
  cityName: string;
  taxRatePerNight: number;
  totalTaxAmount: number;

  // Bill Settings
  billLanguage: 'pl' | 'en' | 'dual';
  includeQRCode: boolean;
  includeInstructions: boolean;
}

interface QRPaymentBillGeneratorProps {
  initialData?: Partial<BillData>;
  onBillGenerated?: (billData: BillData, billUrl: string) => void;
}

const QRPaymentBillGenerator: React.FC<QRPaymentBillGeneratorProps> = ({
  initialData,
  onBillGenerated
}) => {
  const { t, i18n } = useTranslation(['tourist-tax', 'common']);

  const [billData, setBillData] = useState<BillData>({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestNationality: 'PL',
    accommodationName: '',
    accommodationAddress: '',
    accommodationType: 'hotel',
    checkInDate: '',
    checkOutDate: '',
    numberOfPersons: 1,
    numberOfNights: 1,
    cityName: '',
    taxRatePerNight: 0,
    totalTaxAmount: 0,
    billLanguage: 'dual',
    includeQRCode: true,
    includeInstructions: true,
    ...initialData
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [generatedBillUrl, setGeneratedBillUrl] = useState<string>('');
  const billPreviewRef = useRef<HTMLDivElement>(null);

  // Calculate nights automatically
  React.useEffect(() => {
    if (billData.checkInDate && billData.checkOutDate) {
      const checkIn = new Date(billData.checkInDate);
      const checkOut = new Date(billData.checkOutDate);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      const totalAmount = nights * billData.numberOfPersons * billData.taxRatePerNight;

      setBillData(prev => ({
        ...prev,
        numberOfNights: nights > 0 ? nights : 1,
        totalTaxAmount: totalAmount
      }));
    }
  }, [billData.checkInDate, billData.checkOutDate, billData.numberOfPersons, billData.taxRatePerNight]);

  const handleInputChange = (field: keyof BillData, value: any) => {
    setBillData(prev => ({ ...prev, [field]: value }));
  };

  // Generate payment URL for QR code
  const generatePaymentUrl = () => {
    const baseUrl = window.location.origin;
    const paymentParams = new URLSearchParams({
      city: billData.cityName,
      amount: billData.totalTaxAmount.toString(),
      guest: billData.guestName,
      email: billData.guestEmail,
      checkin: billData.checkInDate,
      checkout: billData.checkOutDate,
      persons: billData.numberOfPersons.toString(),
      accommodation: billData.accommodationName,
      lang: billData.guestNationality === 'PL' ? 'pl' : 'en'
    });

    return `${baseUrl}/pay?${paymentParams.toString()}`;
  };

  // Generate PDF bill
  const generatePDF = async () => {
    if (!billPreviewRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(billPreviewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      const fileName = `tourist-tax-bill-${billData.guestName.replace(/\s+/g, '-')}-${Date.now()}.pdf`;
      pdf.save(fileName);

      // Generate blob URL for sharing
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      setGeneratedBillUrl(blobUrl);

      if (onBillGenerated) {
        onBillGenerated(billData, blobUrl);
      }

    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Send bill via email
  const sendBillEmail = async () => {
    if (!generatedBillUrl) {
      await generatePDF();
    }

    // In a real implementation, this would call an API to send the email
    console.log('Sending bill email to:', billData.guestEmail);
    alert(`Bill would be sent to ${billData.guestEmail}`);
  };

  const paymentUrl = generatePaymentUrl();

  return (
    <div>
      <Card className="card-landlord">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="bi bi-qr-code me-2"></i>
            {t('landlord.generateBill', 'Generate Payment Bill with QR Code')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <Form>
            {/* Guest Information */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-person-circle"></i>
                {t('sections.guestInfo', 'Guest Information')}
              </h6>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.guestName', 'Guest Name')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={billData.guestName}
                      onChange={(e) => handleInputChange('guestName', e.target.value)}
                      placeholder="John Doe"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.guestEmail', 'Guest Email')}</Form.Label>
                    <Form.Control
                      type="email"
                      value={billData.guestEmail}
                      onChange={(e) => handleInputChange('guestEmail', e.target.value)}
                      placeholder="guest@example.com"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.guestPhone', 'Guest Phone')}</Form.Label>
                    <Form.Control
                      type="tel"
                      value={billData.guestPhone}
                      onChange={(e) => handleInputChange('guestPhone', e.target.value)}
                      placeholder="+48 123 456 789"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.guestNationality', 'Guest Nationality')}</Form.Label>
                    <Form.Select
                      value={billData.guestNationality}
                      onChange={(e) => handleInputChange('guestNationality', e.target.value)}
                    >
                      <option value="PL">Poland (Polska)</option>
                      <option value="DE">Germany (Deutschland)</option>
                      <option value="GB">United Kingdom</option>
                      <option value="US">United States</option>
                      <option value="FR">France</option>
                      <option value="IT">Italy</option>
                      <option value="ES">Spain</option>
                      <option value="NL">Netherlands</option>
                      <option value="OTHER">Other</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Accommodation Details */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-building"></i>
                {t('sections.accommodationDetails', 'Accommodation Details')}
              </h6>

              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.accommodationName')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={billData.accommodationName}
                      onChange={(e) => handleInputChange('accommodationName', e.target.value)}
                      placeholder="Hotel Krakow Plaza"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.accommodationType')}</Form.Label>
                    <Form.Select
                      value={billData.accommodationType}
                      onChange={(e) => handleInputChange('accommodationType', e.target.value)}
                    >
                      <option value="hotel">{t('accommodationTypes.hotel')}</option>
                      <option value="apartment">{t('accommodationTypes.apartment')}</option>
                      <option value="hostel">{t('accommodationTypes.hostel')}</option>
                      <option value="camping">{t('accommodationTypes.camping')}</option>
                      <option value="other">{t('accommodationTypes.other')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>{t('fields.accommodationAddress')}</Form.Label>
                <Form.Control
                  type="text"
                  value={billData.accommodationAddress}
                  onChange={(e) => handleInputChange('accommodationAddress', e.target.value)}
                  placeholder="ul. Floriańska 1, 31-019 Kraków"
                />
              </Form.Group>
            </div>

            {/* Stay Details */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-calendar-check"></i>
                {t('sections.stayDetails')}
              </h6>

              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.checkInDate')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={billData.checkInDate}
                      onChange={(e) => handleInputChange('checkInDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.checkOutDate')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={billData.checkOutDate}
                      onChange={(e) => handleInputChange('checkOutDate', e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.numberOfPersons')}</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={billData.numberOfPersons}
                      onChange={(e) => handleInputChange('numberOfPersons', parseInt(e.target.value) || 1)}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.numberOfNights', 'Nights')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={billData.numberOfNights}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Tax Calculation */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-calculator"></i>
                {t('sections.taxCalculation', 'Tax Calculation')}
              </h6>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.cityName', 'City')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={billData.cityName}
                      onChange={(e) => handleInputChange('cityName', e.target.value)}
                      placeholder="Kraków"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.taxRatePerNight', 'Rate per Night (PLN)')}</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={billData.taxRatePerNight}
                      onChange={(e) => handleInputChange('taxRatePerNight', parseFloat(e.target.value) || 0)}
                      placeholder="2.50"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.totalAmount', 'Total Amount (PLN)')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={`${billData.totalTaxAmount.toFixed(2)} zł`}
                      readOnly
                      className="bg-light fw-bold text-primary"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Bill Settings */}
            <div className="form-section">
              <h6 className="section-title">
                <i className="bi bi-gear"></i>
                {t('sections.billSettings', 'Bill Settings')}
              </h6>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('fields.billLanguage', 'Bill Language')}</Form.Label>
                    <Form.Select
                      value={billData.billLanguage}
                      onChange={(e) => handleInputChange('billLanguage', e.target.value)}
                    >
                      <option value="pl">Polish Only</option>
                      <option value="en">English Only</option>
                      <option value="dual">Dual Language (PL/EN)</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="includeQRCode"
                      label={t('fields.includeQRCode', 'Include QR Code')}
                      checked={billData.includeQRCode}
                      onChange={(e) => handleInputChange('includeQRCode', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Check
                      type="checkbox"
                      id="includeInstructions"
                      label={t('fields.includeInstructions', 'Include Payment Instructions')}
                      checked={billData.includeInstructions}
                      onChange={(e) => handleInputChange('includeInstructions', e.target.checked)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>
          </Form>

          {/* Action Buttons */}
          <div className="d-flex gap-2 flex-wrap">
            <Button
              variant="primary"
              onClick={() => setShowPreview(true)}
              disabled={!billData.guestName || !billData.totalTaxAmount}
            >
              <i className="bi bi-eye me-2"></i>
              {t('actions.preview', 'Preview Bill')}
            </Button>

            <Button
              variant="success"
              onClick={generatePDF}
              disabled={isGenerating || !billData.guestName || !billData.totalTaxAmount}
            >
              {isGenerating ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t('actions.generating', 'Generating...')}
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  {t('actions.downloadPDF', 'Download PDF')}
                </>
              )}
            </Button>

            <Button
              variant="outline-primary"
              onClick={sendBillEmail}
              disabled={!billData.guestEmail || !billData.guestName}
            >
              <i className="bi bi-envelope me-2"></i>
              {t('actions.sendEmail', 'Send Email')}
            </Button>
          </div>

          {/* QR Code Preview */}
          {billData.includeQRCode && billData.totalTaxAmount > 0 && (
            <Alert variant="info" className="mt-4">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <QRCode value={paymentUrl} size={80} />
                </div>
                <div>
                  <strong>{t('qr.paymentLink', 'Payment Link:')}</strong>
                  <br />
                  <small className="text-muted">{paymentUrl}</small>
                </div>
              </div>
            </Alert>
          )}
        </Card.Body>
      </Card>

      {/* Bill Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {t('modal.billPreview', 'Bill Preview')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div ref={billPreviewRef} className="p-4 bg-white">
            {/* Bill content will be rendered here */}
            <BillPreview billData={billData} paymentUrl={paymentUrl} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            {t('common:actions.close')}
          </Button>
          <Button variant="primary" onClick={generatePDF}>
            <i className="bi bi-download me-2"></i>
            {t('actions.downloadPDF')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

// Bill Preview Component
const BillPreview: React.FC<{ billData: BillData; paymentUrl: string }> = ({ billData, paymentUrl }) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  return (
    <div className="bill-preview">
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-primary">
          {billData.billLanguage === 'en' ? 'Tourist Tax Payment Bill' : 'Rachunek Opłaty Miejscowej'}
        </h3>
        {billData.billLanguage === 'dual' && (
          <h4 className="text-muted">Tourist Tax Payment Bill</h4>
        )}
        <hr />
      </div>

      {/* Guest Information */}
      <div className="mb-4">
        <h6 className="text-primary">
          {billData.billLanguage === 'en' ? 'Guest Information' : 'Dane Gościa'}
          {billData.billLanguage === 'dual' && <span className="text-muted"> / Guest Information</span>}
        </h6>
        <p><strong>{billData.billLanguage === 'en' ? 'Name' : 'Imię i nazwisko'}:</strong> {billData.guestName}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Email' : 'Email'}:</strong> {billData.guestEmail}</p>
        {billData.guestPhone && (
          <p><strong>{billData.billLanguage === 'en' ? 'Phone' : 'Telefon'}:</strong> {billData.guestPhone}</p>
        )}
      </div>

      {/* Stay Details */}
      <div className="mb-4">
        <h6 className="text-primary">
          {billData.billLanguage === 'en' ? 'Stay Details' : 'Szczegóły Pobytu'}
          {billData.billLanguage === 'dual' && <span className="text-muted"> / Stay Details</span>}
        </h6>
        <p><strong>{billData.billLanguage === 'en' ? 'Accommodation' : 'Obiekt'}:</strong> {billData.accommodationName}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Address' : 'Adres'}:</strong> {billData.accommodationAddress}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Check-in' : 'Zameldowanie'}:</strong> {new Date(billData.checkInDate).toLocaleDateString()}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Check-out' : 'Wymeldowanie'}:</strong> {new Date(billData.checkOutDate).toLocaleDateString()}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Persons' : 'Liczba osób'}:</strong> {billData.numberOfPersons}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Nights' : 'Liczba nocy'}:</strong> {billData.numberOfNights}</p>
      </div>

      {/* Tax Calculation */}
      <div className="mb-4">
        <h6 className="text-primary">
          {billData.billLanguage === 'en' ? 'Tax Calculation' : 'Kalkulacja Opłaty'}
          {billData.billLanguage === 'dual' && <span className="text-muted"> / Tax Calculation</span>}
        </h6>
        <p><strong>{billData.billLanguage === 'en' ? 'City' : 'Miasto'}:</strong> {billData.cityName}</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Rate per night' : 'Stawka za noc'}:</strong> {billData.taxRatePerNight.toFixed(2)} zł</p>
        <p><strong>{billData.billLanguage === 'en' ? 'Total Amount' : 'Kwota do zapłaty'}:</strong> <span className="fs-5 text-success">{billData.totalTaxAmount.toFixed(2)} zł</span></p>
      </div>

      {/* QR Code */}
      {billData.includeQRCode && (
        <div className="text-center mb-4">
          <h6 className="text-primary">
            {billData.billLanguage === 'en' ? 'Pay Online' : 'Zapłać Online'}
            {billData.billLanguage === 'dual' && <span className="text-muted"> / Pay Online</span>}
          </h6>
          <QRCode value={paymentUrl} size={150} />
          <p className="small text-muted mt-2">
            {billData.billLanguage === 'en'
              ? 'Scan QR code to pay online'
              : 'Zeskanuj kod QR aby zapłacić online'}
            {billData.billLanguage === 'dual' && <br />}
            {billData.billLanguage === 'dual' && 'Scan QR code to pay online'}
          </p>
        </div>
      )}

      {/* Instructions */}
      {billData.includeInstructions && (
        <div className="mt-4 p-3 bg-light rounded">
          <h6 className="text-primary">
            {billData.billLanguage === 'en' ? 'Payment Instructions' : 'Instrukcje Płatności'}
            {billData.billLanguage === 'dual' && <span className="text-muted"> / Payment Instructions</span>}
          </h6>
          <ul className="small">
            <li>
              {billData.billLanguage === 'en'
                ? 'Scan the QR code with your phone camera or QR code app'
                : 'Zeskanuj kod QR aparatem telefonu lub aplikacją do kodów QR'}
              {billData.billLanguage === 'dual' && <br />}
              {billData.billLanguage === 'dual' && 'Scan the QR code with your phone camera or QR code app'}
            </li>
            <li>
              {billData.billLanguage === 'en'
                ? 'Complete the payment form with your details'
                : 'Wypełnij formularz płatności swoimi danymi'}
              {billData.billLanguage === 'dual' && <br />}
              {billData.billLanguage === 'dual' && 'Complete the payment form with your details'}
            </li>
            <li>
              {billData.billLanguage === 'en'
                ? 'Pay securely using card, BLIK, or bank transfer'
                : 'Zapłać bezpiecznie kartą, BLIK-iem lub przelewem'}
              {billData.billLanguage === 'dual' && <br />}
              {billData.billLanguage === 'dual' && 'Pay securely using card, BLIK, or bank transfer'}
            </li>
            <li>
              {billData.billLanguage === 'en'
                ? 'You will receive a receipt via email'
                : 'Otrzymasz potwierdzenie płatności na email'}
              {billData.billLanguage === 'dual' && <br />}
              {billData.billLanguage === 'dual' && 'You will receive a receipt via email'}
            </li>
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="text-center mt-4 pt-3 border-top">
        <small className="text-muted">
          {billData.billLanguage === 'en'
            ? 'Generated by Tourist Tax Payment System'
            : 'Wygenerowano przez System Płatności Opłaty Miejscowej'}
          {billData.billLanguage === 'dual' && <br />}
          {billData.billLanguage === 'dual' && 'Generated by Tourist Tax Payment System'}
          <br />
          {new Date().toLocaleString()}
        </small>
      </div>
    </div>
  );
};

export default QRPaymentBillGenerator;
