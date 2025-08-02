// File Drop Zone Component - Handles drag & drop file upload
// Single Responsibility: File upload UI and drag & drop handling

import React, { useState, useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface FileDropZoneProps {
  onFileSelected: (file: File) => void;
  onError?: (error: string) => void;
  showImportButton?: boolean;
  className?: string;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({
  onFileSelected,
  onError,
  showImportButton = true,
  className = ''
}) => {
  const { t } = useTranslation(['tourist-tax', 'common']);
  const [isDragOver, setIsDragOver] = useState(false);

  // Validate file type
  const isValidExcelFile = useCallback((file: File): boolean => {
    return (
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );
  }, []);

  // Handle file selection
  const handleFileSelection = useCallback((file: File) => {
    if (isValidExcelFile(file)) {
      onFileSelected(file);
    } else {
      const errorMessage = 'Please select a valid Excel file (.xlsx or .xls)';
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [isValidExcelFile, onFileSelected, onError]);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    const excelFile = files.find(isValidExcelFile);

    if (excelFile) {
      handleFileSelection(excelFile);
    } else {
      const errorMessage = 'Please drop a valid Excel file (.xlsx or .xls)';
      if (onError) {
        onError(errorMessage);
      }
    }
  }, [isValidExcelFile, handleFileSelection, onError]);

  // File picker handler
  const handleFilePickerClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileSelection(file);
      }
    };
    input.click();
  }, [handleFileSelection]);

  return (
    <div
      className={`p-5 text-center border-2 border-dashed rounded-3 ${
        isDragOver
          ? 'border-primary bg-primary bg-opacity-10'
          : 'border-secondary bg-light'
      } ${className}`}
      style={{
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={showImportButton ? undefined : handleFilePickerClick}
    >
      <div className="mb-3">
        <i className={`bi bi-upload display-4 ${isDragOver ? 'text-primary' : 'text-muted'}`}></i>
      </div>
      <h5 className={isDragOver ? 'text-primary' : 'text-dark'}>
        {isDragOver
          ? t('import.dropFile', 'Drop your Excel file here')
          : t('stays.noStaysYet', 'No stays yet. Import data from Booking.com to get started.')
        }
      </h5>
      <p className={`mb-3 ${isDragOver ? 'text-primary' : 'text-muted'}`}>
        {isDragOver
          ? t('import.supportedFormats', 'Supported formats: .xlsx, .xls')
          : t('import.dropFile', 'Drop your Excel file here')
        }
      </p>
      {!isDragOver && showImportButton && (
        <Button
          variant="primary"
          onClick={handleFilePickerClick}
        >
          <i className="bi bi-upload me-2"></i>
          {t('common:actions.import', 'Import Reservations')}
        </Button>
      )}
    </div>
  );
};

export default FileDropZone;
