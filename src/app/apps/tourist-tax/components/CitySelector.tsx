import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Alert, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CityTaxRate } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';

// CSS styles to fix dropdown transparency issues
const dropdownStyles = `
  .city-dropdown-menu {
    background-color: white !important;
    border: 1px solid rgba(0,0,0,.15) !important;
    border-radius: 0.375rem !important;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    opacity: 1 !important;
    z-index: 1050 !important;
    max-height: 200px !important;
    overflow-y: auto !important;
  }

  .city-dropdown-item {
    background-color: white !important;
    opacity: 1 !important;
    transition: background-color 0.15s ease-in-out !important;
    border: none !important;
    color: #212529 !important;
    padding: 0.5rem 1rem !important;
    width: 100% !important;
    text-align: left !important;
    display: block !important;
  }

  .city-dropdown-item:hover {
    background-color: #f8f9fa !important;
    opacity: 1 !important;
    color: #212529 !important;
  }

  .city-dropdown-item.active {
    background-color: #0d6efd !important;
    color: white !important;
    opacity: 1 !important;
  }

  .city-dropdown-item.active:hover {
    background-color: #0b5ed7 !important;
    opacity: 1 !important;
    color: white !important;
  }

  .city-dropdown-item:focus {
    background-color: #f8f9fa !important;
    outline: none !important;
  }

  .city-dropdown-item.active:focus {
    background-color: #0b5ed7 !important;
    color: white !important;
  }
`;

// Simple logger for consistency
const logger = {
  error: (message: string, data?: any) => console.error(`[CitySelector] ${message}`, data || ''),
  info: (message: string, data?: any) => console.log(`[CitySelector] ${message}`, data || ''),
  debug: (message: string, data?: any) => import.meta.env.DEV && console.debug(`[CitySelector] ${message}`, data || '')
};

interface CitySelectorProps {
  selectedCityCode: string;
  onCitySelect: (cityCode: string, cityName: string) => void;
  isInvalid?: boolean;
  errorMessage?: string;
}

// Most popular tourist cities in Poland for quick selection
const POPULAR_CITIES = [
  { code: 'KRK', name: 'Kraków', icon: '🏰' },
  { code: 'WAW', name: 'Warszawa', icon: '🏛️' },
  { code: 'GDN', name: 'Gdańsk', icon: '⚓' },
  { code: 'ZAK', name: 'Zakopane', icon: '🏔️' },
  { code: 'WRO', name: 'Wrocław', icon: '🌉' },
  { code: 'POZ', name: 'Poznań', icon: '🏛️' }
];

