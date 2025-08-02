IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we have the Chrome extension integration and Azure Function backend to work on, ui/ux part looks ready, but Chrome extension content scripts, background scripts, and Azure Function NestJS integration may have issues after recent migrations to react and directory structure refactoring

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: insted of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: 	to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accomodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we support both desktop and mobile interfaces, with mobile-first design for tourist payment flow and desktop-optimized for landlord management

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistences, be precise, critical, comprehensive, detailed and picky

IMPORTANT: newer assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings, but a references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global storage/indexeddb keys ```typescript
;// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, CITY_CODES, UI_STATES } from '@/constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { PAYMENT_STATUS } from '@/apps/tourist-tax/constants';
import { CITY_CODES } from '@/core/constants/CityConstants';
```

IMPORTANT: global context of the app should include application mode (tourist/landlord) and selected city for forms, with static city data loaded once at startup, no dynamic city switching layer needed as tax rates are static annual data

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a mode (tourist/landlord) is active in context it should also be as query parameter in the route, if a reservation/payment is previewed it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow simple flat structure as in `src/platform/storage/index.js` with localStorage for user preferences and form data ```
* Simple LocalStorage Manager
 * Manages flat localStorage structure for user data
 *
 * ARCHITECTURE PRINCIPLE: Simple flat storage
 * Structure:
 {
   'global:userPreferences:v1.0.0': {...},     // User settings
   'global:currentMode:v1.0.0': 'tourist',     // App mode
   'session:paymentForm:v1.0.0': {...},        // Form data cache
   'session:reservationData:v1.0.0': {...}     // Temporary data
 }
``` and indexeddb for large files (receipts, documents) when needed

IMPORTANT: ARCHITECTURE: LAYERED CONTEXT APPROACH with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to all application services via ServicesManager
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/shell/context/ServiceContext.tsx
  - Hook: useServices(), useService(name), useCommonServices()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish/English tourist tax system
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: TouristTax Context (Dynamic) - Manages payment flow and mode switching
  - Manages current mode (tourist/landlord) and payment flow state
  - Handles mode switching without page reload
  - Synchronizes mode with URL parameters
  - Manages form data and user session state
  - Direct localStorage access for user preferences and form cache
  - Located: src/shell/context/TouristTaxContext.tsx
  - Hook: useTouristTax()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Static Data Loading - City tax data loaded once at startup from constants
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Simple State Management - No complex entity switching, focus on payment flow
6. Two-Way URL Sync - Mode and language synchronized with URL parameters via use-query-params
```

IMPORTANT: 🔄 Mode Switching Flow (Tourist/Landlord) ```
1. User selects new mode in ModeSelector component or via route navigation
2. TouristTaxContext.switchMode(mode) called with validation
3. Current mode state updated immediately
4. Mode-specific navbar and layout components rendered
5. Form data preserved in localStorage during mode switches
6. URL parameter updated via setQuery() for two-way sync (non-blocking)
7. Current mode stored in localStorage for persistence
8. All components re-render with new mode-specific UI
9. Event emitted asynchronously via EventBus (PLATFORM_EVENTS.MODE_SWITCHED) for services to react
10. No page reload required - all operations are lightweight
11. Error handling for invalid modes
12. Static city data remains available in both modes
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

IMPORTANT: 🌐🔄 Combined Mode + Language Flow (Independent Operation) ```
1. User switches mode → TouristTax context updates → Components show mode-specific UI
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously:
   - Mode data uses simple state management with localStorage persistence
   - Language data uses i18next built-in caching and localStorage persistence
4. EventBus coordinates updates between contexts without conflicts
5. URL parameters synchronized independently for both mode and language
6. No conflicts or page reloads - all operations are lightweight
7. Components receive updates from both contexts simultaneously without interference
8. Error handling is isolated per context to prevent cascading failures
9. Static city data remains available regardless of mode or language changes
```

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser local storage or indexeddb

IMPORTANT: localStorage access must use repository pattern via `cityLocalStorageManager` singleton from `src/platform/storage/index.js` with direct access - never wrap localStorage in unnecessary async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via CityManager for optimal performance

IMPORTANT: city switching must be <100ms with optimized localStorage access and EventBus coordination. Avoid excessive async/await in UI event handlers for city switching - use fire-and-forget pattern with error handling

IMPORTANT: large data types (payment receipts, reservation files, audit logs, Chrome extension data) should be stored in IndexedDB with only metadata in localStorage. ReactStorageAdapter should implement smart caching with TTL to eliminate excessive data access patterns

IMPORTANT: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like godobjects or in-properly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns
IMPORTANT: 	to start the development vite server run `make dev`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistencies, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings including numbers like TTL etc, but references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global and per context-entity-aware storage/indexeddb keys

IMPORTANT: global context of the app should include a currently active entity that has logically separate localStorage and indexeddb data, and switching entities should happen without page reload, data should reload automatically in the page without freezing, with best practice entity events

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if an entity is active in context it should also be as query parameter in the route, if a key based jpk/record is previewed it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: localStorage access must use repository pattern via `entityLocalStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via EntityManager for optimal performance

IMPORTANT: **STORAGE SYNCHRONIZATION RULES:**

**SYNCHRONOUS DATA (localStorage + in-memory cache):**
- City context and metadata (current city, language, UI state)
- City switching operations (<100ms performance requirement)
- Tax configuration and settings
- Reservations cache and basic city data
- User preferences and UI state
- Navigation state and route parameters
- Small configuration objects and metadata

**ASYNCHRONOUS DATA (IndexedDB with metadata in localStorage):**
- Large file content (PDF receipts, QR codes, uploaded documents)
- Audit logs and processing history
- Payment transaction files and validation results
- Chrome extension extracted data
- Reservation processing cache and detailed analysis
- Background processing results and queues
- Large API responses and cached data

**ARCHITECTURAL PRINCIPLE:** Context switching and UI operations must be synchronous for performance, while large data operations can be asynchronous with proper loading states and error handling.

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity

**Storage Structure:**
```
NOTE: magic string only for example purpose, in codebase it should use variables
{
  'global:cities:v1.0.0': [...],           // Global keys (flat)
  'global:currentCity:v1.0.0': cityCode,  // Global keys (flat)
  'city:KRK': {                            // City-nested data
    'tax-config': {...},
    'reservations-cache': [...],
    'payment-cache': {...}
  }
}
```
IndexedDB databases should be isolated per city dbs and global dbs for some cases


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc

IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc

IMPORTANT: all modals should be resizable and reusing src/platform/components/common

IMPORTANT: stating claims like ```🏆 RESULT: PRODUCTION-READY TECHNICAL SPECIFICATION
The document now reflects real-world browser capabilities and actual API behaviors rather than theoretical ideals. This ensures:``` or similar is forbidden as we are in development phase and