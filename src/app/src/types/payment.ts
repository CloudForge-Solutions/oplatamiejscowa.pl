/**
 * Payment Types
 * 
 * RESPONSIBILITY: TypeScript type definitions for payment system
 * ARCHITECTURE: Shared types between frontend and backend
 */

// Enums matching backend
export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum ReservationStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum Currency {
  PLN = 'PLN',
  EUR = 'EUR',
  USD = 'USD',
}

// Request Types
export interface CreateReservationRequest {
  guestName: string;
  guestEmail: string;
  accommodationName: string;
  accommodationAddress: string;
  checkInDate: string; // ISO date string
  checkOutDate: string; // ISO date string
  numberOfGuests: number;
  numberOfNights: number;
  taxAmountPerNight: number;
  totalTaxAmount: number;
  currency: Currency;
  cityName?: string;
}

export interface InitiatePaymentRequest {
  reservationId: string;
  successUrl: string;
  failureUrl: string;
  paymentMethod?: string;
}

export interface PaymentWebhookRequest {
  paymentId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  transactionId: string;
  timestamp: string;
  signature?: string;
}

// Response Types
export interface ReservationResponse {
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
  currency: Currency;
  status: ReservationStatus;
  createdAt: string;
  updatedAt: string;
  paymentId?: string;
  paymentUrl?: string;
  cityName?: string;
}

export interface PaymentResponse {
  paymentId: string;
  reservationId: string;
  status: PaymentStatus;
  paymentUrl: string;
  amount: number;
  currency: Currency;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentStatusResponse {
  paymentId: string;
  reservationId: string;
  status: PaymentStatus;
  message: string;
  lastUpdated: string;
  amount: number;
  currency: Currency;
  transactionId?: string;
  receiptUrl?: string;
  failureReason?: string;
}

export interface PaymentServiceStatusResponse {
  status: 'available' | 'unavailable';
  message: string;
  timestamp: string;
}

// Form Data Types
export interface PaymentFormData {
  // Guest Information
  guestName: string;
  guestEmail: string;
  
  // Accommodation Details
  accommodationName: string;
  accommodationAddress: string;
  cityName: string;
  
  // Stay Details
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  
  // Tax Calculation
  taxAmountPerNight: number;
  totalTaxAmount: number;
  currency: Currency;
  
  // Payment Preferences
  paymentMethod?: string;
  
  // URLs for redirect
  successUrl?: string;
  failureUrl?: string;
}

// State Management Types
export interface PaymentState {
  // Current step in payment flow
  currentStep: 'form' | 'review' | 'payment' | 'processing' | 'success' | 'error';
  
  // Form data
  formData: Partial<PaymentFormData>;
  formErrors: Record<string, string>;
  
  // Reservation
  reservation: ReservationResponse | null;
  reservationLoading: boolean;
  reservationError: string | null;
  
  // Payment
  payment: PaymentResponse | null;
  paymentStatus: PaymentStatusResponse | null;
  paymentLoading: boolean;
  paymentError: string | null;
  
  // Polling
  isPolling: boolean;
  pollingAttempts: number;
  
  // UI State
  isSubmitting: boolean;
  showConfirmation: boolean;
}

// API Response Wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    statusCode?: number;
  };
  success: boolean;
  timestamp: string;
}

// Utility Types
export interface PaymentCalculation {
  numberOfGuests: number;
  numberOfNights: number;
  taxAmountPerNight: number;
  totalTaxAmount: number;
  currency: Currency;
  breakdown: {
    guestsText: string;
    nightsText: string;
    rateText: string;
    totalText: string;
  };
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: string[];
}

// Event Types for EventBus
export interface PaymentEvents {
  'payment:reservation-created': { reservation: ReservationResponse };
  'payment:payment-initiated': { payment: PaymentResponse };
  'payment:status-updated': { status: PaymentStatusResponse };
  'payment:completed': { payment: PaymentStatusResponse; reservation: ReservationResponse };
  'payment:failed': { error: string; payment?: PaymentStatusResponse };
  'payment:cancelled': { payment?: PaymentStatusResponse };
  'payment:form-updated': { formData: Partial<PaymentFormData> };
  'payment:step-changed': { step: PaymentState['currentStep']; previousStep?: PaymentState['currentStep'] };
}

// Configuration Types
export interface PaymentConfig {
  apiBaseUrl: string;
  pollingInterval: number;
  maxPollingAttempts: number;
  timeoutMs: number;
  retryAttempts: number;
  retryDelayMs: number;
  enableLogging: boolean;
  enableCaching: boolean;
  cacheTtlMs: number;
}

// City/Tax Configuration
export interface CityTaxConfig {
  name: string;
  taxPerNight: number;
  currency: Currency;
  minNights?: number;
  maxNights?: number;
  exemptions?: string[];
  description?: string;
}

// Error Types
export class PaymentError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public details?: any
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

export class ValidationError extends PaymentError {
  constructor(message: string, public field?: string, details?: any) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends PaymentError {
  constructor(message: string, statusCode?: number, details?: any) {
    super(message, 'NETWORK_ERROR', statusCode, details);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends PaymentError {
  constructor(message: string = 'Request timeout', details?: any) {
    super(message, 'TIMEOUT_ERROR', 408, details);
    this.name = 'TimeoutError';
  }
}
