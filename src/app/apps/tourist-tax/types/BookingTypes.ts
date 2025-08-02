// Booking.com Integration Types
// Type definitions for reservation import and management

export interface BookingReservation {
  id: string;
  reservationNumber: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCountry: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfPersons: number;
  numberOfNights: number;
  accommodationName: string;
  accommodationAddress?: string;
  status: 'confirmed' | 'cancelled' | 'no_show' | 'pending';
  totalPrice: number;
  commission: number;
  paymentStatus: string;
  bookingDate: string;
  specialRequests?: string;
  // City information (set during import)
  cityCode?: string;
  cityName?: string;
  // Calculated fields
  taxAmount?: number;
  taxStatus?: 'pending' | 'paid' | 'exempted';
  // Database timestamps (following mVAT patterns)
  createdAt?: string;
  updatedAt?: string;
}

export interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
}

export interface BookingExportColumn {
  index: number;
  name: string;
  mapping: keyof BookingReservation | null;
}

// Standard Booking.com export columns (based on actual export format)
export const BOOKING_COLUMNS: BookingExportColumn[] = [
  { index: 0, name: 'Numer rezerwacji', mapping: 'reservationNumber' },
  { index: 1, name: 'Zarezerwował(a)', mapping: null }, // Booker name (different from guest)
  { index: 2, name: 'Imię i nazwisko gości(a)', mapping: 'guestName' },
  { index: 3, name: 'Zameldowanie', mapping: 'checkInDate' },
  { index: 4, name: 'Wymeldowanie', mapping: 'checkOutDate' },
  { index: 5, name: 'Zarezerwowano dnia', mapping: 'bookingDate' },
  { index: 6, name: 'Status', mapping: 'status' },
  { index: 7, name: 'Pokoje', mapping: null },
  { index: 8, name: 'Osoby', mapping: 'numberOfPersons' },
  { index: 9, name: 'Dorośli', mapping: null },
  { index: 10, name: 'Dzieci', mapping: null },
  { index: 11, name: 'Wiek dzieci:', mapping: null },
  { index: 12, name: 'Cena', mapping: 'totalPrice' },
  { index: 13, name: 'Prowizja (%)', mapping: null },
  { index: 14, name: 'Kwota prowizji', mapping: 'commission' },
  { index: 15, name: 'Status płatności', mapping: 'paymentStatus' },
  { index: 16, name: 'Metoda płatności (dostawca płatności)', mapping: null },
  { index: 17, name: 'Uwagi', mapping: 'specialRequests' },
  { index: 18, name: 'Grupa rezerwujących', mapping: null },
  { index: 19, name: 'Booker country', mapping: 'guestCountry' },
  { index: 20, name: 'Powód podróży', mapping: null },
  { index: 21, name: 'Urządzenie', mapping: null },
  { index: 22, name: 'Rodzaj opcji zakwaterowania', mapping: 'accommodationName' }, // Property name
  { index: 23, name: 'Czas trwania (noce)', mapping: 'numberOfNights' },
  { index: 24, name: 'Data odwołania', mapping: null },
  { index: 25, name: 'Adres', mapping: null }, // Guest address, not property address
  { index: 26, name: 'Numer telefonu', mapping: 'guestPhone' }
];

export interface QRBillData {
  // Guest Information
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestNationality: string;

  // Accommodation Details
  accommodationName: string;
  accommodationAddress: string;
  accommodationType: string;

  // Stay Details
  checkInDate: string;
  checkOutDate: string;
  numberOfPersons: number;
  numberOfNights: number;

  // Tax Calculation
  cityName: string;
  taxRatePerNight: number;
  totalTaxAmount: number;

  // Bill Settings
  billLanguage: 'pl' | 'en' | 'dual';
  includeQRCode: boolean;
  includeInstructions: boolean;
}

export interface LandlordDashboardStats {
  totalReservations: number;
  pendingPayments: number;
  completedPayments: number;
  totalTaxCollected: number;
  thisMonthRevenue: number;
  averageStayLength: number;
  topNationalities: Array<{ country: string; count: number }>;
}

export interface PaymentBill {
  id: string;
  billNumber: string;
  reservationId: string;
  guestName: string;
  guestEmail: string;
  totalAmount: number;
  currency: string;
  status: 'generated' | 'sent' | 'paid' | 'expired';
  generatedDate: string;
  expiryDate: string;
  paymentUrl: string;
  qrCodeData: string;
  language: 'pl' | 'en' | 'dual';
}

export interface ReservationFilter {
  status?: BookingReservation['status'][];
  taxStatus?: BookingReservation['taxStatus'][];
  dateFrom?: string;
  dateTo?: string;
  guestCountry?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
}

export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'pdf';
  includeFields: (keyof BookingReservation)[];
  dateRange?: {
    from: string;
    to: string;
  };
  filter?: ReservationFilter;
}

// Utility types for form handling
export type BookingFormData = Omit<BookingReservation, 'id' | 'taxAmount' | 'taxStatus'>;

export interface ValidationError {
  field: keyof BookingReservation;
  message: string;
  row?: number;
}

export interface ImportResult {
  success: boolean;
  reservations: BookingReservation[];
  errors: ValidationError[];
  stats: ImportStats;
}
