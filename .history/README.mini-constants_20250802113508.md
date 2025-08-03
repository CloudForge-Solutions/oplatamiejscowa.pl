# Constants Architecture - Tourist Tax Payment System

## 🏗️ Architecture Principle: Barrel Import Pattern

All constants must be imported via the barrel import pattern to maintain clean architecture and prevent direct domain imports.

### ✅ ALLOWED - Barrel Import Only
```typescript
import { STORAGE_KEYS, EVENT_NAMES } from '@constants';
```

### ❌ FORBIDDEN - Direct Domain Imports
```typescript
import { PAYMENT_STATUS } from '../apps/payment/constants';
import { RESERVATION_STATES } from '../platform/constants/ReservationConstants';
```

## 📁 Constants Structure

```
src/app/constants/
├── index.ts                    # Barrel export - MAIN ENTRY POINT
├── StorageConstants.ts         # Storage keys and types
├── EventConstants.ts           # EventBus event names
├── PaymentConstants.ts         # Payment-related constants
├── UIConstants.ts              # UI states and constants
├── ApiConstants.ts             # API endpoints and configuration
└── ValidationConstants.ts      # Validation rules and patterns
```

## 🔑 Storage Keys Architecture

### localStorage Keys (Synchronous)
```typescript
export const STORAGE_KEYS = {
  // User preferences (language, theme, form auto-save settings)
  PREFERENCES: 'tourist-tax-preferences',

  // Form data cache (city, dates, guest count - non-sensitive data only)
  FORM_CACHE: 'tourist-tax-form-cache',

  // Session data (current payment step, UI state)
  SESSION: 'tourist-tax-session',

  // GDPR consents metadata (consent status, timestamps)
  GDPR_CONSENTS: 'tourist-tax-gdpr-consents',

  // Payment status cache (for immediate UI feedback)
  PAYMENT_STATUS_CACHE: 'tourist-tax-payment-status',

  // App version for compatibility
  APP_VERSION: 'tourist-tax-app-version',

  // SAS token cache (non-expiring tokens)
  SAS_TOKEN_CACHE: 'tourist-tax-sas-tokens'
} as const;
```

### IndexedDB Database Structure (Asynchronous)
```typescript
export const INDEXEDDB_CONFIG = {
  DATABASE_NAME: 'TouristTaxDB',
  VERSION: 1,
  STORES: {
    TRANSACTIONS: 'transactions',
    PREFERENCES: 'preferences',
    CONSENTS: 'consents',
    AUDIT_LOGS: 'audit_logs'
  }
} as const;
```

## 🎯 Event Names Architecture

### EventBus Event Categories
```typescript
export const EVENT_NAMES = {
  // Payment Events
  PAYMENT: {
    STATUS_UPDATED: 'payment:status-updated',
    PROCESSING_STARTED: 'payment:processing-started',
    COMPLETED: 'payment:completed',
    FAILED: 'payment:failed',
    CANCELLED: 'payment:cancelled'
  },

  // Language Events
  LANGUAGE: {
    CHANGED: 'language:changed',
    LOADING: 'language:loading',
    ERROR: 'language:error'
  },

  // Storage Events
  STORAGE: {
    DATA_UPDATED: 'storage:data-updated',
    CACHE_CLEARED: 'storage:cache-cleared',
    ERROR: 'storage:error'
  },

  // UI Events
  UI: {
    MODAL_OPENED: 'ui:modal-opened',
    MODAL_CLOSED: 'ui:modal-closed',
    LOADING_STARTED: 'ui:loading-started',
    LOADING_FINISHED: 'ui:loading-finished'
  }
} as const;
```

## 🔄 Usage Examples

### Correct Usage in Components
```typescript
// ✅ CORRECT - Barrel import
import { STORAGE_KEYS, EVENT_NAMES, PAYMENT_STATUS } from '@constants';

const PaymentComponent: React.FC = () => {
  // Use constants instead of magic strings
  const paymentStatus = localStorage.getItem(STORAGE_KEYS.PAYMENT_STATUS_CACHE);

  // Emit events using constants
  eventBus.emit(EVENT_NAMES.PAYMENT.STATUS_UPDATED, { status: PAYMENT_STATUS.COMPLETED });

  return <div>Payment Status: {paymentStatus}</div>;
};
```

### Correct Usage in Services
```typescript
// ✅ CORRECT - Barrel import
import { STORAGE_KEYS, INDEXEDDB_CONFIG } from '@constants';

export class StorageService {
  private getFromLocalStorage(key: keyof typeof STORAGE_KEYS) {
    return localStorage.getItem(STORAGE_KEYS[key]);
  }

  private async getFromIndexedDB(store: keyof typeof INDEXEDDB_CONFIG.STORES) {
    // Implementation using INDEXEDDB_CONFIG.STORES[store]
  }
}
```

## 🚫 Anti-Patterns to Avoid

### ❌ Magic Strings
```typescript
// WRONG - Magic strings
localStorage.getItem('tourist-tax-preferences');
eventBus.emit('payment:status-updated');
```

### ❌ Direct Domain Imports
```typescript
// WRONG - Direct imports
import { PAYMENT_STATUS } from '../apps/payment/constants/PaymentConstants';
```

### ❌ Hardcoded Values
```typescript
// WRONG - Hardcoded values
if (status === 'completed') { /* ... */ }
```

## 📋 Implementation Checklist

- [x] Create `src/app/constants/index.ts` barrel export
- [x] Implement `StorageConstants.ts` with localStorage and IndexedDB keys
- [x] Implement `EventConstants.ts` with EventBus event names
- [x] Implement `PaymentConstants.ts` with payment states and types
- [x] Implement `UIConstants.ts` with UI states and constants
- [ ] Implement `ApiConstants.ts` with API endpoints
- [ ] Implement `ValidationConstants.ts` with validation rules
- [ ] Update all existing code to use barrel imports
- [ ] Add TypeScript strict typing for all constants
- [ ] Document usage patterns and examples

## 🎯 Benefits

1. **Single Source of Truth**: All constants in one place
2. **Type Safety**: Full TypeScript support with strict typing
3. **Refactoring Safety**: Easy to rename and update constants
4. **Import Consistency**: Uniform import pattern across codebase
5. **Architecture Compliance**: Follows layered context architecture
6. **Developer Experience**: IntelliSense support for all constants
