IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we have the Chrome extension integration and Azure Function backend to work on, ui/ux part looks ready, but Chrome extension content scripts, background scripts, and Azure Function NestJS integration may have issues after recent migrations to react and directory structure refactoring

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven with Chrome extension → GitHub Pages → Azure Function architecture

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: insted of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: 	to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accomodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistences, be precise, critical, comprehensive, detailed and picky

IMPORTANT: newer assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings, but a references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global and per context-entity-aware storage/indexeddb keys ```typescript
;// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, TOURIST_TAX_TYPES, UI_STATES } from '@/constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { PAYMENT_STATUS } from '@/apps/tourist-tax/constants';
import { UI_STATES } from '@/shell/constants/UIConstants';
```

IMPORTANT: global context of the app should include currently selected city and mode (tourist/landlord) that has logically separate localstorage and indexeddb data, and switching cities/modes should happen without page reload (sub-millisecond performance), data should reload automatically in the page without freezing, with best practice city/mode events and smart caching

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if a city is selected in context it should also be as query parameter in the route, if a payment preview is shown it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow tourist tax context aware storage structure architecture as in `src/platform/storage/index.js` with local storage in nested structured ```
* Tourist Tax LocalStorage Manager
 * Manages nested localStorage structure for tourist tax data
 *
 * ARCHITECTURE PRINCIPLE: Nested city/mode storage
 * Structure:
 {
   'global:language:v1.0.0': 'pl',              // Global keys (flat)
   'global:selectedCity:v1.0.0': 'krakow',     // Global keys (flat)
   'global:paymentHistory:v1.0.0': [...],      // Global keys (flat)
   'tourist:preferences': {...},               // Tourist mode data
   'landlord:config': {...},                   // Landlord mode data
   'cache:cityRates': {...},                   // Cached city data
   'cache:reservations': [...]                 // Cached reservation data
     'jpk-config': {...},
     'bank-accounts': [...],
     'records-cache': {...}
   }
 }
``` and indexeddb databases in isolated per city dbs and global dbs for some cases

IMPORTANT: ARCHITECTURE: LAYERED CONTEXT APPROACH with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to all application services via ServicesManager
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/shell/context/ServiceContext.tsx
  - Hook: useServices(), useService(name), useCommonServices()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish currency and dates
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: Tourist Tax Context (Dynamic) - Changes frequently with sub-millisecond performance
  - Manages current city and mode (tourist/landlord) state with automatic data reloading
  - Handles city/mode switching without page reload
  - Synchronizes city and mode with URL parameters
  - Loads city-specific data automatically (tax rates, regulations, payment history)
  - Direct synchronous localStorage access via LocalStorageManager
  - Located: src/shell/context/TouristTaxContext.tsx
  - Hook: useTouristTax()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Automatic Data Reloading - City data reloads automatically on context changes
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Performance Optimization - Sub-millisecond city switching with smart caching
6. Two-Way URL Sync - All contexts synchronized with URL parameters via use-query-params
```

IMPORTANT: �️ City Switching Flow (Sub-millisecond Performance) ```
1. User selects new city in CitySelector component
2. TouristTaxContext.switchCity(cityCode) called with validation
3. Current city data cleared from in-memory state immediately
4. New city loaded from CityDataService with smart caching (cache-first, localStorage fallback)
5. City-specific data loaded synchronously via LocalStorageManager:
   - Tax rates from 'cache:cityRates' storage type
   - City regulations from 'cache:cityData' storage type
   - Payment history from 'global:paymentHistory' storage type
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current city stored in localStorage synchronously for persistence
9. All components re-render with new city data (sub-millisecond performance)
10. Event emitted asynchronously via EventBus (PLATFORM_EVENTS.CITY_SELECTED) for services to react
11. No page reload required - all operations are synchronous with smart caching
12. Error handling for invalid cities and storage failures
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

IMPORTANT: 🌐�️ Combined City + Language Flow (Independent Operation) ```
1. User switches city → TouristTax context updates via smart caching → Components reload city data (sub-millisecond)
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously with separate caching strategies:
   - City data uses in-memory + localStorage caching for maximum performance
   - Language data uses i18next built-in caching and localStorage persistence
4. EventBus coordinates updates between contexts without conflicts
5. URL parameters synchronized independently for both city and language
6. No conflicts or page reloads - all operations are optimally cached and coordinated
7. Components receive updates from both contexts simultaneously without interference
8. Error handling is isolated per context to prevent cascading failures
```

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser local storage or indexeddb

IMPORTANT: localStorage access must use repository pattern via `localStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via CityDataService for optimal performance

IMPORTANT: city switching must be sub-millisecond with synchronous localStorage access and EventBus coordination. Avoid async/await in UI event handlers for city switching - use fire-and-forget pattern with error handling

IMPORTANT: large data types (payment receipts, reservation files, QR codes, audit logs) should be stored in IndexedDB with only metadata in localStorage. LocalStorageManager should implement smart caching with TTL to eliminate excessive data access patterns

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
- Entity context and metadata (current entity, language, UI state)
- Entity switching operations (sub-millisecond performance requirement)
- JPK configuration and settings
- Bank accounts and basic entity data
- User preferences and UI state
- Navigation state and route parameters
- Small configuration objects and metadata

**ASYNCHRONOUS DATA (IndexedDB with metadata in localStorage):**
- Large file content (PDF receipts, QR codes, uploaded documents)
- Audit logs and payment history
- Generated receipts and tax documents
- Chrome extension data and booking information
- OCR text content and processing results
- Reservation processing cache and detailed analysis
- Background processing results and queues
- Large API responses and cached data

**ARCHITECTURAL PRINCIPLE:** Context switching and UI operations must be synchronous for performance, while large data operations can be asynchronous with proper loading states and error handling.

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity

**Storage Structure:**
```
NOTE: magic string only for example purpose, in codebase it shoud use variables
{
  'global:entities:v1.0.0': [...],           // Global keys (flat)
  'global:currentEntity:v1.0.0': entityId,  // Global keys (flat)
  'entity:01985077': {                       // Entity-nested data
    'jpk-config': {...},
    'bank-accounts': [...],
    'records-cache': {...}
  }
}
```
IndexedDB databases should be isolated per entity dbs and global dbs for some cases


IMPORTANT: using console.log is forbidden, make sure to use logger

