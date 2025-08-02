/**
 * Reservation Interface
 * Defines the structure for reservation data
 */

export interface ReservationData {
  id?: string;
  cityCode: string;
  cityName: string;
  bookingPlatform: string;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  taxAmount: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentId?: string;
  createdAt?: string;
  updatedAt?: string;
}
