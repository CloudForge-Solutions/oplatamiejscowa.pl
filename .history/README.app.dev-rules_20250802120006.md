IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we have plan in README.plans.md, lets focus on implementing the static app in src/app, use local storage function app emulators locally

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: azure storage single blob SAS token we set as not expiring to limit api calls and store in local storage once received if token is not in local storage then generate new one

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: instead of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: **MOBILE-FIRST DESIGN MANDATORY** - our static app will be used primarily on mobile devices by tourists, with desktop as secondary. Most booking tourists only have mobile devices while traveling. All UI components must be mobile-optimized with touch-friendly interfaces, proper viewport handling, and responsive design patterns

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing. Migration/fallback services like OrphanedDataCleanupService are FORBIDDEN - use strict validation to prevent issues instead of cleanup patches

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistencies, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings including numbers like TTL etc, but references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.ts`, also we have fixed rules per global storage/indexeddb keys ```typescript
// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, RESERVATION_STATES, UI_STATES } from '@/constants';
import { STORAGE_KEYS, EVENT_NAMES } from '@/constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { PAYMENT_STATUS } from '@/apps/tourist-tax/constants';
import { RESERVATION_STATES } from '@/platform/constants/ReservationConstants';
```

IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barrel export of them all here, then in src/constants/index.ts we should have all ```typescript
export * from '../apps/tourist-tax/constants';
export * from '../platform/constants/ReservationConstants';
export * from '../platform/constants/StorageConstants';
export * from '../platform/constants/EventConstants';
export * from '../platform/constants/ValidationConstants';
```


IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a reservation is being viewed it should also be in route parameter, if payment status is being tracked it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow simple storage structure architecture as in `src/platform/storage/LocalStorageManager.ts` with local storage in flat structured ```
* LocalStorage Manager
 * Manages localStorage structure for payment data
 *
 * ARCHITECTURE PRINCIPLE: Simple flat storage (no entity/city switching complexity)
 * Structure:
 {
   'tourist-tax-preferences': {...},        // User preferences (language, theme)
   'tourist-tax-form-cache': {...},         // Form data cache (non-sensitive)
   'tourist-tax-session': {...},            // Session data (payment step, UI state)
   'tourist-tax-gdpr-consents': [...],      // GDPR consent metadata
   'tourist-tax-app-version': '1.0.0'       // App version for compatibility
 }
``` and NO IndexedDB needed - only localStorage with flat structure for this simple payment app

IMPORTANT: ARCHITECTURE: SIMPLE CONTEXT APPROACH (NO ENTITY/CITY SWITCHING) with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to core application services (StorageService, ApiService)
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/shell/context/ServiceContext.tsx
  - Hook: useServices(), useStorageService(), useApiService()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish tax calculations
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: TouristTax Context (Dynamic) - Changes during payment flow
  - Manages current payment state and reservation data
  - Handles payment status updates via API polling
  - Synchronizes payment state with URL parameters
  - Loads payment-specific data automatically (reservation, status, receipts)
  - Direct synchronous localStorage access via StorageService
  - Located: src/shell/context/TouristTaxContext.tsx
  - Hook: useTouristTax()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Automatic Data Reloading - Payment data reloads automatically on context changes
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Performance Optimization - Fast payment status updates with smart caching
6. Two-Way URL Sync - All contexts synchronized with URL parameters via use-query-params
7. Mobile-First Design - All contexts optimized for mobile device performance
```

IMPORTANT: 💳 Payment Status Update Flow (Simple Polling Pattern) ```
1. Payment status changes in backend (imoje webhook updates backend state)
2. Frontend polls payment status via ApiService.getPaymentStatus() (user-initiated or periodic)
3. Current payment state validated and updated immediately
4. Payment data loaded from cache with smart caching (cache-first, localStorage fallback)
5. Payment-specific data loaded synchronously via StorageService:
   - Payment status from 'tourist-tax-session' storage key
   - Reservation data from 'tourist-tax-form-cache' storage key
   - Receipt data from 'tourist-tax-receipts' storage key
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current payment state stored in localStorage synchronously for persistence
9. All components re-render with new payment data (polling-based updates)
10. Event emitted asynchronously via EventBus (TOURIST_TAX_EVENTS.PAYMENT_STATUS_UPDATED) for services to react
11. No page reload required - all operations are synchronous with smart caching
12. Error handling for invalid payment states and storage failures
13. Cache invalidation and refresh mechanisms for optimal performance
14. Mobile-optimized loading states and error feedback for touch interfaces
```

