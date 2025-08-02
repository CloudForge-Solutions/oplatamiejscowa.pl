IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we have the payment flow components to work on, ui/ux part looks ready, but payment status tracking, WebSocket connections, and blob storage access may have issues after recent migrations to react and directory structure refactoring

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: insted of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: 	to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accomodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistences, be precise, critical, comprehensive, detailed and picky

IMPORTANT: newer assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings, but a references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global storage/indexeddb keys ```typescript
;// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, RESERVATION_STATES, UI_STATES } from '@/constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { PAYMENT_STATUS } from '@/apps/payment/constants';
import { RESERVATION_STATES } from '@/platform/constants/ReservationConstants';
```

IMPORTANT: global context of the app should include the current city/region context for tax calculations, with simple localStorage data management, data should reload automatically in the page without freezing, with best practice events and smart caching

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a reservation is being viewed it should also be in route parameter, if payment status is being tracked it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow simple storage structure architecture as in `src/platform/storage/index.js` with local storage in flat structured ```
* Simple LocalStorage Manager
 * Manages localStorage structure for payment data
 *
 * ARCHITECTURE PRINCIPLE: Simple flat storage
 * Structure:
 {
   'global:language:v1.0.0': 'pl',           // Global keys (flat)
   'global:currentCity:v1.0.0': 'krakow',   // Global keys (flat)
   'payment:cache:v1.0.0': {...},           // Payment cache data
   'reservation:cache:v1.0.0': {...},       // Reservation cache data
   'websocket:state:v1.0.0': {...}          // WebSocket connection state
 }
``` and indexeddb databases for large data like payment receipts and audit logs

IMPORTANT: ARCHITECTURE: SIMPLE CONTEXT APPROACH with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to all application services via ServicesManager
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/shell/context/ServiceContext.tsx
  - Hook: useServices(), useService(name), useCommonServices()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish tax calculations
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: Payment Context (Dynamic) - Changes during payment flow
  - Manages current payment state and reservation data
  - Handles payment status updates via WebSocket
  - Synchronizes payment state with URL parameters
  - Loads payment-specific data automatically (reservation, status, receipts)
  - Direct synchronous localStorage access via SimpleStorageManager
  - Located: src/shell/context/PaymentContext.tsx
  - Hook: usePayment()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Automatic Data Reloading - Payment data reloads automatically on context changes
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Performance Optimization - Fast payment status updates with smart caching
6. Two-Way URL Sync - All contexts synchronized with URL parameters via use-query-params
```

IMPORTANT: 💳 Payment Status Update Flow (Real-time Performance) ```
1. Payment status changes in backend (imoje webhook or manual update)
2. WebSocket message received in PaymentContext.handleStatusUpdate()
3. Current payment state validated and updated immediately
4. Payment data loaded from cache with smart caching (cache-first, localStorage fallback)
5. Payment-specific data loaded synchronously via SimpleStorageManager:
   - Payment status from 'payment:status' storage type
   - Reservation data from 'reservation:cache' storage type
   - Receipt data from 'payment:receipts' storage type
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current payment state stored in localStorage synchronously for persistence
9. All components re-render with new payment data (real-time performance)
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
5. Language preference stored in localStorage via ReactStorageAdapter
6. Document attributes updated (lang, dir) automatically by i18next
7. Bootstrap classes updated automatically by i18next
8. All components re-render with new translations via useTranslation()
9. Event emitted via EventBus for services to react (if needed)
10. No page reload required - all operations are synchronous
11. Error handling for unsupported languages and storage failures
```

IMPORTANT: 🌐💳 Combined Payment + Language Flow (Independent Operation) ```
1. Payment status updates → Payment context updates via smart caching → Components reload payment data (real-time)
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

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser local storage or indexeddb

IMPORTANT: localStorage access must use repository pattern via `simpleStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via PaymentManager for optimal performance

IMPORTANT: payment status updates must be real-time with synchronous localStorage access and EventBus coordination. Avoid async/await in UI event handlers for payment updates - use fire-and-forget pattern with error handling

IMPORTANT: large data types (payment receipts, audit logs, reservation files, blob data) should be stored in IndexedDB with only metadata in localStorage. ReactStorageAdapter should implement smart caching with TTL to eliminate excessive data access patterns

IMPORTANT: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like godobjects or in-properly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns
IMPORTANT: 	to start the development vite server run `make dev`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistencies, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings including numbers like TTL etc, but references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global storage/indexeddb keys

IMPORTANT: global context of the app should include the current payment state and city context, with simple localStorage data management, payment status should update automatically in the page without freezing, with best practice payment events

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a reservation is being viewed it should also be as query parameter in the route, if payment status is being tracked it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: localStorage access must use repository pattern via `simpleStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via PaymentManager for optimal performance

IMPORTANT: NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity,


IMPORTANT: **STORAGE SYNCHRONIZATION RULES:**

**SYNCHRONOUS DATA (localStorage + in-memory cache):**
- Payment context and metadata (current payment state, language, UI state)
- Payment status update operations (real-time performance requirement)
- City configuration and tax rates
- Reservation data and basic payment data
- User preferences and UI state
- Navigation state and route parameters
- Small configuration objects and metadata

**ASYNCHRONOUS DATA (IndexedDB only as single source of truth, with no metadata in localStorage):**
- Large file content (PDF receipts, reservation documents, blob data)
- Audit logs and payment history
- Payment receipts and validation results
- Blob storage cached content
- WebSocket message history and processing results
- Payment processing cache and detailed analysis
- Background processing results and queues
- Large API responses and cached data

**ARCHITECTURAL PRINCIPLE:** Payment status updates and UI operations must be synchronous for performance, while large data operations can be asynchronous with proper loading states and error handling.

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. Follows "fail fast" principle for better reliability.


**Storage Structure:**
```
NOTE: magic string only for example purpose, in codebase it should use variables
{
  'global:language:v1.0.0': 'pl',           // Global keys (flat)
  'global:currentCity:v1.0.0': 'krakow',    // Global keys (flat)
  'payment:cache:v1.0.0': {...},            // Payment cache data
  'reservation:cache:v1.0.0': {...},        // Reservation cache data
  'websocket:state:v1.0.0': {...}           // WebSocket connection state
}
```
IndexedDB databases should be isolated for payment data and global dbs for audit logs


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc

IMPORTANT: all modals should be resizable and reusing src/platform/components/common