/**
 * Tourist Tax Context - Layer 3 (Dynamic)
 * 
 * RESPONSIBILITY: Manage current payment state and reservation data
 * ARCHITECTURE: Changes during payment flow, handles status updates via polling
 * FEATURES: URL synchronization, localStorage caching, automatic data reloading
 */

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useQueryParam, StringParam } from 'use-query-params';
import { useParams } from 'react-router-dom';

import { useStorageService, useApiService } from './ServiceContext';
import { STORAGE_KEYS, API_ENDPOINTS, UI_CONSTANTS } from '../../constants';

// Types
interface Reservation {
  id: string;
  cityName: string;
  accommodationName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  guests: number;
  totalAmount: number;
  currency: string;
}

interface PaymentStatus {
  id?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message: string;
  lastUpdated: Date;
  receiptUrl?: string;
}

interface TouristTaxContextType {
  // Current state
  reservationId: string | null;
  reservation: Reservation | null;
  paymentStatus: PaymentStatus | null;
  
  // Loading states
  isLoadingReservation: boolean;
  isLoadingPayment: boolean;
  isPolling: boolean;
  
  // Error states
  reservationError: string | null;
  paymentError: string | null;
  
  // Actions
  loadReservation: (id: string) => Promise<void>;
  initiatePayment: () => Promise<void>;
  checkPaymentStatus: () => Promise<void>;
  clearErrors: () => void;
}

const TouristTaxContext = createContext<TouristTaxContextType | undefined>(undefined);

interface TouristTaxProviderProps {
  children: ReactNode;
}

export const TouristTaxProvider: React.FC<TouristTaxProviderProps> = ({ children }) => {
  const { reservationId: routeReservationId } = useParams<{ reservationId: string }>();
  const [reservationParam, setReservationParam] = useQueryParam('r', StringParam);
  
  const storageService = useStorageService();
  const apiService = useApiService();
  
  // State
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  
  // Loading states
  const [isLoadingReservation, setIsLoadingReservation] = useState(false);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  
  // Error states
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Initialize reservation ID from route or URL param
  useEffect(() => {
    const currentId = routeReservationId || reservationParam;
    if (currentId && currentId !== reservationId) {
      setReservationId(currentId);
      
      // Update URL param if needed (two-way sync)
      if (!reservationParam || reservationParam !== currentId) {
        setReservationParam(currentId);
      }
    }
  }, [routeReservationId, reservationParam, reservationId, setReservationParam]);

  // Load reservation when ID changes
  useEffect(() => {
    if (reservationId) {
      loadReservation(reservationId);
    }
  }, [reservationId]);

  // Polling for payment status
  useEffect(() => {
    if (paymentStatus?.status === 'processing') {
      const interval = setInterval(() => {
        checkPaymentStatus();
      }, UI_CONSTANTS.POLLING_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [paymentStatus?.status]);

  const loadReservation = async (id: string): Promise<void> => {
    setIsLoadingReservation(true);
    setReservationError(null);
    
    try {
      // Try to load from cache first
      const cached = storageService.get(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE);
      if (cached) {
        try {
          const cachedData = JSON.parse(cached);
          if (cachedData.reservationId === id) {
            setReservation(cachedData.reservation);
          }
        } catch (error) {
          console.warn('Failed to parse cached reservation:', error);
        }
      }

      // TODO: Load from blob storage via SAS token
      // const response = await apiService.get(`${API_ENDPOINTS.GENERATE_SAS}/${id}`);
      // const reservationData = await fetchFromBlob(response.sasUrl);
      
      // Mock data for development
      const mockReservation: Reservation = {
        id,
        cityName: 'Kraków',
        accommodationName: 'Hotel Example',
        checkInDate: '2024-08-15',
        checkOutDate: '2024-08-18',
        numberOfNights: 3,
        guests: 2,
        totalAmount: 18.00,
        currency: 'PLN'
      };
      
      setReservation(mockReservation);
      
      // Cache the reservation
      const cacheData = {
        reservationId: id,
        reservation: mockReservation,
        cachedAt: new Date().toISOString()
      };
      storageService.set(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE, JSON.stringify(cacheData));
      
    } catch (error) {
      console.error('Failed to load reservation:', error);
      setReservationError('Failed to load reservation details. Please try again.');
    } finally {
      setIsLoadingReservation(false);
    }
  };

  const initiatePayment = async (): Promise<void> => {
    if (!reservation) return;
    
    setIsLoadingPayment(true);
    setPaymentError(null);
    
    try {
      // TODO: Call actual payment API
      // const response = await apiService.post(API_ENDPOINTS.INITIATE_PAYMENT, {
      //   reservationId: reservation.id,
      //   amount: reservation.totalAmount,
      //   currency: reservation.currency
      // });
      
      // Mock payment initiation
      const mockPaymentStatus: PaymentStatus = {
        id: 'payment-' + Date.now(),
        status: 'processing',
        message: 'Payment is being processed...',
        lastUpdated: new Date()
      };
      
      setPaymentStatus(mockPaymentStatus);
      
      // Store payment status
      storageService.set(STORAGE_KEYS.TOURIST_TAX_SESSION, JSON.stringify({
        paymentStatus: mockPaymentStatus,
        reservationId: reservation.id
      }));
      
    } catch (error) {
      console.error('Failed to initiate payment:', error);
      setPaymentError('Failed to initiate payment. Please try again.');
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const checkPaymentStatus = async (): Promise<void> => {
    if (!paymentStatus?.id) return;
    
    setIsPolling(true);
    
    try {
      // TODO: Call actual status API
      // const response = await apiService.get(`${API_ENDPOINTS.PAYMENT_STATUS}/${paymentStatus.id}`);
      
      // Mock status check
      const mockUpdatedStatus: PaymentStatus = {
        ...paymentStatus,
        status: Math.random() > 0.7 ? 'completed' : 'processing',
        message: Math.random() > 0.7 ? 'Payment completed successfully!' : 'Payment is being processed...',
        lastUpdated: new Date(),
        receiptUrl: Math.random() > 0.7 ? '/receipt/example.pdf' : undefined
      };
      
      setPaymentStatus(mockUpdatedStatus);
      
      // Update stored status
      storageService.set(STORAGE_KEYS.TOURIST_TAX_SESSION, JSON.stringify({
        paymentStatus: mockUpdatedStatus,
        reservationId: reservation?.id
      }));
      
    } catch (error) {
      console.error('Failed to check payment status:', error);
    } finally {
      setIsPolling(false);
    }
  };

  const clearErrors = (): void => {
    setReservationError(null);
    setPaymentError(null);
  };

  const contextValue: TouristTaxContextType = {
    reservationId,
    reservation,
    paymentStatus,
    isLoadingReservation,
    isLoadingPayment,
    isPolling,
    reservationError,
    paymentError,
    loadReservation,
    initiatePayment,
    checkPaymentStatus,
    clearErrors
  };

  return (
    <TouristTaxContext.Provider value={contextValue}>
      {children}
    </TouristTaxContext.Provider>
  );
};

export const useTouristTax = (): TouristTaxContextType => {
  const context = useContext(TouristTaxContext);
  if (context === undefined) {
    throw new Error('useTouristTax must be used within a TouristTaxProvider');
  }
  return context;
};
