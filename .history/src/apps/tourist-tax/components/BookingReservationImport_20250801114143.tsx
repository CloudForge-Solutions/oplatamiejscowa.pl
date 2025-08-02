// Booking.com Reservation Import Component
// Parse and import reservation data from Booking.com Excel exports

import React, { useState, useCallback, useEffect } from 'react';
import { Card, Form, Button, Table, Alert, Badge, ProgressBar, Modal, Row, Col, Dropdown, ButtonGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { BookingReservation, ImportStats } from '../types/BookingTypes';
import { CityTaxRate } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';
import { reservationRepository } from '../repositories/ReservationRepository';

// Centralized Logger (inspired by mVAT patterns)
class Logger {
  private static instance: Logger;

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  info(message: string, data?: any): void {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, data || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, error || '');
  }

  debug(message: string, data?: any): void {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, data || '');
    }
  }
}

const logger = Logger.getInstance();

interface BookingReservationImportProps {
  onReservationsImported?: (reservations: BookingReservation[]) => void;
  cityTaxRate?: number;
}

const BookingReservationImport: React.FC<BookingReservationImportProps> = ({
  onReservationsImported,
  cityTaxRate = 2.50
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  const [file, setFile] = useState<File | null>(null);
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importStats, setImportStats] = useState<ImportStats>({ total: 0, imported: 0, skipped: 0, errors: 0 });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedReservations, setSelectedReservations] = useState<Set<string>>(new Set());
  const [selectedCity, setSelectedCity] = useState<CityTaxRate | null>(null);
  const [cities, setCities] = useState<CityTaxRate[]>([]);
  const [showBulkTaxModal, setShowBulkTaxModal] = useState(false);
  const [bulkTaxRate, setBulkTaxRate] = useState<number>(0);

  // Load cities and initialize repository on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        // Initialize repository
        await reservationRepository.initialize();

        // Load cities
        const response = await TaxCalculationService.getAvailableCities();
        if (response.success && response.data) {
          setCities(response.data);
          // Set default city (Kraków)
          const defaultCity = response.data.find(city => city.cityCode === 'KRK');
          if (defaultCity) {
            setSelectedCity(defaultCity);
            setBulkTaxRate(defaultCity.taxRatePerNight);
          }
        }
      } catch (error) {
        logger.error('Error initializing component', error);
      }
    };

    initializeComponent();
  }, []);

  // Parse Booking.com Excel file
  const parseBookingFile = useCallback((file: File): Promise<BookingReservation[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Skip header row and parse data
          const reservations: BookingReservation[] = [];
          const errors: string[] = [];

          // Log header row for debugging
          if (jsonData.length > 0) {
            logger.info('Excel file header row', { headers: jsonData[0] });
          }

          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i] as any[];

            try {
              // Skip empty rows
              if (!row || row.length === 0 || !row.some(cell => cell !== null && cell !== undefined && cell !== '')) {
                logger.debug(`Skipping empty row ${i + 1}`);
                continue;
              }

              // Log first few rows for debugging
              if (i <= 3) {
                logger.info(`Sample row ${i + 1}`, { row });
              }

              // Map Booking.com columns to our structure
              // Based on actual Booking.com export format
              const reservation: BookingReservation = {
                id: `booking_${i}`,
                reservationNumber: row[0] || `RES_${i}`, // Column 0: Numer rezerwacji
                guestName: row[2] || '',  // Column 2: Imię i nazwisko gości(a)
                guestEmail: '', // Not available in export
                guestPhone: row[26] || '', // Column 26: Numer telefonu
                guestCountry: row[19] || 'PL', // Column 19: Booker country
                checkInDate: parseBookingDate(row[3]), // Column 3: Zameldowanie
                checkOutDate: parseBookingDate(row[4]), // Column 4: Wymeldowanie
                numberOfPersons: parsePositiveInteger(row[8], 1), // Column 8: Osoby
                numberOfNights: parsePositiveInteger(row[23], 0), // Column 23: Czas trwania (noce)
                accommodationName: row[22] || '', // Column 22: Rodzaj opcji zakwaterowania (property name)
                accommodationAddress: '', // Not available - Column 25 is guest address, not property address
                status: parseBookingStatus(row[6]), // Column 6: Status
                totalPrice: parseFloat(row[12]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0, // Column 12: Cena
                commission: parseFloat(row[14]?.replace(/[^\d.,]/g, '').replace(',', '.')) || 0, // Column 14: Kwota prowizji
                paymentStatus: row[15] || 'pending', // Column 15: Status płatności
                bookingDate: parseBookingDate(row[5]), // Column 5: Zarezerwowano dnia
                specialRequests: row[17] || '', // Column 17: Uwagi
                taxStatus: 'pending'
              };

              // Calculate nights if not provided in file
              if (reservation.numberOfNights === 0 && reservation.checkInDate && reservation.checkOutDate) {
                const checkIn = new Date(reservation.checkInDate);
                const checkOut = new Date(reservation.checkOutDate);
                reservation.numberOfNights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
              }

              // Calculate tax amount using date-based rates if city is selected
              if (reservation.status === 'confirmed' && reservation.numberOfNights > 0 && reservation.checkInDate) {
                let taxRate = cityTaxRate; // fallback rate

                if (selectedCity) {
                  // Get date-specific rate for the check-in date
                  const dateBasedRate = TaxCalculationService.getTaxRateForDate(selectedCity.cityCode, reservation.checkInDate);
                  taxRate = dateBasedRate?.taxRatePerNight || selectedCity.taxRatePerNight;
                }

                reservation.taxAmount = reservation.numberOfNights * reservation.numberOfPersons * taxRate;
              }

              // Only include valid reservations
              if (reservation.guestName && reservation.checkInDate && reservation.checkOutDate) {
                reservations.push(reservation);
              } else {
                errors.push(`Row ${i + 1}: Missing required data (guest name, dates)`);
              }

            } catch (error) {
              const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Parse error'}`;
              errors.push(errorMessage);
              logger.error('Error parsing reservation row', {
                row: i + 1,
                error: error instanceof Error ? error.message : error,
                rowData: row
              });
            }
          }

          setErrors(errors);
          resolve(reservations);

        } catch (error) {
          logger.error('Error parsing Excel file', error);
          reject(error);
        }
      };

      reader.onerror = () => {
        const error = new Error('Failed to read file');
        logger.error('FileReader error', error);
        reject(error);
      };
      reader.readAsArrayBuffer(file);
    });
  }, [cityTaxRate]);

  // Parse positive integer with fallback
  const parsePositiveInteger = (value: any, fallback: number): number => {
    if (!value) return fallback;

    try {
      const parsed = parseInt(value);
      if (isNaN(parsed) || parsed < 0) {
        logger.debug('Invalid integer value, using fallback', { value, fallback });
        return fallback;
      }
      return parsed;
    } catch (error) {
      logger.error('Error parsing integer', { value, error });
      return fallback;
    }
  };

  // Parse Booking.com date format
  const parseBookingDate = (dateValue: any): string => {
    if (!dateValue) return '';

    try {
      // Handle Excel date serial numbers
      if (typeof dateValue === 'number') {
        const date = XLSX.SSF.parse_date_code(dateValue);
        return `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      }

      // Handle string dates
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }

      return '';
    } catch {
      return '';
    }
  };

  // Parse Booking.com status with proper type checking
  const parseBookingStatus = (status: any): BookingReservation['status'] => {
    if (!status || typeof status !== 'string') {
      logger.debug('Invalid status value, defaulting to pending', { status, type: typeof status });
      return 'pending';
    }

    try {
      const statusLower = status.toLowerCase();
      if (statusLower.includes('ok') || statusLower.includes('confirmed')) return 'confirmed';
      if (statusLower.includes('cancelled')) return 'cancelled';
      if (statusLower.includes('no_show')) return 'no_show';
      return 'pending';
    } catch (error) {
      logger.error('Error parsing booking status', { status, error });
      return 'pending';
    }
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setReservations([]);
      setErrors([]);
      setImportStats({ total: 0, imported: 0, skipped: 0, errors: 0 });
    }
  };

  // Process the file
  const processFile = async () => {
    if (!file) {
      logger.warn('No file selected for processing');
      return;
    }

    logger.info('Starting file processing', { fileName: file.name, fileSize: file.size });
    setIsProcessing(true);

    try {
      const parsedReservations = await parseBookingFile(file);
      setReservations(parsedReservations);

      const stats: ImportStats = {
        total: parsedReservations.length,
        imported: parsedReservations.filter(r => r.status === 'confirmed').length,
        skipped: parsedReservations.filter(r => r.status !== 'confirmed').length,
        errors: errors.length
      };
      setImportStats(stats);

      logger.info('File processing completed', stats);

      // Auto-select confirmed reservations
      const confirmedIds = new Set(
        parsedReservations
          .filter(r => r.status === 'confirmed')
          .map(r => r.id)
      );
      setSelectedReservations(confirmedIds);

      setShowPreview(true);

    } catch (error) {
      const errorMessage = `File processing error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      logger.error('File processing failed', { error, fileName: file.name });
      setErrors([errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle reservation selection
  const toggleReservationSelection = (reservationId: string) => {
    const newSelection = new Set(selectedReservations);
    if (newSelection.has(reservationId)) {
      newSelection.delete(reservationId);
    } else {
      newSelection.add(reservationId);
    }
    setSelectedReservations(newSelection);
  };

  // Select all/none
  const selectAll = () => {
    const allIds = new Set(reservations.map(r => r.id));
    setSelectedReservations(allIds);
  };

  const selectNone = () => {
    setSelectedReservations(new Set());
  };

  // Handle city selection
  const handleCitySelect = (city: CityTaxRate) => {
    setSelectedCity(city);
    setBulkTaxRate(city.taxRatePerNight);

    // Recalculate tax for all reservations using date-based rates
    const updatedReservations = reservations.map(reservation => {
      if (reservation.status === 'confirmed' && reservation.numberOfNights > 0 && reservation.checkInDate) {
        // Get the tax rate for the specific check-in date
        const dateBasedRate = TaxCalculationService.getTaxRateForDate(city.cityCode, reservation.checkInDate);
        const taxRate = dateBasedRate?.taxRatePerNight || city.taxRatePerNight;

        return {
          ...reservation,
          taxAmount: reservation.numberOfNights * reservation.numberOfPersons * taxRate
        };
      }
      return reservation;
    });

    setReservations(updatedReservations);
    logger.info('City selected, tax rates updated with date-based calculation', {
      cityCode: city.cityCode,
      baseTaxRate: city.taxRatePerNight,
      updatedCount: updatedReservations.filter(r => r.taxAmount).length
    });
  };

  // Apply bulk tax rate to selected reservations
  const applyBulkTaxRate = () => {
    const updatedReservations = reservations.map(reservation => {
      if (selectedReservations.has(reservation.id) && reservation.numberOfNights > 0) {
        return {
          ...reservation,
          taxAmount: reservation.numberOfNights * reservation.numberOfPersons * bulkTaxRate
        };
      }
      return reservation;
    });

    setReservations(updatedReservations);
    setShowBulkTaxModal(false);

    logger.info('Bulk tax rate applied', {
      taxRate: bulkTaxRate,
      selectedCount: selectedReservations.size,
      updatedReservations: selectedReservations.size
    });
  };

  // Import selected reservations
  const importSelected = async () => {
    const selectedReservationData = reservations.filter(r => selectedReservations.has(r.id));

    if (selectedReservationData.length === 0) {
      logger.warn('No reservations selected for import');
      return;
    }

    if (!selectedCity) {
      setErrors(prev => [...prev, t('import.noCitySelected', 'Please select a city before importing')]);
      return;
    }

    try {
      setIsProcessing(true);

      // Add city information to all selected reservations
      const reservationsWithCity = selectedReservationData.map(reservation => ({
        ...reservation,
        cityCode: selectedCity.cityCode,
        cityName: selectedCity.cityName,
        accommodationAddress: reservation.accommodationAddress || selectedCity.cityName
      }));

      logger.info('Importing selected reservations to IndexedDB', {
        count: reservationsWithCity.length,
        cityCode: selectedCity.cityCode,
        cityName: selectedCity.cityName,
        reservationIds: reservationsWithCity.map(r => r.id)
      });

      // Save reservations to IndexedDB
      await reservationRepository.saveMany(reservationsWithCity);

      // Update import stats
      setImportStats(prev => ({
        ...prev,
        imported: selectedReservationData.length
      }));

      logger.info('✅ Reservations successfully saved to IndexedDB', {
        count: selectedReservationData.length
      });

      // Call the parent callback with selected reservations (including city info)
      if (onReservationsImported) {
        onReservationsImported(reservationsWithCity);
      }

      setShowPreview(false);

      // Reset state after successful import
      setFile(null);
      setReservations([]);
      setSelectedReservations(new Set());
      setImportStats({ total: 0, imported: 0, skipped: 0, errors: 0 });
      setErrors([]);

      // Show success feedback
      logger.info(`Successfully imported ${selectedReservationData.length} reservations`);

    } catch (error) {
      logger.error('❌ Failed to save reservations to IndexedDB', error);
      setErrors(prev => [...prev, `Failed to save reservations: ${error.message}`]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Get status badge variant
  const getStatusVariant = (status: BookingReservation['status']) => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'cancelled': return 'danger';
      case 'no_show': return 'warning';
      default: return 'secondary';
    }
  };

  return (
    <div>
      <Card className="card-landlord">
        <Card.Header>
          <Card.Title className="mb-0">
            <i className="bi bi-upload me-2"></i>
            {t('landlord.importReservations', 'Import Booking.com Reservations')}
          </Card.Title>
        </Card.Header>
        <Card.Body>
          {/* File Upload */}
          <Form.Group className="mb-4">
            <Form.Label>
              {t('import.selectFile', 'Select Booking.com Excel File')}
            </Form.Label>
            <Form.Control
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="mb-2"
            />
            <Form.Text className="text-muted">
              {t('import.fileFormat', 'Supported formats: .xlsx, .xls (Booking.com export format)')}
            </Form.Text>
          </Form.Group>

          {/* File Info */}
          {file && (
            <Alert variant="info" className="mb-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{t('import.selectedFile', 'Selected File:')}</strong> {file.name}
                  <br />
                  <small className="text-muted">
                    {t('import.fileSize', 'Size')}: {(file.size / 1024).toFixed(1)} KB
                  </small>
                </div>
                <Button
                  variant="primary"
                  onClick={processFile}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      {t('import.processing', 'Processing...')}
                    </>
                  ) : (
                    <>
                      <i className="bi bi-gear me-2"></i>
                      {t('import.process', 'Process File')}
                    </>
                  )}
                </Button>
              </div>
            </Alert>
          )}

          {/* Processing Progress */}
          {isProcessing && (
            <div className="mb-4">
              <ProgressBar animated now={100} variant="primary" />
              <small className="text-muted">
                {t('import.processingFile', 'Processing file and parsing reservations...')}
              </small>
            </div>
          )}

          {/* Import Stats */}
          {importStats.total > 0 && (
            <Alert variant="success" className="mb-4">
              <h6>{t('import.importStats', 'Import Statistics')}</h6>
              <div className="row">
                <div className="col-sm-3">
                  <strong>{importStats.total}</strong><br />
                  <small>{t('import.totalRows', 'Total Rows')}</small>
                </div>
                <div className="col-sm-3">
                  <strong className="text-success">{importStats.imported}</strong><br />
                  <small>{t('import.confirmed', 'Confirmed')}</small>
                </div>
                <div className="col-sm-3">
                  <strong className="text-warning">{importStats.skipped}</strong><br />
                  <small>{t('import.skipped', 'Skipped')}</small>
                </div>
                <div className="col-sm-3">
                  <strong className="text-danger">{importStats.errors}</strong><br />
                  <small>{t('import.errors', 'Errors')}</small>
                </div>
              </div>
            </Alert>
          )}

          {/* Errors */}
          {errors.length > 0 && (
            <Alert variant="warning" className="mb-4">
              <h6>{t('import.parseErrors', 'Parse Errors')}</h6>
              <ul className="mb-0 small">
                {errors.slice(0, 10).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
                {errors.length > 10 && (
                  <li><em>...and {errors.length - 10} more errors</em></li>
                )}
              </ul>
            </Alert>
          )}

          {/* Instructions */}
          <Alert variant="info">
            <h6>{t('import.instructions', 'Instructions')}</h6>
            <ol className="mb-0 small">
              <li>{t('import.step1', 'Export your reservations from Booking.com as Excel file')}</li>
              <li>{t('import.step2', 'Select the exported file using the file picker above')}</li>
              <li>{t('import.step3', 'Click "Process File" to parse the reservations')}</li>
              <li>{t('import.step4', 'Review and select which reservations to import')}</li>
              <li>{t('import.step5', 'Tourist tax will be automatically calculated for each guest')}</li>
            </ol>
          </Alert>
        </Card.Body>
      </Card>

      {/* Preview Modal */}
      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>
            {t('import.previewTitle', 'Preview Reservations')} ({reservations.length})
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {/* City Selection and Tax Rate Controls */}
          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('fields.city')} *</Form.Label>
                <Form.Select
                  value={selectedCity?.cityCode || ''}
                  onChange={(e) => {
                    const city = cities.find(c => c.cityCode === e.target.value);
                    if (city) handleCitySelect(city);
                  }}
                >
                  <option value="">{t('cities.selectCity')}</option>
                  {cities.map(city => (
                    <option key={city.cityCode} value={city.cityCode}>
                      {city.cityName} - {TaxCalculationService.formatCurrency(city.taxRatePerNight)}/noc
                    </option>
                  ))}
                </Form.Select>
                {selectedCity && (
                  <Form.Text className="text-muted">
                    {t('cities.taxRate')}: <strong>{TaxCalculationService.formatCurrency(selectedCity.taxRatePerNight)}</strong> za noc
                  </Form.Text>
                )}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>{t('import.bulkActions', 'Bulk Actions')}</Form.Label>
                <div className="d-flex gap-2">
                  <Dropdown as={ButtonGroup}>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      disabled={selectedReservations.size === 0}
                      onClick={() => setShowBulkTaxModal(true)}
                    >
                      <i className="bi bi-calculator me-1"></i>
                      {t('import.changeTaxRate', 'Change Tax Rate')}
                    </Button>
                    <Dropdown.Toggle
                      split
                      variant="outline-primary"
                      size="sm"
                      disabled={selectedReservations.size === 0}
                    />
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={() => setShowBulkTaxModal(true)}>
                        <i className="bi bi-calculator me-2"></i>
                        {t('import.customTaxRate', 'Custom Tax Rate')}
                      </Dropdown.Item>
                      <Dropdown.Item
                        onClick={() => {
                          if (selectedCity) {
                            setBulkTaxRate(selectedCity.taxRatePerNight);
                            applyBulkTaxRate();
                          }
                        }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>
                        {t('import.resetToCity', 'Reset to City Rate')}
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
                <Form.Text className="text-muted">
                  {selectedReservations.size} {t('import.reservationsSelected', 'reservations selected')}
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>

          {/* Selection Controls */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <Button variant="outline-primary" size="sm" onClick={selectAll} className="me-2">
                {t('import.selectAll', 'Select All')}
              </Button>
              <Button variant="outline-secondary" size="sm" onClick={selectNone}>
                {t('import.selectNone', 'Select None')}
              </Button>
            </div>
            <div>
              <Badge bg="primary">{selectedReservations.size} selected</Badge>
            </div>
          </div>

          {/* Reservations Table */}
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th width="40">
                  <Form.Check
                    type="checkbox"
                    checked={selectedReservations.size === reservations.length && reservations.length > 0}
                    onChange={selectedReservations.size === reservations.length ? selectNone : selectAll}
                  />
                </th>
                <th>{t('fields.guestName')}</th>
                <th>{t('fields.checkInDate')}</th>
                <th>{t('fields.checkOutDate')}</th>
                <th>{t('fields.numberOfPersons')}</th>
                <th>{t('fields.numberOfNights')}</th>
                <th>{t('import.status')}</th>
                <th>{t('import.taxRate', 'Tax Rate')}</th>
                <th>{t('import.taxAmount')}</th>
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
                    {selectedCity && reservation.checkInDate ? (() => {
                      const dateBasedRate = TaxCalculationService.getTaxRateForDate(selectedCity.cityCode, reservation.checkInDate);
                      const effectiveRate = dateBasedRate?.taxRatePerNight || selectedCity.taxRatePerNight;
                      const isDateSpecific = dateBasedRate && dateBasedRate.taxRatePerNight !== selectedCity.taxRatePerNight;

                      return (
                        <span className={isDateSpecific ? "text-warning" : "text-muted"}>
                          {TaxCalculationService.formatCurrency(effectiveRate)}
                          {isDateSpecific && (
                            <small className="d-block">
                              <i className="bi bi-calendar-event me-1"></i>
                              {new Date(reservation.checkInDate).getFullYear()}
                            </small>
                          )}
                        </span>
                      );
                    })() : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                  <td>
                    {reservation.taxAmount ? (
                      <strong className="text-success">{reservation.taxAmount.toFixed(2)} zł</strong>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPreview(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={importSelected}
            disabled={selectedReservations.size === 0}
          >
            <i className="bi bi-download me-2"></i>
            {t('import.importSelected', 'Import Selected')} ({selectedReservations.size})
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Bulk Tax Rate Change Modal */}
      <Modal show={showBulkTaxModal} onHide={() => setShowBulkTaxModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bi bi-calculator me-2"></i>
            {t('import.changeTaxRate', 'Change Tax Rate')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>{t('import.newTaxRate', 'New Tax Rate (PLN per night)')}</Form.Label>
            <Form.Control
              type="number"
              step="0.01"
              min="0"
              max="50"
              value={bulkTaxRate}
              onChange={(e) => setBulkTaxRate(parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Form.Text className="text-muted">
              {t('import.taxRateHelp', 'This rate will be applied to all selected reservations')}
            </Form.Text>
          </Form.Group>

          <Alert variant="info" className="mb-3">
            <div className="d-flex justify-content-between">
              <span>{t('import.selectedReservations', 'Selected reservations')}:</span>
              <strong>{selectedReservations.size}</strong>
            </div>
            {selectedCity && (
              <div className="d-flex justify-content-between">
                <span>{t('import.currentCityRate', 'Current city rate')}:</span>
                <strong>{TaxCalculationService.formatCurrency(selectedCity.taxRatePerNight)}</strong>
              </div>
            )}
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBulkTaxModal(false)}>
            {t('common:actions.cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={applyBulkTaxRate}
            disabled={bulkTaxRate <= 0}
          >
            <i className="bi bi-check-lg me-2"></i>
            {t('import.applyRate', 'Apply Rate')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookingReservationImport;
