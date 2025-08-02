import {
  TaxCalculationRequest,
  TaxCalculationResponse,
  ApiResponse,
  CityTaxRate
} from '../types/TouristTaxTypes';

// Mock data for Polish cities with tourist tax rates
const CITY_TAX_RATES: CityTaxRate[] = [
  {
    cityCode: 'KRK',
    cityName: 'Kraków',
    taxRatePerNight: 3.3,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Kraków city'
  },
  {
    cityCode: 'WAW',
    cityName: 'Warszawa',
    taxRatePerNight: 4.0,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Warsaw city'
  },
  {
    cityCode: 'GDN',
    cityName: 'Gdańsk',
    taxRatePerNight: 2.5,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Gdańsk city'
  },
  {
    cityCode: 'WRO',
    cityName: 'Wrocław',
    taxRatePerNight: 2.8,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Wrocław city'
  },
  {
    cityCode: 'POZ',
    cityName: 'Poznań',
    taxRatePerNight: 2.2,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Poznań city'
  },
  {
    cityCode: 'ZAK',
    cityName: 'Zakopane',
    taxRatePerNight: 3.5,
    currency: 'PLN',
    effectiveFrom: '2024-01-01',
    description: 'Tourist tax for Zakopane resort'
  }
];

export class TaxCalculationService {
  private static readonly API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

  /**
   * Calculate tourist tax based on stay details
   */
  static async calculateTax(
    request: TaxCalculationRequest
  ): Promise<ApiResponse<TaxCalculationResponse>> {
    try {
      // In production, this would be an API call to Azure Functions
      // For now, we'll simulate the calculation locally

      const cityRate = CITY_TAX_RATES.find(rate => rate.cityCode === request.cityCode);

      if (!cityRate) {
        return {
          success: false,
          error: {
            message: 'City not found or tourist tax not applicable',
            code: 'CITY_NOT_FOUND'
          }
        };
      }

      const checkInDate = new Date(request.checkInDate);
      const checkOutDate = new Date(request.checkOutDate);
      const numberOfNights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (numberOfNights <= 0) {
        return {
          success: false,
          error: {
            message: 'Invalid date range',
            code: 'INVALID_DATE_RANGE'
          }
        };
      }

      // Base calculation
      const baseAmount = numberOfNights * request.numberOfPersons * cityRate.taxRatePerNight;

      // Apply discounts (children under 18 are typically exempt or discounted)
      const discounts = [];
      const exemptions = [];

      // For now, we'll use the base amount without discounts
      // In a real implementation, you'd collect age information and apply appropriate discounts

      const totalTaxAmount = Math.round(baseAmount * 100) / 100; // Round to 2 decimal places

      const response: TaxCalculationResponse = {
        numberOfNights,
        taxRatePerNight: cityRate.taxRatePerNight,
        totalTaxAmount,
        currency: 'PLN',
        breakdown: {
          baseRate: cityRate.taxRatePerNight,
          discounts,
          exemptions
        }
      };

      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Tax calculation error:', error);
      return {
        success: false,
        error: {
          message: 'Failed to calculate tax',
          code: 'CALCULATION_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Get all available cities with tax rates
   */
  static async getAvailableCities(): Promise<ApiResponse<CityTaxRate[]>> {
    try {
      // In production, this would fetch from the API
      return {
        success: true,
        data: CITY_TAX_RATES
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch cities',
          code: 'FETCH_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Get tax rate for a specific city
   */
  static async getCityTaxRate(cityCode: string): Promise<ApiResponse<CityTaxRate>> {
    try {
      const cityRate = CITY_TAX_RATES.find(rate => rate.cityCode === cityCode);

      if (!cityRate) {
        return {
          success: false,
          error: {
            message: 'City not found',
            code: 'CITY_NOT_FOUND'
          }
        };
      }

      return {
        success: true,
        data: cityRate
      };
    } catch (error) {
      return {
        success: false,
        error: {
          message: 'Failed to fetch city tax rate',
          code: 'FETCH_ERROR',
          details: error
        }
      };
    }
  }

  /**
   * Validate date range for tax calculation
   */
  static validateDateRange(
    checkInDate: string,
    checkOutDate: string
  ): { isValid: boolean; error?: string } {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (checkIn < today) {
      return {
        isValid: false,
        error: 'Check-in date cannot be in the past'
      };
    }

    if (checkOut <= checkIn) {
      return {
        isValid: false,
        error: 'Check-out date must be after check-in date'
      };
    }

    const maxStayDays = 365; // Maximum stay of 1 year
    const stayDuration = Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (stayDuration > maxStayDays) {
      return {
        isValid: false,
        error: `Stay duration cannot exceed ${maxStayDays} days`
      };
    }

    return { isValid: true };
  }

  /**
   * Format currency amount for display
   */
  static formatCurrency(amount: number, currency: 'PLN' = 'PLN'): string {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }
}
