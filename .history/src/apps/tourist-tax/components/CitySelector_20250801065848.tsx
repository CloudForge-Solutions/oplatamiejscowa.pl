import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Alert, Button, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { CityTaxRate } from '../types/TouristTaxTypes';
import { TaxCalculationService } from '../services/TaxCalculationService';

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
        const response = await TaxCalculationService.getAvailableCities();

        if (response.success && response.data) {
          setCities(response.data);
          setFilteredCities(response.data);
        } else {
          setError(response.error?.message ?? 'Failed to load cities');
        }
      } catch (err) {
        setError('Failed to load cities');
        console.error('Error loading cities:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCities();
  }, []);

  // Filter cities based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCities(cities);
    } else {
      const filtered = cities.filter(
        city =>
          city.cityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          city.cityCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCities(filtered);
    }
  }, [searchTerm, cities]);

  const selectedCity = cities.find(city => city.cityCode === selectedCityCode);

  const handleCitySelect = (city: CityTaxRate) => {
    onCitySelect(city.cityCode, city.cityName);
    setSearchTerm('');
    setShowDropdown(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowDropdown(true);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const handleInputBlur = () => {
    // Delay hiding dropdown to allow for city selection
    setTimeout(() => setShowDropdown(false), 200);
  };

  const handlePopularCitySelect = (cityCode: string) => {
    const city = cities.find(c => c.cityCode === cityCode);
    if (city) {
      handleCitySelect(city);
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
      <Form.Label>{t('fields.city')} *</Form.Label>
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
          <div
            className='dropdown-menu show w-100 mt-1'
            style={{ maxHeight: '200px', overflowY: 'auto' }}
          >
            {filteredCities.length > 0 ? (
              filteredCities.map(city => (
                <button
                  key={city.cityCode}
                  type='button'
                  className={`dropdown-item ${selectedCityCode === city.cityCode ? 'active' : ''}`}
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
