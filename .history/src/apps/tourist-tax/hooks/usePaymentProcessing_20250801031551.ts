import { useState, useCallback } from 'react';
import { TouristTaxData, PaymentStatus } from '../types/TouristTaxTypes';
import {
  ImojePaymentService,
  ImojePaymentRequest,
  ImojeConfig
} from '../services/ImojePaymentService';
import { DBTransaction } from '../../../platform/storage/IndexedDBManager';
import { useLocalStorage } from './useLocalStorage';
import { v4 as uuidv4 } from 'uuid';

interface PaymentProcessingRequest {
  touristData: TouristTaxData;
  taxAmount: number;
}

interface PaymentProcessingResult {
  transactionId: string;
  status: PaymentStatus;
  paymentUrl?: string;
  errorMessage?: string;
}

interface UsePaymentProcessingReturn {
  processPayment: (request: PaymentProcessingRequest) => Promise<PaymentProcessingResult>;
  checkPaymentStatus: (transactionId: string) => Promise<PaymentStatus>;
  isProcessing: boolean;
  error: string | null;
  clearError: () => void;
}

// imoje configuration - in production, these should come from environment variables
const IMOJE_CONFIG: ImojeConfig = {
  merchantId: import.meta.env.VITE_IMOJE_MERCHANT_ID ?? 'demo-merchant',
  serviceId: import.meta.env.VITE_IMOJE_SERVICE_ID ?? 'demo-service',
  serviceKey: import.meta.env.VITE_IMOJE_SERVICE_KEY ?? 'demo-key',
  environment: (import.meta.env.VITE_IMOJE_ENVIRONMENT as 'sandbox' | 'production') ?? 'sandbox',
  apiUrl: import.meta.env.VITE_IMOJE_API_URL ?? 'https://sandbox.imoje.pl/api/v1',
  jsUrl: import.meta.env.VITE_IMOJE_JS_URL ?? 'https://sandbox.imoje.pl/js/imoje.min.js'
};

let imojeServiceInstance: ImojePaymentService | null = null;

const getImojeService = async (): Promise<ImojePaymentService> => {
  if (!imojeServiceInstance) {
    imojeServiceInstance = new ImojePaymentService(IMOJE_CONFIG);
    await imojeServiceInstance.initialize();
  }
  return imojeServiceInstance;
};

export const usePaymentProcessing = (): UsePaymentProcessingReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addTransaction, updateSessionData } = useLocalStorage();

  const processPayment = useCallback(
    async (request: PaymentProcessingRequest): Promise<PaymentProcessingResult> => {
      setIsProcessing(true);
      setError(null);

      try {
        // Generate unique transaction ID
        const transactionId = uuidv4();
        const orderId = `TAX-${Date.now()}-${transactionId.slice(0, 8)}`;

        // Create transaction record
        const transaction: DBTransaction = {
          id: transactionId,
          transactionId: orderId,
          touristEmail: request.touristData.email,
          cityCode: request.touristData.cityCode,
          cityName: request.touristData.cityName,
          checkInDate: request.touristData.checkInDate,
          checkOutDate: request.touristData.checkOutDate,
          numberOfNights: request.touristData.numberOfNights,
          numberOfPersons: request.touristData.numberOfPersons,
          taxRatePerNight: request.touristData.taxRatePerNight,
          totalAmount: request.taxAmount,
          paymentStatus: 'pending',
          paymentProvider: 'imoje',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          gdprConsents: request.touristData.gdprConsents
        };

        // Store transaction in browser storage
        await addTransaction(transaction);

        // Update session data
        updateSessionData({
          currentTransactionId: orderId,
          paymentInProgress: true
        });

        // Initialize imoje service
        const imojeService = await getImojeService();

        // Prepare payment request
        const paymentRequest: ImojePaymentRequest = {
          amount: request.taxAmount,
          currency: 'PLN',
          orderId: orderId,
          description: `Opłata miejscowa - ${request.touristData.cityName} (${request.touristData.numberOfNights} nocy)`,
          customerEmail: request.touristData.email,
          customerName: `${request.touristData.firstName} ${request.touristData.lastName}`,
          customerPhone: request.touristData.phone,
          returnUrl: `${window.location.origin}/payment-result?orderId=${orderId}`,
          notifyUrl: `${window.location.origin}/api/payment-notification`, // This would be handled by a backend in production
          language: 'pl',
          validityTime: 30 // 30 minutes validity
        };

        // Create payment with imoje
        const paymentResponse = await imojeService.createPayment(paymentRequest);

        if (paymentResponse.success && paymentResponse.paymentUrl) {
          // Update transaction with payment ID
          transaction.providerTransactionId = paymentResponse.paymentId;
          transaction.paymentStatus = 'processing';
          transaction.updatedAt = new Date().toISOString();
          await addTransaction(transaction);

          return {
            transactionId: orderId,
            status: 'processing',
            paymentUrl: paymentResponse.paymentUrl
          };
        } else {
          // Payment creation failed
          transaction.paymentStatus = 'failed';
          transaction.updatedAt = new Date().toISOString();
          await addTransaction(transaction);

          const errorMessage = paymentResponse.error?.message ?? 'Failed to create payment';
          setError(errorMessage);

          return {
            transactionId: orderId,
            status: 'failed',
            errorMessage
          };
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
        setError(errorMessage);
        console.error('Payment processing error:', err);

        return {
          transactionId: '',
          status: 'failed',
          errorMessage
        };
      } finally {
        setIsProcessing(false);
      }
    },
    [addTransaction, updateSessionData]
  );

  const checkPaymentStatus = useCallback(async (transactionId: string): Promise<PaymentStatus> => {
    try {
      const _imojeService = await getImojeService();

      // In a real implementation, we would need the imoje payment ID
      // For now, we'll simulate status checking
      // This would typically involve calling imojeService.getPaymentStatus(paymentId)

      // Placeholder implementation - in production, this would check actual payment status
      console.log('Checking payment status for transaction:', transactionId);

      // Return a default status - this should be replaced with actual imoje API call
      return 'pending';
    } catch (error) {
      console.error('Failed to check payment status:', error);
      return 'failed';
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    processPayment,
    checkPaymentStatus,
    isProcessing,
    error,
    clearError
  };
};