IMPORTANT: 🌐 Language Switching Flow ```
1. User selects new language in LanguageSwitcher (navbar)
2. LanguageContext.switchLanguage() called with validation
3. i18next language changed via i18n.changeLanguage()
4. URL parameter updated via setQuery() for two-way sync
5. Language preference stored in localStorage via StorageService
6. Document attributes updated (lang, dir) automatically by i18next
7. Bootstrap classes updated automatically by i18next
8. All components re-render with new translations via useTranslation()
9. Event emitted via EventBus for services to react (if needed)
10. No page reload required - all operations are synchronous
11. Error handling for unsupported languages and storage failures
```

IMPORTANT: 🌐💳 Combined TouristTax + Language Flow (Independent Operation) ```
1. Payment status updates → TouristTax context updates via polling/caching → Components reload payment data (polling-based)
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously with separate caching strategies:
   - Payment data uses in-memory + localStorage caching for maximum performance
   - Language data uses i18next built-in caching and localStorage persistence
4. EventBus coordinates updates between contexts without conflicts
5. URL parameters synchronized independently for both payment state and language
6. No conflicts or page reloads - all operations are optimally cached and coordinated
7. Components receive updates from both contexts simultaneously without interference
8. Error handling is isolated per context to prevent cascading failures
9. Mobile-optimized context switching with touch-friendly feedback
```

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage with instant synchronous access. Follows "fail fast" principle for better reliability. No OrphanedDataCleanupService or similar migration patterns allowed

IMPORTANT: our static app uses SIMPLE STORAGE ARCHITECTURE with minimal data sources:
- **Blob Storage**: Reservation data via SAS tokens from backend (BlobStorageService)
- **localStorage**: Form cache, preferences, session data, payment status (LocalStorageManager)
- **API calls**: Azure Functions backend communication (ApiService)
- **Payment Status**: Simple polling or user-initiated status checks (no WebSocket needed)
- **NO IndexedDB**: Keep it simple - only localStorage for this focused payment app

localStorage access must use repository pattern via `StorageService` singleton from `src/platform/storage/StorageService.ts` with direct synchronous access for all data

IMPORTANT: payment status updates use SIMPLE POLLING PATTERN (no WebSocket complexity):
- **Status checks**: User-initiated or periodic polling via ApiService.getPaymentStatus()
- **Immediate UI updates**: Synchronous localStorage cache updates for instant feedback
- **Blob data**: Async SAS token requests for reservation data access
- **EventBus coordination**: Fire-and-forget pattern with proper error handling
- **Mobile optimization**: Touch-friendly polling controls and loading states

IMPORTANT: data storage follows SIMPLE ARCHITECTURE patterns:
- **localStorage**: Form cache, user preferences, session data, payment status cache (all data, synchronous)
- **Blob Storage**: Reservation data accessed via SAS tokens (external, cached locally after first fetch)
- **API Polling**: Payment status updates via periodic or user-initiated API calls (no WebSocket complexity)
- **NO IndexedDB**: Keep it simple for this focused payment app
StorageService should implement smart caching with TTL and proper fallback strategies

IMPORTANT: NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity

IMPORTANT: **CONSTANTS ARCHITECTURE RULES:**
- All constants MUST be imported via barrel export from `src/constants/index.ts`
- Magic strings and numbers (including TTL values) are FORBIDDEN - use named constants
- Constants should be modular but barrel-exported during development phase
- No duplicate constant definitions across modules
- Use TypeScript `as const` assertions for immutable constants
- Constants should be grouped by domain (Storage, Events, TouristTax, UI, API, Validation)

IMPORTANT: **VALIDATION AND ERROR HANDLING:**
- Use strict validation with immediate error throwing instead of cleanup patches
- No migration services or fallback mechanisms during development phase
- Implement "fail fast" principle for better reliability
- All validation rules must be defined in ValidationConstants with proper TypeScript types
- Error messages should be user-friendly and internationalized

