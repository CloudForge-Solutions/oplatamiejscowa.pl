/**
 * Validation Error Reporter - Platform Service
 *
 * ARCHITECTURE: Centralized validation error handling
 * - Structured error collection and reporting
 * - Integration with logging system
 * - Performance tracking for validation operations
 * - Fail-fast validation with proper error handling
 */

import { logger } from '../constants';

interface ValidationError {
    id: string;
    timestamp: string;
    field: string;
    message: string;
    value: any;
    rule: string;
    context?: string;
}

interface ValidationStats {
    totalValidations: number;
    failedValidations: number;
    successRate: number;
}

export class ValidationErrorReporter {
    private errors: ValidationError[] = [];
    private validationStats: ValidationStats = {
        totalValidations: 0,
        failedValidations: 0,
        successRate: 100
    };

    constructor() {
        logger.info('🔍 ValidationErrorReporter initialized');
    }

    /**
     * Report a validation error
     */
    reportError(field: string, message: string, value: any, rule: string): ValidationError {
        const error: ValidationError = {
            id: `validation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            field,
            message,
            value,
            rule,
            context: this._getValidationContext()
        };

        this.errors.push(error);
        this.validationStats.failedValidations++;
        this._updateSuccessRate();

        // Log the validation error
        logger.error(`Validation failed for field "${field}": ${message}`, {
            field,
            value,
            rule,
            error
        });

        return error;
    }

  /**
   * Format validation summary
   */
  formatSummary(summary) {
    const total = summary.critical + summary.high + summary.warnings;

    return {
      total,
      critical: summary.critical,
      high: summary.high,
      warnings: summary.warnings,
      status: summary.critical > 0 ? 'failed' : summary.high > 0 ? 'warning' : 'passed',
      message: this.getSummaryMessage(summary),
    };
  }

  /**
   * Get summary message based on error counts
   */
  getSummaryMessage(summary) {
    if (summary.critical > 0) {
      return `Wykryto ${summary.critical} błędów krytycznych - faktura nie może być zaakceptowana`;
    } else if (summary.high > 0) {
      return `Wykryto ${summary.high} błędów wysokiej wagi - wymagana weryfikacja`;
    } else if (summary.warnings > 0) {
      return `Wykryto ${summary.warnings} ostrzeżeń - zalecana weryfikacja`;
    } else {
      return 'Walidacja przebiegła pomyślnie';
    }
  }

  /**
   * Format error details with categorization
   */
  formatErrorDetails(errors, warnings) {
    const allIssues = [...errors, ...warnings];

    return {
      byCategory: this.groupByCategory(allIssues),
      byField: this.groupByField(allIssues),
      chronological: allIssues.map(issue => this.formatIssue(issue)),
    };
  }

  /**
   * Group issues by severity category
   */
  groupByCategory(issues) {
    const grouped = {
      critical: [],
      high: [],
      warning: [],
    };

    issues.forEach(issue => {
      if (grouped[issue.severity]) {
        grouped[issue.severity].push(this.formatIssue(issue));
      }
    });

    return grouped;
  }

  /**
   * Group issues by field
   */
  groupByField(issues) {
    const grouped = {};

    issues.forEach(issue => {
      const field = issue.field || 'unknown';
      if (!grouped[field]) {
        grouped[field] = [];
      }
      grouped[field].push(this.formatIssue(issue));
    });

    return grouped;
  }

  /**
   * Format individual issue
   */
  formatIssue(issue) {
    const category = this.errorCategories[issue.severity] || this.errorCategories.warning;

    return {
      field: issue.field,
      code: issue.code,
      message: issue.message,
      severity: issue.severity,
      icon: category.icon,
      color: category.color,
      label: category.label,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate HTML report for display in UI
   */
  generateHTMLReport(validationResult, fileName) {
    const { errors, warnings, summary } = validationResult;
    const allIssues = [...errors, ...warnings];

    if (allIssues.length === 0) {
      return `
                <div class="validation-report success">
                    <div class="alert alert-success">
                        <i class="bi bi-check-circle"></i>
                        <strong>Walidacja pomyślna</strong><br>
                        Plik '${fileName}' przeszedł wszystkie kontrole.
                    </div>
                </div>
            `;
    }

    const categorized = this.groupByCategory(allIssues);

    return `
            <div class="validation-report">
                <div class="report-header">
                    <h6><i class="bi bi-shield-exclamation"></i> Raport walidacji: ${fileName}</h6>
                    <div class="summary-badges">
                        ${summary.critical > 0 ? `<span class="badge bg-danger">${summary.critical} krytycznych</span>` : ''}
                        ${summary.high > 0 ? `<span class="badge bg-warning">${summary.high} wysokich</span>` : ''}
                        ${summary.warnings > 0 ? `<span class="badge bg-info">${summary.warnings} ostrzeżeń</span>` : ''}
                    </div>
                </div>

                ${this.renderIssueCategory('critical', categorized.critical, 'Błędy krytyczne', 'danger')}
                ${this.renderIssueCategory('high', categorized.high, 'Błędy wysokiej wagi', 'warning')}
                ${this.renderIssueCategory('warning', categorized.warning, 'Ostrzeżenia', 'info')}
            </div>
        `;
  }

  /**
   * Render issue category section
   */
  renderIssueCategory(category, issues, title, alertClass) {
    if (issues.length === 0) {
      return '';
    }

    return `
            <div class="issue-category mt-3">
                <div class="alert alert-${alertClass}">
                    <h6>${title} (${issues.length})</h6>
                    <ul class="mb-0">
                        ${issues
                          .map(
                            issue => `
                            <li>
                                <strong>${issue.field}:</strong> ${issue.message}
                                <small class="text-muted">(${issue.code})</small>
                            </li>
                        `
                          )
                          .join('')}
                    </ul>
                </div>
            </div>
        `;
  }

  /**
   * Generate text report for logging
   */
  generateTextReport(validationResult, fileName) {
    const { errors, warnings, summary } = validationResult;
    const lines = [];

    lines.push('=== RAPORT WALIDACJI ===');
    lines.push(`Plik: ${fileName}`);
    lines.push(`Data: ${new Date().toLocaleString('pl-PL')}`);
    lines.push(`Status: ${this.getSummaryMessage(summary)}`);
    lines.push('');

    if (errors.length > 0) {
      lines.push('BŁĘDY:');
      errors.forEach(error => {
        lines.push(
          `  ${error.severity.toUpperCase()}: [${error.field}] ${error.message} (${error.code})`
        );
      });
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push('OSTRZEŻENIA:');
      warnings.forEach(warning => {
        lines.push(`  WARNING: [${warning.field}] ${warning.message} (${warning.code})`);
      });
      lines.push('');
    }

    lines.push('=== KONIEC RAPORTU ===');

    return lines.join('\n');
  }

  /**
   * Generate actionable items for fixing issues
   */
  generateActionableItems(errors, warnings) {
    const actions = [];

    // Critical errors require immediate action
    errors
      .filter(e => e.severity === 'critical')
      .forEach(error => {
        actions.push({
          priority: 'immediate',
          action: this.getActionForError(error),
          field: error.field,
          code: error.code,
        });
      });

    // High errors require attention
    errors
      .filter(e => e.severity === 'high')
      .forEach(error => {
        actions.push({
          priority: 'high',
          action: this.getActionForError(error),
          field: error.field,
          code: error.code,
        });
      });

    // Warnings are recommendations
    warnings.forEach(warning => {
      actions.push({
        priority: 'recommendation',
        action: this.getActionForError(warning),
        field: warning.field,
        code: warning.code,
      });
    });

    return actions;
  }

  /**
   * Get suggested action for specific error
   */
  getActionForError(error) {
    const actionMap = {
      EMPTY_DATA: 'Sprawdź czy plik PDF zawiera tekst i spróbuj ponownie',
      EMPTY_OBJECT: 'Uruchom ponownie ekstrakcję z innymi parametrami',
      MISSING_INVOICE_NUMBER: 'Ręcznie wprowadź numer faktury',
      MISSING_ISSUE_DATE: 'Ręcznie wprowadź datę wystawienia',
      MISSING_NET_AMOUNT: 'Ręcznie wprowadź kwotę netto',
      MISSING_GROSS_AMOUNT: 'Ręcznie wprowadź kwotę brutto',
      INVALID_INVOICE_NUMBER: 'Sprawdź i popraw numer faktury',
      AMOUNT_CALCULATION_MISMATCH: 'Sprawdź obliczenia VAT',
      INCOMPLETE_CRITICAL_DATA: 'Uzupełnij brakujące dane krytyczne',
      MOSTLY_EMPTY_DATA: 'Sprawdź jakość pliku PDF i uruchom ponownie ekstrakcję',
    };

    return actionMap[error.code] || 'Sprawdź i popraw dane ręcznie';
  }

  /**
   * Format error for console logging with extracted vs expected data
   */
  formatForConsole(validationResult, fileName, extractedData = null) {
    const textReport = this.generateTextReport(validationResult, fileName);

    // Determine if this is a step-specific validation
    const isStepValidation = fileName.includes('_step');
    const stepName = isStepValidation ? fileName.replace('_step', '') : null;

    // Enhanced reporting with extracted data comparison
    if (extractedData && (validationResult.hasCriticalErrors || validationResult.hasHighErrors)) {
      const enhancedReport = this.generateEnhancedReport(validationResult, fileName, extractedData);
      if (isStepValidation) {
        logger.error(
          `🚨 CRITICAL VALIDATION ERRORS IN ${stepName.toUpperCase()} STEP:`,
          enhancedReport
        );
      } else {
        logger.error('🚨 CRITICAL VALIDATION ERRORS:', enhancedReport);
      }
    } else if (validationResult.hasCriticalErrors) {
      if (isStepValidation) {
        logger.error(
          `🚨 CRITICAL VALIDATION ERRORS IN ${stepName.toUpperCase()} STEP:`,
          textReport
        );
      } else {
        logger.error('🚨 CRITICAL VALIDATION ERRORS:', textReport);
      }
    } else if (validationResult.hasHighErrors) {
      if (isStepValidation) {
        logger.warn(`⚠️ VALIDATION ERRORS IN ${stepName.toUpperCase()} STEP:`, textReport);
      } else {
        logger.warn('⚠️ VALIDATION ERRORS:', textReport);
      }
    } else if (validationResult.warnings.length > 0) {
      if (isStepValidation) {
        logger.info(`⚡ VALIDATION WARNINGS IN ${stepName.toUpperCase()} STEP:`, textReport);
      } else {
        logger.info('⚡ VALIDATION WARNINGS:', textReport);
      }
    } else {
      if (isStepValidation) {
        logger.info(`✅ VALIDATION PASSED FOR ${stepName.toUpperCase()} STEP:`, fileName);
      } else {
        logger.info('✅ VALIDATION PASSED:', fileName);
      }
    }
  }

  /**
   * Generate enhanced report with extracted vs expected data comparison
   */
  generateEnhancedReport(validationResult, fileName, extractedData) {
    const timestamp = new Date().toLocaleString('pl-PL');
    let report = '=== SZCZEGÓŁOWY RAPORT WALIDACJI ===\n';
    report += `Plik: ${fileName}\n`;
    report += `Data: ${timestamp}\n`;
    report += `Status: ${validationResult.hasCriticalErrors ? 'BŁĘDY KRYTYCZNE' : 'BŁĘDY WYMAGAJĄCE POPRAWY'}\n\n`;

    // ENHANCED: Show complete extracted data first
    report += '📋 KOMPLETNE WYODRĘBNIONE DANE:\n';
    report += `${this.formatCompleteExtractedData(extractedData)}\n\n`;

    // Process errors with data comparison
    if (validationResult.errors.length > 0) {
      report += `🚨 BŁĘDY (${validationResult.errors.length}):\n`;
      validationResult.errors.forEach((error, index) => {
        report += `\n${index + 1}. [${error.field}] ${error.message}\n`;
        report += `   Kod: ${error.code} | Poziom: ${error.severity}\n`;

        // Add extracted vs expected data comparison
        const extractedValue = this.getFieldValue(extractedData, error.field);
        const expectedFormat = this.getExpectedFormat(error.code, error.field);

        report += '   📊 PORÓWNANIE DANYCH:\n';
        report += `      Wyodrębniono: ${this.formatValue(extractedValue)}\n`;
        report += `      Oczekiwano: ${expectedFormat}\n`;

        const diff = this.generateDiff(extractedValue, expectedFormat, error.code);
        if (diff) {
          report += `      🔍 Analiza: ${diff}\n`;
        }

        const suggestion = this.getSuggestion(error.code, error.field);
        if (suggestion) {
          report += `      💡 Sugestia: ${suggestion}\n`;
        }
      });
    }

    // Process warnings
    if (validationResult.warnings.length > 0) {
      report += `\n⚠️ OSTRZEŻENIA (${validationResult.warnings.length}):\n`;
      validationResult.warnings.forEach((warning, index) => {
        report += `\n${index + 1}. [${warning.field}] ${warning.message}\n`;

        const extractedValue = this.getFieldValue(extractedData, warning.field);
        if (extractedValue !== undefined) {
          report += `   📊 Wyodrębniono: ${this.formatValue(extractedValue)}\n`;
        }
      });
    }

    report += '\n=== KONIEC RAPORTU ===';
    return report;
  }

  /**
   * Get field value from nested object using dot notation
   */
  getFieldValue(data, fieldPath) {
    try {
      if (!data || !fieldPath) {
        return undefined;
      }

      return fieldPath.split('.').reduce((obj, key) => {
        if (!obj) {
          return undefined;
        }

        // Handle array notation like positions[0]
        if (key.includes('[') && key.includes(']')) {
          const arrayKey = key.substring(0, key.indexOf('['));
          const index = parseInt(key.substring(key.indexOf('[') + 1, key.indexOf(']')));
          return obj[arrayKey] && obj[arrayKey][index];
        }
        return obj[key];
      }, data);
    } catch (error) {
      return 'Błąd odczytu pola';
    }
  }

  /**
   * Format complete extracted data for display
   */
  formatCompleteExtractedData(extractedData) {
    if (!extractedData || typeof extractedData !== 'object') {
      return '(brak danych lub nieprawidłowy format)';
    }

    try {
      // Create a formatted, readable representation
      const formatted = JSON.stringify(extractedData, null, 2);

      // Add some visual formatting for better readability
      let result = '┌─ STRUKTURA DANYCH ─────────────────────────────────────────┐\n';

      // Split into lines and add visual formatting
      const lines = formatted.split('\n');
      lines.forEach((line, index) => {
        if (index === 0 || index === lines.length - 1) {
          result += `│ ${line.padEnd(58)} │\n`;
        } else {
          // Truncate very long lines
          const truncatedLine = line.length > 58 ? `${line.substring(0, 55)}...` : line;
          result += `│ ${truncatedLine.padEnd(58)} │\n`;
        }
      });

      result += '└────────────────────────────────────────────────────────────┘';
      return result;
    } catch (error) {
      return `(błąd formatowania danych: ${error.message})`;
    }
  }

  /**
   * Format value for display
   */
  formatValue(value) {
    if (value === null || value === undefined) {
      return '(brak)';
    }
    if (value === '') {
      return '(pusty string)';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    if (typeof value === 'string' && value.length > 100) {
      return `${value.substring(0, 100)}...`;
    }
    return String(value);
  }

  /**
   * Get expected format description for validation code
   */
  getExpectedFormat(code, field) {
    const formats = {
      INVALID_ISSUE_DATE: 'Data w formacie YYYY-MM-DD (np. 2024-12-31)',
      MISSING_SELLER_NIP: 'NIP w formacie XXX-XXX-XX-XX lub XXXXXXXXXX',
      INVALID_NIP_FORMAT: 'NIP w formacie XXX-XXX-XX-XX lub XXXXXXXXXX (10 cyfr)',
      MISSING_INVOICE_NUMBER: 'Numer faktury (string niepusty)',
      INVALID_AMOUNT_FORMAT: 'Kwota jako liczba (np. 123.45)',
      MISSING_POSITION_DESCRIPTION: 'Opis pozycji (string niepusty)',
      INVALID_VAT_RATE: 'Stawka VAT: 0, 5, 8, 23 lub "zw" (zwolniony)',
      MISSING_BUYER_NAME: 'Nazwa nabywcy (string niepusty)',
      INVALID_DATE_FORMAT: 'Data w formacie YYYY-MM-DD',
      MISSING_SELLER_NAME: 'Nazwa sprzedawcy (string niepusty)',
      MISSING_NET_AMOUNT: 'Kwota netto jako liczba',
      MISSING_GROSS_AMOUNT: 'Kwota brutto jako liczba',
    };

    return formats[code] || 'Sprawdź format danych';
  }

  /**
   * Generate diff analysis for validation failure
   */
  generateDiff(extracted, expected, code) {
    if (extracted === undefined || extracted === null) {
      return 'Pole nie zostało wyodrębnione';
    }

    const extractedStr = String(extracted);

    // Specific diff analysis based on validation code
    switch (code) {
      case 'INVALID_ISSUE_DATE':
        if (extractedStr) {
          const datePattern = /^\d{4}-\d{2}-\d{2}$/;
          if (!datePattern.test(extractedStr)) {
            return `Format '${extractedStr}' nie pasuje do wzorca YYYY-MM-DD`;
          }
          return `Data "${extractedStr}" może być nieprawidłowa`;
        }
        return 'Brak daty';

      case 'MISSING_SELLER_NIP':
        return 'Pole NIP sprzedawcy jest wymagane dla JPK';

      case 'INVALID_NIP_FORMAT':
        if (extractedStr) {
          const digits = extractedStr.replace(/\D/g, '');
          return `Znaleziono ${digits.length} cyfr, wymagane dokładnie 10`;
        }
        return 'Brak cyfr w NIP';

      case 'INVALID_AMOUNT_FORMAT':
        if (extractedStr && isNaN(parseFloat(extractedStr))) {
          return `'${extractedStr}' nie jest prawidłową liczbą`;
        }
        return 'Nieprawidłowy format kwoty';

      case 'MISSING_POSITION_DESCRIPTION':
        return 'Opis pozycji jest wymagany dla JPK';

      default:
        if (extractedStr === '') {
          return 'Pole jest puste';
        }
        return 'Sprawdź format i zawartość pola';
    }
  }

  /**
   * Get suggestion for fixing validation error
   */
  getSuggestion(code, field) {
    const suggestions = {
      INVALID_ISSUE_DATE:
        'Sprawdź czy data jest czytelna na fakturze i w formacie DD.MM.YYYY lub DD/MM/YYYY',
      MISSING_SELLER_NIP:
        'Upewnij się, że NIP sprzedawcy jest widoczny na fakturze (zwykle w nagłówku)',
      INVALID_NIP_FORMAT:
        'NIP powinien zawierać 10 cyfr, sprawdź czy wszystkie zostały wyodrębnione',
      MISSING_INVOICE_NUMBER:
        'Sprawdź czy numer faktury jest wyraźnie oznaczony (Nr, Numer, Invoice No.)',
      INVALID_AMOUNT_FORMAT:
        'Kwoty powinny być liczbami, usuń symbole waluty i sprawdź separatory dziesiętne',
      MISSING_POSITION_DESCRIPTION: 'Sprawdź czy tabela pozycji jest czytelna i kompletna',
      INVALID_VAT_RATE:
        'Sprawdź kolumnę VAT w tabeli pozycji (powinna zawierać 0%, 5%, 8%, 23% lub "zw")',
      MISSING_BUYER_NAME: 'Sprawdź sekcję "Nabywca" lub "Kupujący" na fakturze',
      MISSING_SELLER_NAME: 'Sprawdź nagłówek faktury z danymi sprzedawcy',
      MISSING_NET_AMOUNT: 'Sprawdź sekcję podsumowania z kwotami netto',
      MISSING_GROSS_AMOUNT: 'Sprawdź sekcję "Do zapłaty" lub "Razem brutto"',
    };

    return suggestions[code];
  }
}
