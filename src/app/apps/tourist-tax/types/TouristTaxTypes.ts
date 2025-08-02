export interface TouristTaxData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;

  // Stay Details
  cityCode: string;
  cityName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfPersons: number;

  // Accommodation Details
  accommodationType: 'hotel' | 'apartment' | 'hostel' | 'camping' | 'other';
  accommodationName?: string;
  accommodationAddress?: string;

  // Tax Calculation
  taxRatePerNight: number;
  totalTaxAmount: number;

  // GDPR Consents
  gdprConsents: GDPRConsent[];
}

export interface GDPRConsent {
  type: 'data_processing' | 'email_marketing' | 'analytics';
  given: boolean;
  timestamp: string;
  ipAddress?: string;
}

export interface CityTaxRate {
  cityCode: string;
  cityName: string;
  taxRatePerNight: number;
  currency: 'PLN';
  effectiveFrom: string;
  effectiveTo?: string;
  description?: string;
}

export interface PaymentRequest {
  touristData: TouristTaxData;
  taxAmount: number;
  currency: 'PLN';
  description: string;
}

export interface PaymentResponse {
  transactionId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  errorMessage?: string;
}

export type PaymentStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface Transaction {
  id: string;
  transactionId: string;
  touristEmail: string;
  cityCode: string;
  cityName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  numberOfPersons: number;
  taxRatePerNight: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  tpayTransactionId?: string;
  createdAt: string;
  updatedAt: string;
  gdprConsents: GDPRConsent[];
}

export interface TaxCalculationRequest {
  cityCode: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfPersons: number;
}

export interface TaxCalculationResponse {
  numberOfNights: number;
  taxRatePerNight: number;
  totalTaxAmount: number;
  currency: 'PLN';
  breakdown: {
    baseRate: number;
    discounts?: TaxDiscount[];
    exemptions?: TaxExemption[];
  };
}

export interface TaxDiscount {
  type: 'children' | 'seniors' | 'students' | 'disabled';
  description: string;
  discountAmount: number;
  discountPercentage: number;
}

export interface TaxExemption {
  type: 'business' | 'medical' | 'official';
  description: string;
  exemptionAmount: number;
}

export interface EmailConfirmation {
  transactionId: string;
  recipientEmail: string;
  subject: string;
  templateType: 'payment_confirmation' | 'payment_failed' | 'refund_processed';
  templateData: {
    touristName: string;
    cityName: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfNights: number;
    totalAmount: number;
    transactionId: string;
    paymentDate: string;
  };
}

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code: string;
    details?: any;
  };
}

// Local Storage Types
export interface LocalStorageData {
  formData?: Partial<TouristTaxData>;
  recentTransactions?: Transaction[];
  userPreferences?: UserPreferences;
}

export interface UserPreferences {
  language: 'pl' | 'en';
  currency: 'PLN';
  rememberFormData: boolean;
  emailNotifications: boolean;
}

// Tpay Integration Types
export interface TpayPaymentRequest {
  amount: number;
  description: string;
  crc: string;
  return_url: string;
  return_error_url: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  zip?: string;
  country?: string;
  language: 'pl' | 'en';
  currency: 'PLN';
  group?: number;
  accept_tos: 1;
}

export interface TpayPaymentResponse {
  result: 1 | 0;
  title: string;
  url?: string;
  err?: string;
}

export interface TpayNotification {
  id: string;
  tr_id: string;
  tr_date: string;
  tr_crc: string;
  tr_amount: number;
  tr_paid: number;
  tr_desc: string;
  tr_status: 'TRUE' | 'FALSE';
  tr_error: string;
  tr_email: string;
  md5sum: string;
}