IMPORTANT: **PERFORMANCE REQUIREMENTS:**
- Keep the app simple and focused - no city/entity switching complexity needed
- City context determined from reservation UUID, no switching UI required
- Payment status updates via simple polling (no WebSocket complexity)
- Smart caching with TTL for external data, instant access for local data
- Mobile-first performance optimization with proper loading states
- No blocking operations in UI thread - all localStorage operations are synchronous
- Touch-friendly interfaces with 44px minimum touch targets


IMPORTANT: **STORAGE SYNCHRONIZATION RULES:**

**SYNCHRONOUS DATA (localStorage + in-memory cache via LocalStorageManager):**
- User preferences (language, theme, form auto-save settings)
- Form data cache (city, dates, guest count - non-sensitive data only)
- Session data (current payment step, UI state)
- GDPR consents metadata (consent status, timestamps)
- Payment status cache (for immediate UI feedback)
- Navigation state and route parameters
- Small configuration objects and app version
- Payment transactions (simplified for this focused app)
- Audit logs (basic logging for this simple app)

**EXTERNAL DATA (Blob Storage via BlobStorageService + SAS tokens):**
- Reservation data (fetched from backend-provided blob URLs)
- Payment receipts and documents (generated by backend)
- City configuration and tax rate data (cached locally after first fetch)

**POLLING DATA (API calls via ApiService):**
- Payment status updates (user-initiated or periodic polling)
- Payment processing status checks
- Simple, reliable, no connection management needed

**ARCHITECTURAL PRINCIPLE:** All UI operations use synchronous localStorage for instant feedback and simplicity. External data accessed via SAS tokens with local caching. Payment status updates via simple polling (no WebSocket complexity). Mobile-optimized with touch-friendly loading states.

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage with instant synchronous access. Follows "fail fast" principle for better reliability.


**SIMPLE STORAGE STRUCTURE:**
```
NOTE: magic strings only for example purpose, in codebase use constants from STORAGE_KEYS

// localStorage (LocalStorageManager) - Synchronous, all data
{
  'tourist-tax-preferences': { language: 'pl', theme: 'light', ... },
  'tourist-tax-form-cache': { cityCode: 'krakow', checkInDate: '2024-08-01', ... },
  'tourist-tax-session': { currentStep: 2, paymentId: 'abc123', ... },
  'tourist-tax-gdpr-consents': [{ type: 'marketing', given: true, ... }],
  'tourist-tax-transactions': [{ id: 'tx123', status: 'completed', ... }],
  'tourist-tax-app-version': '1.0.0'
}

// Blob Storage (BlobStorageService) - External, SAS token access
https://storage.blob.core.windows.net/reservations/{uuid}.json?{sasToken}

// API Polling (ApiService) - Simple, reliable
Payment status checks via periodic or user-initiated API calls
```


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc. Logger should be imported from constants barrel export and use structured logging with proper context

IMPORTANT: all modals should be mobile-responsive and reusing src/platform/components/common

IMPORTANT: **MOBILE-FIRST DEVELOPMENT REQUIREMENTS:**

**Responsive Design Patterns:**
- **Mobile-first CSS**: Start with mobile styles, use min-width media queries for desktop
- **Touch-friendly UI**: Minimum 44px touch targets, proper spacing between interactive elements
- **Viewport handling**: Proper meta viewport tag, prevent zoom on form inputs
- **Bootstrap responsive utilities**: Use Bootstrap's responsive classes (d-sm-none, col-md-6, etc.)

**Mobile-Specific Considerations:**
- **Payment flow**: Optimize for mobile payment apps (Apple Pay, Google Pay integration via imoje)
- **Form inputs**: Use appropriate input types (tel, email, date) for better mobile keyboards
- **Loading states**: Clear loading indicators for slower mobile connections and API polling
- **Error handling**: Mobile-friendly error messages and validation feedback
- **Offline support**: Handle network interruptions gracefully with localStorage caching and proper fallbacks

