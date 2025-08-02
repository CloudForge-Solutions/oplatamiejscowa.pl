import { useState, useCallback } from 'react';
import { TouristTaxData, TaxCalculationResponse, ApiResponse } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';

interface UseTaxCalculationReturn {
  calculateTax: (data: TouristTaxData) => Promise<number>;
  taxAmount: number;
  taxBreakdown: TaxCalculationResponse | null;
  isCalculating: boolean;
  error: string | null;
  clearError: () => void;
}

export const useTaxCalculation = (): UseTaxCalculationReturn => {
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [taxBreakdown, setTaxBreakdown] = useState<TaxCalculationResponse | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const calculateTax = useCallback(async (data: TouristTaxData): Promise<number> => {
    setIsCalculating(true);
    setError(null);

    try {
      const calculationRequest = {
        cityCode: data.cityCode,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        numberOfPersons: data.numberOfPersons
      };

      const response: ApiResponse<TaxCalculationResponse> =
        await TaxCalculationService.calculateTax(calculationRequest);

      if (response.success && response.data) {
        const calculatedAmount = response.data.totalTaxAmount;
        setTaxAmount(calculatedAmount);
        setTaxBreakdown(response.data);
        return calculatedAmount;
      } else {
        throw new Error(response.error?.message || 'Tax calculation failed');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setTaxAmount(0);
      setTaxBreakdown(null);
      throw err;
    } finally {
      setIsCalculating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    calculateTax,
    taxAmount,
    taxBreakdown,
    isCalculating,
    error,
    clearError
  };
};
