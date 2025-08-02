/**
 * StaysManager - Simplified orchestrator for stays management and import
 * Single Responsibility: Coordinate file import and stays display
 * No god object antipatterns - delegates to specialized components
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { reservationRepository } from '../repositories/ReservationRepository';
import { createComponentLogger } from '../../../platform/logging';
import FileDropZone from './FileDropZone';
import ImportPreviewModal from './ImportPreviewModal';
import StaysListManager from './StaysListManager';

// Component-specific logger
const logger = createComponentLogger('StaysManager');

interface StaysManagerProps {
  onStaySelect?: (reservation: BookingReservation) => void;
}

const StaysManager: React.FC<StaysManagerProps> = ({
  onStaySelect
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // Simplified state management
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importReservations, setImportReservations] = useState<BookingReservation[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Handle file selection for import
  const handleFileSelected = useCallback(async (file: File) => {
    try {
      logger.info('File selected for import', { fileName: file.name, fileSize: file.size });

      // TODO: Implement actual Excel file parsing
      // For now, we'll show the import modal with dummy data
      // In production, this should parse the Excel file and extract reservation data
      setSelectedFile(file);
      setShowImportModal(true);
    } catch (error) {
      logger.error('Error processing file:', error);
      setError('Error processing file. Please try again.');
    }
  }, []);

  // Handle import completion
  const handleImportComplete = useCallback(async (importedReservations: BookingReservation[], selectedCity: any) => {
    try {
      logger.info('Importing reservations', {
        count: importedReservations.length,
        city: selectedCity.cityName
      });

      // Add imported reservations to the list
      setReservations(prev => [...prev, ...importedReservations]);
      setShowImportModal(false);
      setImportReservations([]);

      // Reload to refresh the display
      loadStays();

    } catch (error) {
      logger.error('Error importing reservations:', error);
      setError('Failed to import reservations. Please try again.');
    }
  }, []);

  // Handle stay selection change
  const handleStaySelectionChange = useCallback((stayId: string, selected: boolean) => {
    setSelectedStays(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(stayId);
      } else {
        newSet.delete(stayId);
      }
      return newSet;
    });
  }, []);

  // Load reservations on component mount
  useEffect(() => {
    loadStays();
  }, []);

  /**
   * Load all reservations from IndexedDB
   */
  const loadStays = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Initialize repository if needed
      await reservationRepository.initialize();

      // Load reservations
      const reservationData = await reservationRepository.findAll();
      setReservations(reservationData);

      logger.info('✅ Stays loaded from IndexedDB', {
        count: reservationData.length
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      logger.error('❌ Failed to load stays', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">{t('common:loading', 'Loading...')}</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Error Alert */}
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Empty State with File Drop Zone */}
      {reservations.length === 0 ? (
        <FileDropZone
          onFileSelected={handleFileSelected}
          onError={setError}
          showImportButton={true}
        />
      ) : (
        <>
          {/* Import More Button */}
          <div className="mb-3 text-end">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.xlsx,.xls';
                input.onchange = (event) => {
                  const file = (event.target as HTMLInputElement).files?.[0];
                  if (file) {
                    handleFileSelected(file);
                  }
                };
                input.click();
              }}
            >
              <i className="bi bi-plus-circle me-1"></i>
              {t('common:actions.import', 'Import More')}
            </button>
          </div>

          {/* Stays List */}
          <StaysListManager
            reservations={reservations}
            selectedStays={selectedStays}
            onStaySelectionChange={handleStaySelectionChange}
            onDeleteStay={async (stayId: string) => {
              try {
                await reservationRepository.delete(stayId);
                await loadStays();
                logger.info('Stay deleted', { stayId });
              } catch (error) {
                logger.error('Error deleting stay:', error);
                setError('Failed to delete stay. Please try again.');
              }
            }}
            onEditStay={onStaySelect ? (stayId: string) => {
              const reservation = reservations.find(r => r.id === stayId);
              if (reservation) {
                onStaySelect(reservation);
              }
            } : undefined}
            isLoading={isLoading}
          />
        </>
      )}

      {/* Import Preview Modal */}
      <ImportPreviewModal
        show={showImportModal}
        reservations={importReservations}
        onHide={() => {
          setShowImportModal(false);
          setImportReservations([]);
        }}
        onImport={handleImportComplete}
      />
    </div>
  );
};

export default StaysManager;
