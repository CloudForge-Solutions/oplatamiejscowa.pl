import { Injectable, Logger, BadRequestException } from '@nestjs/common';

/**
 * City Tax Rate Configuration
 * Maps Polish cities to their tourist tax rates per person per night
 */
interface CityTaxRate {
  cityName: string;
  taxRatePerNightPerPerson: number;
  currency: string;
  region: string;
}

/**
 * TaxRateService - Manages tourist tax rates by city
 * 
 * RESPONSIBILITY: Provide accurate tax rates for Polish cities
 * ARCHITECTURE: Static configuration with future database integration capability
 */
@Injectable()
export class TaxRateService {
  private readonly logger = new Logger(TaxRateService.name);

  /**
   * Polish City Tax Rates (PLN per person per night)
   * Source: Official municipal regulations as of 2024
   */
  private readonly cityTaxRates: CityTaxRate[] = [
    // Major Tourist Cities
    { cityName: 'Kraków', taxRatePerNightPerPerson: 2.50, currency: 'PLN', region: 'Małopolskie' },
    { cityName: 'Krakow', taxRatePerNightPerPerson: 2.50, currency: 'PLN', region: 'Małopolskie' }, // Alternative spelling
    { cityName: 'Warszawa', taxRatePerNightPerPerson: 3.00, currency: 'PLN', region: 'Mazowieckie' },
    { cityName: 'Warsaw', taxRatePerNightPerPerson: 3.00, currency: 'PLN', region: 'Mazowieckie' }, // English name
    { cityName: 'Gdańsk', taxRatePerNightPerPerson: 2.80, currency: 'PLN', region: 'Pomorskie' },
    { cityName: 'Gdansk', taxRatePerNightPerPerson: 2.80, currency: 'PLN', region: 'Pomorskie' }, // Without diacritics
    { cityName: 'Wrocław', taxRatePerNightPerPerson: 2.30, currency: 'PLN', region: 'Dolnośląskie' },
    { cityName: 'Wroclaw', taxRatePerNightPerPerson: 2.30, currency: 'PLN', region: 'Dolnośląskie' }, // Without diacritics
    { cityName: 'Poznań', taxRatePerNightPerPerson: 2.20, currency: 'PLN', region: 'Wielkopolskie' },
    { cityName: 'Poznan', taxRatePerNightPerPerson: 2.20, currency: 'PLN', region: 'Wielkopolskie' }, // Without diacritics
    
    // Mountain Resort Cities
    { cityName: 'Zakopane', taxRatePerNightPerPerson: 3.50, currency: 'PLN', region: 'Małopolskie' },
    { cityName: 'Karpacz', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Dolnośląskie' },
    { cityName: 'Szklarska Poręba', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Dolnośląskie' },
    { cityName: 'Szklarska Poreba', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Dolnośląskie' }, // Without diacritics
    
    // Coastal Cities
    { cityName: 'Sopot', taxRatePerNightPerPerson: 3.20, currency: 'PLN', region: 'Pomorskie' },
    { cityName: 'Gdynia', taxRatePerNightPerPerson: 2.50, currency: 'PLN', region: 'Pomorskie' },
    { cityName: 'Kołobrzeg', taxRatePerNightPerPerson: 2.80, currency: 'PLN', region: 'Zachodniopomorskie' },
    { cityName: 'Kolobrzeg', taxRatePerNightPerPerson: 2.80, currency: 'PLN', region: 'Zachodniopomorskie' }, // Without diacritics
    { cityName: 'Świnoujście', taxRatePerNightPerPerson: 2.60, currency: 'PLN', region: 'Zachodniopomorskie' },
    { cityName: 'Swinoujscie', taxRatePerNightPerPerson: 2.60, currency: 'PLN', region: 'Zachodniopomorskie' }, // Without diacritics
    
    // Historic Cities
    { cityName: 'Lublin', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Lubelskie' },
    { cityName: 'Toruń', taxRatePerNightPerPerson: 2.10, currency: 'PLN', region: 'Kujawsko-Pomorskie' },
    { cityName: 'Torun', taxRatePerNightPerPerson: 2.10, currency: 'PLN', region: 'Kujawsko-Pomorskie' }, // Without diacritics
    { cityName: 'Częstochowa', taxRatePerNightPerPerson: 1.80, currency: 'PLN', region: 'Śląskie' },
    { cityName: 'Czestochowa', taxRatePerNightPerPerson: 1.80, currency: 'PLN', region: 'Śląskie' }, // Without diacritics
    
    // Other Cities
    { cityName: 'Łódź', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Łódzkie' },
    { cityName: 'Lodz', taxRatePerNightPerPerson: 2.00, currency: 'PLN', region: 'Łódzkie' }, // Without diacritics
    { cityName: 'Katowice', taxRatePerNightPerPerson: 2.10, currency: 'PLN', region: 'Śląskie' },
    { cityName: 'Bydgoszcz', taxRatePerNightPerPerson: 1.90, currency: 'PLN', region: 'Kujawsko-Pomorskie' },
    { cityName: 'Szczecin', taxRatePerNightPerPerson: 2.20, currency: 'PLN', region: 'Zachodniopomorskie' },
  ];

  /**
   * Get tax rate for a specific city
   * 
   * @param cityName - Name of the city (case-insensitive, supports diacritics)
   * @returns Tax rate per person per night in PLN
   * @throws BadRequestException if city is not supported
   */
  getTaxRateForCity(cityName: string): number {
    if (!cityName || typeof cityName !== 'string') {
      throw new BadRequestException('City name is required');
    }

    // Normalize city name for lookup (case-insensitive)
    const normalizedCityName = cityName.trim();
    
    // Find exact match first (case-insensitive)
    const exactMatch = this.cityTaxRates.find(
      city => city.cityName.toLowerCase() === normalizedCityName.toLowerCase()
    );

    if (exactMatch) {
      this.logger.log(`✅ Tax rate found for ${cityName}: ${exactMatch.taxRatePerNightPerPerson} PLN`, {
        cityName: exactMatch.cityName,
        taxRate: exactMatch.taxRatePerNightPerPerson,
        region: exactMatch.region
      });
      
      return exactMatch.taxRatePerNightPerPerson;
    }

    // If no exact match, log available cities for debugging
    this.logger.warn(`❌ Tax rate not found for city: ${cityName}`, {
      availableCities: this.cityTaxRates.map(c => c.cityName).slice(0, 10) // First 10 for brevity
    });

    throw new BadRequestException(
      `Tourist tax rate not available for city: ${cityName}. ` +
      `Supported cities include: Kraków, Warszawa, Gdańsk, Wrocław, Poznań, Zakopane, and others.`
    );
  }

  /**
   * Get all supported cities
   * 
   * @returns Array of supported city names
   */
  getSupportedCities(): string[] {
    // Return unique city names (remove duplicates from alternative spellings)
    const uniqueCities = new Set(
      this.cityTaxRates
        .filter(city => !city.cityName.includes('Alternative') && !city.cityName.includes('English'))
        .map(city => city.cityName)
    );
    
    return Array.from(uniqueCities).sort();
  }

  /**
   * Calculate total tax amount
   * 
   * @param cityName - Name of the city
   * @param numberOfGuests - Number of guests
   * @param numberOfNights - Number of nights
   * @returns Total tax amount in PLN
   */
  calculateTotalTaxAmount(cityName: string, numberOfGuests: number, numberOfNights: number): number {
    const taxRatePerNightPerPerson = this.getTaxRateForCity(cityName);
    const totalAmount = numberOfGuests * numberOfNights * taxRatePerNightPerPerson;

    this.logger.log(`💰 Tax calculation for ${cityName}`, {
      cityName,
      numberOfGuests,
      numberOfNights,
      taxRatePerNightPerPerson,
      totalAmount
    });

    return Math.round(totalAmount * 100) / 100; // Round to 2 decimal places
  }
}