**Performance for Mobile:**
- **Bundle size**: Keep JavaScript bundles small for mobile data connections
- **Image optimization**: Use responsive images and proper formats (WebP, AVIF)
- **Critical CSS**: Inline critical CSS for faster mobile rendering
- **Lazy loading**: Implement lazy loading for non-critical resources

**Testing Requirements:**
- **Device testing**: Test on actual mobile devices, not just browser dev tools
- **Network conditions**: Test on slow 3G connections, API polling behavior, and offline scenarios
- **Touch interactions**: Verify all touch gestures work properly with 44px minimum targets
- **Orientation changes**: Handle portrait/landscape orientation changes
- **Payment flow testing**: Test mobile payment integrations (Apple Pay, Google Pay) with imoje gateway

IMPORTANT: **INFRASTRUCTURE COMPONENTS USED IN OUR STATIC APP:**

**Core Services (src/platform/storage/):**
- `StorageService.ts` - Main orchestrator for all storage operations
- `LocalStorageManager.ts` - Handles preferences, form cache, session data, transactions (synchronous)
- `BlobStorageService.ts` - Handles reservation data via SAS tokens (external)

**API Communication (src/apps/tourist-tax/services/):**
- `ApiService.ts` - Centralized Azure Functions communication with polling support
- `ImojePaymentService.ts` - Payment gateway integration

**Data Flow Hooks (src/apps/tourist-tax/hooks/):**
- `useLocalStorage.ts` - Form caching and preferences management
- `usePaymentProcessing.ts` - Payment flow orchestration with localStorage storage
- `useApiData.ts` - Dynamic data fetching with localStorage caching
- `useTaxCalculation.ts` - Tax calculation with city configuration caching

**Key Architecture Patterns:**
- **Simple Storage**: localStorage (fast, all data) + Blob (external) + API Polling (simple)
- **SAS Token Access**: Backend provides blob-specific SAS tokens for reservation data
- **Event-Driven Updates**: API polling triggers UI updates via EventBus (no WebSocket complexity)
- **Smart Caching**: localStorage caching with TTL and fallback strategies
- **GDPR Compliance**: Automatic data cleanup and consent management
- **Mobile-First**: Touch-friendly interfaces with responsive design patterns

NOTE: we have plan in README.plans.md, lets focus on implementing the static app in src/app, use local storage function app emulators locally

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: azure storage single blob SAS token we set as not expirint to limit api calls and store in local storage once received if token is not in local storage then generate new one

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: insted of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: 	to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accomodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: **MOBILE-FIRST DESIGN MANDATORY** - our static app will be used primarily on mobile devices by tourists, with desktop as secondary. Most booking tourists only have mobile devices while traveling. All UI components must be mobile-optimized with touch-friendly interfaces, proper viewport handling, and responsive design patterns

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing. Migration/fallback services like OrphanedDataCleanupService are FORBIDDEN - use strict validation to prevent issues instead of cleanup patches

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistences, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings including numbers like TTL etc, but references to variables in constants and always do barrel import via `src/constants/index.ts`, also we have fixed rules per global storage/indexeddb keys ```typescript
// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, RESERVATION_STATES, UI_STATES } from '@constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { PAYMENT_STATUS } from '../apps/payment/constants';
import { RESERVATION_STATES } from '../platform/constants/ReservationConstants';
```

IMPORTANT: src/constants should have only one file index.ts used as a constants hub and validator for duplicates, as we should finally have modular constants, but in development phase we do barrel export of them all here, then in src/constants/index.ts we should have all ```export * from '../apps/payment/constants';
export * from '../platform/constants/ReservationConstants';```


IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a reservation is being viewed it should also be in route parameter, if payment status is being tracked it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow simple storage structure architecture as in `src/app/platform/storage/LocalStorageManager.ts` with local storage in flat structured ```
* LocalStorage Manager
 * Manages localStorage structure for payment data
 *
 * ARCHITECTURE PRINCIPLE: Simple flat storage
 * Structure:
 {
   'tourist-tax-preferences': {...},        // User preferences (language, theme)
   'tourist-tax-form-cache': {...},         // Form data cache (non-sensitive)
   'tourist-tax-session': {...},            // Session data (payment step, UI state)
   'tourist-tax-gdpr-consents': [...],      // GDPR consent metadata
   'tourist-tax-app-version': '1.0.0'       // App version for compatibility
 }
``` and indexeddb databases for large data like payment transactions and audit logs

