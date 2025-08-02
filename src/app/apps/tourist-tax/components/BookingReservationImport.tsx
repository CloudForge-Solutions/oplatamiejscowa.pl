// Booking.com Reservation Import Component
// Orchestrates the import process using smaller components

import React, { useState, useCallback } from 'react';
import { BookingReservation } from '../types/BookingTypes';
import { CityTaxRate } from '../types/TouristTaxTypes';
import { reservationRepository } from '../repositories/ReservationRepository';
import FileUploadModal from './FileUploadModal';
import ReservationPreviewModal from './ReservationPreviewModal';

interface BookingReservationImportProps {
  show?: boolean;
  onHide?: () => void;
  onReservationsImported?: (reservations: BookingReservation[]) => void;
}

const BookingReservationImport: React.FC<BookingReservationImportProps> = ({
  show = false,
  onHide,
  onReservationsImported
}) => {
  // State
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  // Show upload modal when main modal opens
  React.useEffect(() => {
    if (show) {
      setShowPreview(false);
      setReservations([]);
    }
  }, [show]);

  // Handle file processed from upload modal
  const handleFileProcessed = useCallback((parsedReservations: BookingReservation[]) => {
    setReservations(parsedReservations);
    setShowPreview(true);
  }, []);

  // Handle import from preview modal
  const handleImport = useCallback(async (reservationsToImport: BookingReservation[], city: CityTaxRate) => {
    try {
      // Initialize repository
      await reservationRepository.initialize();
      
      // Save reservations to IndexedDB
      await reservationRepository.saveMany(reservationsToImport);
      
      // Call parent callback
      if (onReservationsImported) {
        onReservationsImported(reservationsToImport);
      }
      
      // Close modals
      setShowPreview(false);
      if (onHide) onHide();
    } catch (error) {
      console.error('Error importing reservations:', error);
    }
  }, [onReservationsImported, onHide]);

  return (
    <>
      {/* File Upload Modal */}
      <FileUploadModal
        show={show && !showPreview}
        onHide={onHide || (() => {})}
        onFileProcessed={handleFileProcessed}
      />

      {/* Reservation Preview Modal */}
      <ReservationPreviewModal
        show={showPreview}
        onHide={() => setShowPreview(false)}
        reservations={reservations}
        onImport={handleImport}
      />
    </>
  );
};

export default BookingReservationImport;