const CitySelector: React.FC<CitySelectorProps> = ({
  selectedCityCode,
  onCitySelect,
  isInvalid = false,
  errorMessage
}) => {
  const { t } = useTranslation('tourist-tax');
  const [cities, setCities] = useState<CityTaxRate[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityTaxRate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoading(true);
        setError(null);

        logger.debug('Loading cities...');
        const response = await TaxCalculationService.getAvailableCities();

        if (response.success && response.data) {
          // Validate city data
          const validCities = response.data.filter(city => {
            if (!city || !city.cityCode || !city.cityName) {
              logger.debug('Invalid city data filtered out', city);
              return false;
            }
            return true;
          });

          logger.debug('Cities loaded successfully', { count: validCities.length });
          setCities(validCities);
          setFilteredCities(validCities);
        } else {
          const errorMessage = response.error?.message ?? 'Failed to load cities';
          logger.error('Failed to load cities', response.error);
          setError(errorMessage);
        }
      } catch (err) {
        const errorMessage = 'Failed to load cities';
        logger.error('Error loading cities', err);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    try {
      if (!searchTerm.trim()) {
        setFilteredCities(cities || []);
      } else {
        const filtered = (cities || []).filter(
          city => {
            if (!city || !city.cityName || !city.cityCode) {
              logger.debug('Invalid city data found', city);
              return false;
            }
            return (
              city.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              city.cityCode.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
        );
        setFilteredCities(filtered);
      }
    } catch (error) {
      logger.error('Error filtering cities', error);
      setFilteredCities([]);
    }
  }, [searchTerm, cities]);

  const selectedCity = cities.find(city => city.cityCode === selectedCityCode);

  const handleCitySelect = (city: CityTaxRate) => {
    try {
      if (!city || !city.cityCode || !city.cityName) {
        logger.error('Invalid city data for selection', city);
        return;
      }

      logger.debug('City selected', { cityCode: city.cityCode, cityName: city.cityName });
      onCitySelect(city.cityCode, city.cityName);
      setSearchTerm('');
      setShowDropdown(false);
    } catch (error) {
      logger.error('Error selecting city', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const value = e.target.value || '';
      setSearchTerm(value);
      setShowDropdown(true);
    } catch (error) {
      logger.error('Error handling search change', error);
    }
  };

  const handleInputFocus = () => {
    try {
      setShowDropdown(true);
    } catch (error) {
      logger.error('Error handling input focus', error);
    }
  };

  const handleInputBlur = () => {
    try {
      // Delay hiding dropdown to allow for city selection
      setTimeout(() => setShowDropdown(false), 200);
    } catch (error) {
      logger.error('Error handling input blur', error);
    }
  };

  const handlePopularCitySelect = (cityCode: string) => {
    try {
      if (!cityCode) {
        logger.error('Invalid city code for popular city selection', cityCode);
        return;
      }

      const city = cities.find(c => c && c.cityCode === cityCode);
      if (city) {
        logger.debug('Popular city selected', { cityCode, cityName: city.cityName });
        handleCitySelect(city);
      } else {
        logger.error('Popular city not found in cities list', { cityCode, availableCities: cities.map(c => c?.cityCode) });
      }
    } catch (error) {
      logger.error('Error selecting popular city', error);
    }
  };

  if (isLoading) {
    return (
      <Form.Group className='mb-3'>
        <Form.Label>{t('fields.city')} *</Form.Label>
        <Form.Control type='text' placeholder={t('cities.selectCity')} disabled />
        <Form.Text className='text-muted'>Ładowanie miast...</Form.Text>
      </Form.Group>
    );
  }

  if (error) {
    return (
      <Form.Group className='mb-3'>
        <Form.Label>{t('fields.city')} *</Form.Label>
        <Alert variant='danger' className='mb-2'>
          {error}
        </Alert>
      </Form.Group>
    );
  }

  return (
    <Form.Group className='mb-3'>
      {/* Inject CSS styles to fix dropdown transparency */}
      <style>{dropdownStyles}</style>

      <Form.Label>{t('fields.city')} *</Form.Label>

      {/* Popular Cities Quick Select */}
      <div className='mb-3'>
        <small className='text-muted d-block mb-2'>
          {t('cities.popularCities', 'Najpopularniejsze miasta:')}
        </small>
        <Row className='g-2'>
          {POPULAR_CITIES.map(city => {
            const isSelected = selectedCityCode === city.code;
            const cityData = cities.find(c => c.cityCode === city.code);
            return (
              <Col xs={6} sm={4} md={3} key={city.code}>
                <Button
                  variant={isSelected ? 'primary' : 'outline-primary'}
                  size='sm'
                  className='w-100 d-flex align-items-center justify-content-center'
                  onClick={() => handlePopularCitySelect(city.code)}
                  disabled={!cityData}
                >
                  <span className='me-1'>{city.icon}</span>
                  <span className='text-truncate'>{city.name}</span>
                </Button>
              </Col>
            );
          })}
        </Row>
      </div>

      <div className='position-relative'>
        <InputGroup>
          <Form.Control
            type='text'
            value={selectedCity ? selectedCity.cityName : searchTerm}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            placeholder={t('cities.searchPlaceholder')}
            isInvalid={isInvalid}
          />
        </InputGroup>

        {showDropdown && (
          <div className='city-dropdown-menu position-absolute w-100 mt-1'>
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <button
                  key={city.cityCode}
                  type='button'
                  className={`city-dropdown-item dropdown-item ${selectedCityCode === city.cityCode ? 'active' : ''}`}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className='d-flex justify-content-between align-items-center'>
                    <div>
                      <strong>{city.cityName}</strong>
                      <small className='text-muted d-block'>{city.cityCode}</small>
                    </div>
                    <div className='text-end'>
                      <small className='text-muted'>{t('cities.taxRate')}</small>
                      <div className='fw-bold'>
                        {TaxCalculationService.formatCurrency(city.taxRatePerNight)}
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className='dropdown-item-text text-muted'>{t('cities.noResults')}</div>
            )}
          </div>
        )}
      </div>

      {selectedCity && (
        <Form.Text className='text-muted'>
          {t('cities.taxRate')}:{' '}
          <strong>{TaxCalculationService.formatCurrency(selectedCity.taxRatePerNight)}</strong> za
          noc
        </Form.Text>
      )}

      {isInvalid && errorMessage && <div className='invalid-feedback d-block'>{errorMessage}</div>}
    </Form.Group>
  );
};

export default CitySelector;