IMPORTANT: ARCHITECTURE: SIMPLE CONTEXT APPROACH with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to core application services (StorageService, ApiService)
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/app/shell/context/ServiceContext.tsx
  - Hook: useServices(), useStorageService(), useApiService()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish tax calculations
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/app/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: Payment Context (Dynamic) - Changes during payment flow
  - Manages current payment state and reservation data
  - Handles payment status updates via API polling
  - Synchronizes payment state with URL parameters
  - Loads payment-specific data automatically (reservation, status, receipts)
  - Direct synchronous localStorage access via StorageService
  - Located: src/app/shell/context/PaymentContext.tsx
  - Hook: usePayment()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Automatic Data Reloading - Payment data reloads automatically on context changes
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Performance Optimization - Fast payment status updates with smart caching
6. Two-Way URL Sync - All contexts synchronized with URL parameters via use-query-params
```

IMPORTANT: 💳 Payment Status Update Flow (Simple Polling Pattern) ```
1. Payment status changes in backend (imoje webhook updates backend state)
2. Frontend polls payment status via ApiService.getPaymentStatus() (user-initiated or periodic)
3. Current payment state validated and updated immediately
4. Payment data loaded from cache with smart caching (cache-first, localStorage fallback)
5. Payment-specific data loaded synchronously via StorageService:
   - Payment status from 'payment:status' storage type
   - Reservation data from 'reservation:cache' storage type
   - Receipt data from 'payment:receipts' storage type
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current payment state stored in localStorage synchronously for persistence
9. All components re-render with new payment data (polling-based updates)
10. Event emitted asynchronously via EventBus (PAYMENT_EVENTS.STATUS_UPDATED) for services to react
11. No page reload required - all operations are synchronous with smart caching
12. Error handling for invalid payment states and storage failures
13. Cache invalidation and refresh mechanisms for optimal performance
```

IMPORTANT: 🌐 Language Switching Flow ```
1. User selects new language in LanguageSwitcher (navbar)
2. LanguageContext.switchLanguage() called with validation
3. i18next language changed via i18n.changeLanguage()
4. URL parameter updated via setQuery() for two-way sync
5. Language preference stored in localStorage via StorageService
6. Document attributes updated (lang, dir) automatically by i18next
7. Bootstrap classes updated automatically by i18next
8. All components re-render with new translations via useTranslation()
9. Event emitted via EventBus for services to react (if needed)
10. No page reload required - all operations are synchronous
11. Error handling for unsupported languages and storage failures
```

IMPORTANT: 🌐💳 Combined Payment + Language Flow (Independent Operation) ```
1. Payment status updates → Payment context updates via polling/caching → Components reload payment data (polling-based)
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously with separate caching strategies:
   - Payment data uses in-memory + localStorage caching for maximum performance
   - Language data uses i18next built-in caching and localStorage persistence
