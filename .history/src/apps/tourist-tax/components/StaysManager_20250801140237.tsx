/**
 * StaysManager - Unified component for managing stays (reservations and payments)
 * Replaces separate reservations and payments pages with city grouping and selection
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';
import { reservationRepository } from '../repositories/ReservationRepository';
import FileDropZone from './FileDropZone';
import ImportPreviewModal from './ImportPreviewModal';
import StaysListManager from './StaysListManager';

// Logger for consistency
const logger = {
  info: (message: string, data?: any) => console.log(`[StaysManager] ${message}`, data || ''),
  error: (message: string, error?: any) => console.error(`[StaysManager] ${message}`, error || ''),
  debug: (message: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.debug(`[StaysManager] ${message}`, data || '');
    }
  }
};

interface StaysManagerProps {
  onStaySelect?: (reservation: BookingReservation) => void;
  showActions?: boolean;
}

// Simplified StaysManager - Orchestrates file import and stays display
// Single Responsibility: Coordinate import flow and stays management

const StaysManager: React.FC<StaysManagerProps> = ({
  onStaySelect,
  showActions = true
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // Debug: Log component mount
  logger.debug('🏠 StaysManager component mounted');

  // Simplified state management
  const [reservations, setReservations] = useState<BookingReservation[]>([]);
  const [selectedStays, setSelectedStays] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importReservations, setImportReservations] = useState<BookingReservation[]>([]);

  // Handle file selection for import
  const handleFileSelected = useCallback(async (file: File) => {
    try {
      logger.info('File selected for import', { fileName: file.name, fileSize: file.size });

      // Mock parsed reservations for now - replace with actual Excel parsing
      const mockReservations: BookingReservation[] = [
        {
          id: 'mock-1',
          reservationNumber: 'BK123456',
          guestName: 'John Doe',
          guestEmail: 'john@example.com',
          guestPhone: '+48123456789',
          guestCountry: 'US',
          checkInDate: '2025-01-15',
          checkOutDate: '2025-01-18',
          numberOfPersons: 2,
          numberOfNights: 3,
          accommodationName: 'Test Hotel',
          accommodationAddress: 'Test Address',
          status: 'confirmed',
          totalPrice: 300,
          commission: 30,
          paymentStatus: 'paid',
          bookingDate: '2025-01-01',
          specialRequests: '',
          taxStatus: 'pending'
        }
      ];

      setImportReservations(mockReservations);
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
      // Start processing file
      processImportFile(excelFile);
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
            <Button
              variant="outline-primary"
              size="sm"
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
            </Button>
          </div>

          {/* Stays List */}
          <StaysListManager
            reservations={reservations}
            selectedStays={selectedStays}
            onStaySelectionChange={handleStaySelectionChange}
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
