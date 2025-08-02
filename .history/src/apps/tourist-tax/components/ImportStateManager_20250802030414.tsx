// Import State Manager - Handles file import flow state and logic
// Single Responsibility: Import state management and file processing

import React, { useState, useCallback } from 'react';
import { Alert, Button, Spinner, Card } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { BookingReservation } from '../types/BookingTypes';

// Import state type (mVAT-style)
export type ImportState =
  | { type: 'idle' }
  | { type: 'processing', file: File, progress: number }
  | { type: 'preview', reservations: BookingReservation[], city?: any }
  | { type: 'importing', selectedIds: string[] }
  | { type: 'complete', importedCount: number };

interface ImportStateManagerProps {
  importState: ImportState;
  onStateChange: (state: ImportState) => void;
  onImportComplete?: (reservations: BookingReservation[]) => void;
}

const ImportStateManager: React.FC<ImportStateManagerProps> = ({
  importState,
  onStateChange,
  onImportComplete
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);

  // File processing function
  const processImportFile = useCallback(async (file: File) => {
    try {
      onStateChange({ type: 'processing', file, progress: 20 });

      // Simulate processing with progress updates
      await new Promise(resolve => setTimeout(resolve, 500));
      onStateChange({ type: 'processing', file, progress: 60 });

      await new Promise(resolve => setTimeout(resolve, 500));
      onStateChange({ type: 'processing', file, progress: 100 });

      throw Error("TODO");
    } catch (error) {
      console.error('Error processing file:', error);
      onStateChange({ type: 'idle' });
    }
  }, [onStateChange]);

  // Handle import completion
  const handleImportComplete = useCallback((reservations: BookingReservation[]) => {
    onStateChange({ type: 'complete', importedCount: reservations.length });
    if (onImportComplete) {
      onImportComplete(reservations);
    }
  }, [onStateChange, onImportComplete]);

  // Render processing banner
  if (importState.type === 'processing') {
    return (
      <Alert variant="primary" className="mb-4">
        <div className="d-flex align-items-center">
          <Spinner animation="border" size="sm" className="me-3" />
          <div className="flex-grow-1">
            <strong>Processing {importState.file.name}...</strong>
            <div className="progress mt-2" style={{ height: '6px' }}>
              <div
                className="progress-bar"
                style={{ width: `${importState.progress}%` }}
              ></div>
            </div>
          </div>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => onStateChange({ type: 'idle' })}
          >
            Cancel
          </Button>
        </div>
      </Alert>
    );
  }

  // Render preview section
  if (importState.type === 'preview') {
    return (
      <Card className="mb-4 border-primary">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <i className="bi bi-eye me-2"></i>
            {t('import.previewReservations', 'Preview Reservations')} ({importState.reservations.length})
          </h5>
        </Card.Header>
        <Card.Body>
          <Alert variant="info">
            <strong>Ready to import {importState.reservations.length} reservations</strong>
            <br />
            Please select a city and review the data before importing.
          </Alert>
          {/* TODO: Add city selector and reservation table */}
          <div className="d-flex gap-2">
            <Button
              variant="success"
              disabled={!importState.city}
              onClick={() => handleImportComplete(importState.reservations)}
            >
              <i className="bi bi-check-lg me-2"></i>
              Import Selected
            </Button>
            <Button
              variant="secondary"
              onClick={() => onStateChange({ type: 'idle' })}
            >
              Cancel
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  }

  // Render success banner
  if (importState.type === 'complete') {
    return (
      <Alert variant="success" className="mb-4" dismissible onClose={() => onStateChange({ type: 'idle' })}>
        <i className="bi bi-check-circle me-2"></i>
        <strong>Success!</strong> Imported {importState.importedCount} reservations.
      </Alert>
    );
  }

  return null;
};

export { processImportFile } from './ImportStateManager';
export default ImportStateManager;