4. EventBus coordinates updates between contexts without conflicts
5. URL parameters synchronized independently for both payment state and language
6. No conflicts or page reloads - all operations are optimally cached and coordinated
7. Components receive updates from both contexts simultaneously without interference
8. Error handling is isolated per context to prevent cascading failures
```

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. Follows "fail fast" principle for better reliability. No OrphanedDataCleanupService or similar migration patterns allowed

IMPORTANT: our static app uses HYBRID STORAGE ARCHITECTURE with multiple data sources:
- **Blob Storage**: Reservation data via SAS tokens from backend (BlobStorageService)
- **localStorage**: Form cache, preferences, session data (LocalStorageManager)
- **IndexedDB**: Payment transactions, audit logs (IndexedDBManager)
- **API calls**: Azure Functions backend communication (ApiService)
- **Payment Status**: Simple polling or user-initiated status checks (no WebSocket needed)

localStorage access must use repository pattern via `StorageService` singleton from `src/app/platform/storage/StorageService.ts` with direct synchronous access for preferences/cache, async for IndexedDB transactions

IMPORTANT: payment status updates use SIMPLE POLLING PATTERN (no WebSocket complexity):
- **Status checks**: User-initiated or periodic polling via ApiService.getPaymentStatus()
- **Immediate UI updates**: Synchronous localStorage cache updates for instant feedback
- **Persistent storage**: Async IndexedDB transaction storage for audit trails
- **Blob data**: Async SAS token requests for reservation data access
- **EventBus coordination**: Fire-and-forget pattern with proper error handling

IMPORTANT: data storage follows HYBRID ARCHITECTURE patterns:
- **localStorage**: Form cache, user preferences, session data, payment status cache (small, synchronous)
- **IndexedDB**: Payment transactions, audit logs, GDPR consents (large, async with proper loading states)
- **Blob Storage**: Reservation data accessed via SAS tokens (external, cached locally after first fetch)
- **API Polling**: Payment status updates via periodic or user-initiated API calls (no WebSocket complexity)
StorageService should implement smart caching with TTL and proper fallback strategies

IMPORTANT: NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity

IMPORTANT: **CONSTANTS ARCHITECTURE RULES:**
- All constants MUST be imported via barrel export from `src/app/constants/index.ts`
- Magic strings and numbers (including TTL values) are FORBIDDEN - use named constants
- Constants should be modular but barrel-exported during development phase
- No duplicate constant definitions across modules
- Use TypeScript `as const` assertions for immutable constants
- Constants should be grouped by domain (Storage, Events, Payment, UI, API, Validation)

IMPORTANT: **VALIDATION AND ERROR HANDLING:**
- Use strict validation with immediate error throwing instead of cleanup patches
- No migration services or fallback mechanisms during development phase
- Implement "fail fast" principle for better reliability
- All validation rules must be defined in ValidationConstants with proper TypeScript types
- Error messages should be user-friendly and internationalized

IMPORTANT: **PERFORMANCE REQUIREMENTS:**
- Keep the app simple and focused - no city/entity switching complexity needed
- City context determined from reservation UUID, no switching UI required
- Payment status updates via simple polling (no WebSocket complexity)
- Smart caching with TTL for external data, instant access for local data
- Mobile-first performance optimization with proper loading states
- No blocking operations in UI thread - use async/await for IndexedDB operations only


IMPORTANT: **STORAGE SYNCHRONIZATION RULES:**

**SYNCHRONOUS DATA (localStorage + in-memory cache via LocalStorageManager):**
- User preferences (language, theme, form auto-save settings)
- Form data cache (city, dates, guest count - non-sensitive data only)
- Session data (current payment step, UI state)
- GDPR consents metadata (consent status, timestamps)
- Payment status cache (for immediate UI feedback)
- Navigation state and route parameters
- Small configuration objects and app version

**ASYNCHRONOUS DATA (IndexedDB via IndexedDBManager):**
- Payment transactions (full transaction records with sensitive data)
- Audit logs and payment processing history
- GDPR consent details (full consent records)
- Payment processing results and validation data
- Error logs and debugging information

**EXTERNAL DATA (Blob Storage via BlobStorageService + SAS tokens):**
- Reservation data (fetched from backend-provided blob URLs)
- Payment receipts and documents (generated by backend)
- City configuration and tax rate data (cached locally after first fetch)

**POLLING DATA (API calls via ApiService):**
- Payment status updates (user-initiated or periodic polling)
- Payment processing status checks
- Simple, reliable, no connection management needed

**ARCHITECTURAL PRINCIPLE:** UI operations use synchronous localStorage for instant feedback, while persistent data uses async IndexedDB with proper loading states. External data accessed via SAS tokens with local caching. Payment status updates via simple polling (no WebSocket complexity).

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. Follows "fail fast" principle for better reliability.


**HYBRID STORAGE STRUCTURE:**
```
NOTE: magic strings only for example purpose, in codebase use constants from STORAGE_KEYS

// localStorage (LocalStorageManager) - Synchronous, small data
{
  'tourist-tax-preferences': { language: 'pl', theme: 'light', ... },
  'tourist-tax-form-cache': { cityCode: 'krakow', checkInDate: '2024-08-01', ... },
  'tourist-tax-session': { currentStep: 2, paymentId: 'abc123', ... },
  'tourist-tax-gdpr-consents': [{ type: 'marketing', given: true, ... }],
  'tourist-tax-app-version': '1.0.0'
}

