/**
 * Reservation Entity
 * 
 * RESPONSIBILITY: Reservation data model for tourist tax payments
 * ARCHITECTURE: TypeScript interface for reservation data structure
 */

import { PaymentStatus, ReservationStatus, Currency } from '../dto/payment.dto';

export interface Reservation {
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

export interface Payment {
  paymentId: string;
  reservationId: string;
  status: PaymentStatus;
  amount: number;
  currency: Currency;
  paymentUrl: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  transactionId?: string;
  receiptUrl?: string;
  failureReason?: string;
  providerPaymentId?: string;
  webhookData?: any;
}

export interface PaymentProvider {
  name: string;
  baseUrl: string;
  merchantId: string;
  serviceKey: string;
  webhookSecret: string;
  supportedMethods: string[];
  isActive: boolean;
}

// Mock data for development
export const MOCK_CITIES = [
  { name: 'Kraków', taxPerNight: 2.50 },
  { name: 'Warszawa', taxPerNight: 3.00 },
  { name: 'Gdańsk', taxPerNight: 2.00 },
  { name: 'Wrocław', taxPerNight: 2.30 },
  { name: 'Poznań', taxPerNight: 2.20 },
  { name: 'Zakopane', taxPerNight: 3.50 },
] as const;

export const MOCK_ACCOMMODATIONS = [
  'Hotel Kraków',
  'Apartamenty Centrum',
  'Pensjonat Górski',
  'Villa Seaside',
  'Hostel Backpackers',
  'Resort & Spa',
] as const;

// Utility functions
export function calculateTotalTaxAmount(
  numberOfGuests: number,
  numberOfNights: number,
  taxAmountPerNight: number
): number {
  return Number((numberOfGuests * numberOfNights * taxAmountPerNight).toFixed(2));
}

export function generateReservationId(): string {
  return crypto.randomUUID();
}

export function generatePaymentId(): string {
  return `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function isReservationExpired(reservation: Reservation): boolean {
  const createdAt = new Date(reservation.createdAt);
  const now = new Date();
  const hoursDiff = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
  return hoursDiff > 24; // Reservations expire after 24 hours
}

export function isPaymentExpired(payment: Payment): boolean {
  const expiresAt = new Date(payment.expiresAt);
  const now = new Date();
  return now > expiresAt;
}

export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function validateReservationDates(checkInDate: string, checkOutDate: string): boolean {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const now = new Date();
  
  // Check-in must be today or in the future
  if (checkIn < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
    return false;
  }
  
  // Check-out must be after check-in
  if (checkOut <= checkIn) {
    return false;
  }
  
  return true;
}

export function calculateNumberOfNights(checkInDate: string, checkOutDate: string): number {
  const checkIn = new Date(checkInDate);
  const checkOut = new Date(checkOutDate);
  const timeDiff = checkOut.getTime() - checkIn.getTime();
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
}

// Status transition validation
export const VALID_RESERVATION_STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> = {
  [ReservationStatus.PENDING]: [ReservationStatus.PAID, ReservationStatus.FAILED, ReservationStatus.CANCELLED],
  [ReservationStatus.PAID]: [ReservationStatus.CANCELLED], // Can only cancel paid reservations
  [ReservationStatus.FAILED]: [ReservationStatus.PENDING, ReservationStatus.CANCELLED], // Can retry or cancel
  [ReservationStatus.CANCELLED]: [], // Terminal state
};

export const VALID_PAYMENT_STATUS_TRANSITIONS: Record<PaymentStatus, PaymentStatus[]> = {
  [PaymentStatus.PENDING]: [PaymentStatus.PROCESSING, PaymentStatus.FAILED, PaymentStatus.CANCELLED],
  [PaymentStatus.PROCESSING]: [PaymentStatus.COMPLETED, PaymentStatus.FAILED],
  [PaymentStatus.COMPLETED]: [], // Terminal state
  [PaymentStatus.FAILED]: [PaymentStatus.PENDING], // Can retry
  [PaymentStatus.CANCELLED]: [], // Terminal state
};

export function isValidStatusTransition(
  currentStatus: ReservationStatus | PaymentStatus,
  newStatus: ReservationStatus | PaymentStatus,
  type: 'reservation' | 'payment'
): boolean {
  const transitions = type === 'reservation' 
    ? VALID_RESERVATION_STATUS_TRANSITIONS 
    : VALID_PAYMENT_STATUS_TRANSITIONS;
  
  return transitions[currentStatus as any]?.includes(newStatus as any) || false;
}
