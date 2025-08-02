// File Upload Modal Component
// Handles drag-and-drop file upload for Booking.com Excel files

import React, { useState, useCallback, useRef } from 'react';
import { Modal, Form, Button, Alert, ProgressBar } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import * as XLSX from 'xlsx';
import { BookingReservation } from '../types/BookingTypes';

interface FileUploadModalProps {
  show: boolean;
  onHide: () => void;
  onFileProcessed: (reservations: BookingReservation[]) => void;
}

const FileUploadModal: React.FC<FileUploadModalProps> = ({
  show,
  onHide,
  onFileProcessed
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);
  
  // State
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal closes
  const handleClose = useCallback(() => {
    setFile(null);
    setIsProcessing(false);
    setErrors([]);
    setIsDragOver(false);
    onHide();
  }, [onHide]);

  // File selection handler
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setErrors([]);
    }
  }, []);

  // Drag and drop handlers
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
        setFile(file);
        setErrors([]);
      } else {
        setErrors([t('import.invalidFileType', 'Please select an Excel file (.xlsx or .xls)')]);
      }
    }
  }, [t]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  // Parse Booking.com date format
  const parseBookingDate = (dateValue: any): string => {
    if (!dateValue) return '';
    
    try {
      if (typeof dateValue === 'number') {
        // Excel date serial number
        const date = new Date((dateValue - 25569) * 86400 * 1000);
        return date.toISOString().split('T')[0];
      }
      
      if (typeof dateValue === 'string') {
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0];
        }
      }
      
      return '';
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  };

  // Parse positive integer with fallback
  const parsePositiveInteger = (value: any, fallback: number = 0): number => {
    const parsed = parseInt(String(value || ''), 10);
    return isNaN(parsed) || parsed < 0 ? fallback : parsed;
  };

  // Parse booking status
  const parseBookingStatus = (status: string): 'confirmed' | 'cancelled' | 'no_show' | 'pending' => {
    if (!status) return 'pending';
    
    const statusLower = status.toLowerCase();
    if (statusLower === 'ok' || statusLower === 'confirmed') return 'confirmed';
    if (statusLower.includes('cancel')) return 'cancelled';
    if (statusLower.includes('no_show') || statusLower.includes('no show')) return 'no_show';
    
    return 'pending';
  };

  // Process the uploaded file
  const processFile = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setErrors([]);

    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) {
            throw new Error('No worksheet found');
          }
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Skip header row and parse data
          const reservations: BookingReservation[] = [];
          const dataRows = jsonData.slice(1) as any[][];

          dataRows.forEach((row, i) => {
            if (!row || row.length === 0) return;

            try {
              // Map Booking.com columns to our structure
              const reservation: BookingReservation = {
                id: `booking_${i}`,
                reservationNumber: row[0] || `RES_${i}`,
                guestName: row[2] || '',
                guestEmail: '',
                guestPhone: row[26] || '',
                guestCountry: row[19] || 'PL',
                checkInDate: parseBookingDate(row[3]),
                checkOutDate: parseBookingDate(row[4]),
                numberOfPersons: parsePositiveInteger(row[8], 1),
                numberOfNights: parsePositiveInteger(row[23], 0),
                accommodationName: row[22] || '',
                accommodationAddress: '',
                status: parseBookingStatus(row[6]),
                totalPrice: parseFloat(row[12]?.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                commission: parseFloat(row[14]?.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                paymentStatus: row[15] || 'pending',
                bookingDate: parseBookingDate(row[5]),
                specialRequests: row[17] || '',
                taxStatus: 'pending'
              };

              // Validate required fields
              if (reservation.reservationNumber && reservation.guestName && reservation.checkInDate) {
                reservations.push(reservation);
              }
            } catch (error) {
              console.error(`Error parsing row ${i}:`, error);
            }
          });

          if (reservations.length === 0) {
            setErrors(['No valid reservations found in the file']);
          } else {
            onFileProcessed(reservations);
            handleClose();
          }
        } catch (error) {
          console.error('Error processing file:', error);
          setErrors(['Error processing file. Please check the file format.']);
        } finally {
          setIsProcessing(false);
        }
      };

      reader.onerror = () => {
        setErrors(['Error reading file']);
        setIsProcessing(false);
      };

      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrors(['Error processing file']);
      setIsProcessing(false);
    }
  }, [file, onFileProcessed, handleClose]);

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bi bi-upload me-2"></i>
          {t('landlord.importReservations', 'Import Booking.com Reservations')}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* Drag and Drop Area */}
        <div
          className={`p-5 text-center border-2 border-dashed rounded-3 mb-4 ${
            isDragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <i className={`bi bi-cloud-upload fs-1 mb-3 ${isDragOver ? 'text-primary' : 'text-muted'}`}></i>
          <h5 className={isDragOver ? 'text-primary' : 'text-muted'}>
            {isDragOver 
              ? t('import.dropFile', 'Drop your Excel file here')
              : t('import.dragOrClick', 'Drag & drop your Excel file here')
            }
          </h5>
          <p className="text-muted mb-3">
            {t('import.supportedFormats', 'Supported formats: .xlsx, .xls')}
          </p>
          
          {/* File Input */}
          <Form.Group>
            <Form.Control
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              className="d-none"
              ref={fileInputRef}
            />
            <Button
              variant="outline-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="bi bi-folder2-open me-2"></i>
              {t('import.browseFiles', 'Browse Files')}
            </Button>
          </Form.Group>
        </div>

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

        {/* Errors */}
        {errors.length > 0 && (
          <Alert variant="warning" className="mb-4">
            <h6>{t('import.parseErrors', 'Parse Errors')}</h6>
            <ul className="mb-0 small">
              {errors.slice(0, 5).map((error, index) => (
                <li key={index}>{error}</li>
              ))}
              {errors.length > 5 && (
                <li><em>...and {errors.length - 5} more errors</em></li>
              )}
            </ul>
          </Alert>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default FileUploadModal;