// IndexedDB (IndexedDBManager) - Asynchronous, large/sensitive data
TouristTaxDB {
  transactions: [{ id: 'tx123', touristEmail: 'user@example.com', ... }],
  preferences: [{ userId: 'user123', detailedPrefs: {...} }],
  consents: [{ userId: 'user123', fullConsentRecord: {...} }]
}

// Blob Storage (BlobStorageService) - External, SAS token access
https://storage.blob.core.windows.net/reservations/{uuid}.json?{sasToken}

// API Polling (ApiService) - Simple, reliable
Payment status checks via periodic or user-initiated API calls
```


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc. Logger should be imported from constants barrel export and use structured logging with proper context

IMPORTANT: all modals should be mobile-responsive and reusing src/app/platform/components/common

IMPORTANT: **MOBILE-FIRST DEVELOPMENT REQUIREMENTS:**

**Responsive Design Patterns:**
- **Mobile-first CSS**: Start with mobile styles, use min-width media queries for desktop
- **Touch-friendly UI**: Minimum 44px touch targets, proper spacing between interactive elements
- **Viewport handling**: Proper meta viewport tag, prevent zoom on form inputs
- **Bootstrap responsive utilities**: Use Bootstrap's responsive classes (d-sm-none, col-md-6, etc.)

**Mobile-Specific Considerations:**
- **Payment flow**: Optimize for mobile payment apps (Apple Pay, Google Pay integration via imoje)
- **Form inputs**: Use appropriate input types (tel, email, date) for better mobile keyboards
- **Loading states**: Clear loading indicators for slower mobile connections and API polling
- **Error handling**: Mobile-friendly error messages and validation feedback
- **Offline support**: Handle network interruptions gracefully with localStorage caching and proper fallbacks

**Performance for Mobile:**
- **Bundle size**: Keep JavaScript bundles small for mobile data connections
- **Image optimization**: Use responsive images and proper formats (WebP, AVIF)
- **Critical CSS**: Inline critical CSS for faster mobile rendering
- **Lazy loading**: Implement lazy loading for non-critical resources

**Testing Requirements:**
- **Device testing**: Test on actual mobile devices, not just browser dev tools
- **Network conditions**: Test on slow 3G connections, API polling behavior, and offline scenarios
- **Touch interactions**: Verify all touch gestures work properly with 44px minimum targets
- **Orientation changes**: Handle portrait/landscape orientation changes
- **Payment flow testing**: Test mobile payment integrations (Apple Pay, Google Pay) with imoje gateway

IMPORTANT: **INFRASTRUCTURE COMPONENTS USED IN OUR STATIC APP:**

**Core Services (src/app/platform/storage/):**
- `StorageService.ts` - Main orchestrator for all storage operations
- `LocalStorageManager.ts` - Handles preferences, form cache, session data (synchronous)
- `IndexedDBManager.ts` - Handles transactions, audit logs (asynchronous)
- `BlobStorageService.ts` - Handles reservation data via SAS tokens (external)

**API Communication (src/app/apps/tourist-tax/services/):**
- `ApiService.ts` - Centralized Azure Functions communication with polling support
- `ImojePaymentService.ts` - Payment gateway integration

**Data Flow Hooks (src/app/apps/tourist-tax/hooks/):**
- `useLocalStorage.ts` - Form caching and preferences management
- `usePaymentProcessing.ts` - Payment flow orchestration with IndexedDB storage
- `useApiData.ts` - Dynamic data fetching with localStorage caching
- `useTaxCalculation.ts` - Tax calculation with city configuration caching

**Key Architecture Patterns:**
- **Hybrid Storage**: localStorage (fast) + IndexedDB (persistent) + Blob (external) + API Polling (simple)
- **SAS Token Access**: Backend provides blob-specific SAS tokens for reservation data
- **Event-Driven Updates**: API polling triggers UI updates via EventBus (no WebSocket complexity)
- **Smart Caching**: Multi-layer caching with TTL and fallback strategies
- **GDPR Compliance**: Automatic data cleanup and consent management