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
import { STORAGE_KEYS, UI_CONSTANTS } from '../../constants';
import { mockupApiService } from '../../platform/api/MockupApiService';
import { imojePaymentService } from '../../platform/api/ImojePaymentService';
import { logger } from '../../platform/CentralizedLogger';

// Types
interface Reservation {
  id: string;
  guestName: string;
  guestEmail: string;
  accommodationName: string;
  accommodationAddress: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  taxAmountPerNight: number;
  totalTaxAmount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  paymentUrl?: string;
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
      logger.info('🔍 Loading reservation', { reservationId: id });

      // Try to load from cache first
      const cached = storageService.get(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE);
      if (cached && typeof cached === 'object' && 'reservationId' in cached && 'reservation' in cached) {
        const cachedData = cached as { reservationId: string; reservation: Reservation };
        if (cachedData.reservationId === id) {
          logger.info('📋 Using cached reservation data', { reservationId: id });
          setReservation(cachedData.reservation);
          setIsLoadingReservation(false);
          return;
        }
      }

      // Load from Azure Storage via mockup API
      const response = await mockupApiService.getReservation(id);

      if (!response.success) {
        throw new Error(response.message || response.error || 'Failed to load reservation');
      }

      if (!response.data) {
        throw new Error('No reservation data received');
      }

      const reservation = response.data;
      setReservation(reservation);

      // Cache the reservation data
      storageService.set(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE, {
        reservationId: id,
        reservation,
        timestamp: new Date().toISOString()
      });

      logger.info('✅ Reservation loaded successfully', {
        reservationId: id,
        status: reservation.status,
        amount: reservation.totalTaxAmount
      });

      // Cache the reservation
      const cacheData = {
        reservationId: id,
        reservation: mockReservation,
        cachedAt: new Date().toISOString()
      };
      storageService.set(STORAGE_KEYS.TOURIST_TAX_FORM_CACHE, cacheData);

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
      storageService.set(STORAGE_KEYS.TOURIST_TAX_SESSION, {
        paymentStatus: mockPaymentStatus,
        reservationId: reservation.id
      });

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
      const isCompleted = Math.random() > 0.7;
      const mockUpdatedStatus: PaymentStatus = {
        ...paymentStatus,
        status: isCompleted ? 'completed' : 'processing',
        message: isCompleted ? 'Payment completed successfully!' : 'Payment is being processed...',
        lastUpdated: new Date(),
        ...(isCompleted && { receiptUrl: '/receipt/example.pdf' })
      };

      setPaymentStatus(mockUpdatedStatus);

      // Update stored status
      storageService.set(STORAGE_KEYS.TOURIST_TAX_SESSION, {
        paymentStatus: mockUpdatedStatus,
        reservationId: reservation?.id
      });

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
