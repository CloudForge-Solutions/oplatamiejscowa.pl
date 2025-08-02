# Tourist Tax Payment System - Development Rules

## Core Development Principles

**TASK**: Implement robust solutions for the tourist tax payment system. Before and after making any changes, verify and analyze comprehensively each change. Be critical, picky, comprehensive and precise. Avoid antipatterns like god objects or improperly mixing architecture. Keep code DRY, agnostic, and follow Single Responsibility Principle.

**ARCHITECTURE**: The system follows a modular React + TypeScript architecture with:
- **Apps**: Tourist tax payment application (`src/apps/tourist-tax/`)
- **Platform**: Shared services and utilities (`src/platform/`)
- **Shell**: Application shell and routing (`src/shell/`)

**TYPESCRIPT MIGRATION**: All new files must be TypeScript (.ts/.tsx). When modifying existing files, migrate them to TypeScript as part of the changes.

**DEVELOPMENT SERVER**: Use `make dev` to start development server and `make install` for package installation. Never change production code to accommodate test requirements - adapt tests to work with Vite.

**TARGET PLATFORM**: Desktop-only application. Mobile development is forbidden.

**CODE QUALITY**: Instead of dummy patching, identify and fix architectural issues. Be precise, comprehensive, detailed, systematic, semantic, critical and picky.

**TESTING**: Run tests via Makefile targets. Ensure tests work with Vite configuration.

**PRODUCTION READINESS**: Never assume completion before seeing comprehensive user-tested application logs.

## Constants and Storage Architecture

**CONSTANTS**: Storage keys and events must reference variables from constants, never hardcoded magic strings. Use barrel imports:

```typescript
// ✅ ALLOWED - Barrel import
import { STORAGE_KEYS, PAYMENT_EVENTS, CITY_CODES } from '@/constants';

// ❌ FORBIDDEN - Direct domain imports or magic strings
import { STORAGE_KEYS } from '@/apps/tourist-tax/constants';
const key = 'tourist-tax-data'; // Magic string forbidden
```

**STORAGE ARCHITECTURE**: Tourist tax data uses structured localStorage with city-aware storage:

```typescript
{
  'global:cities:v1.0.0': [...],                    // Available cities
  'global:currentCity:v1.0.0': cityCode,           // Current selected city
  'city:KRK': {                                     // City-specific data
    'tax-config': {...},                            // Tax rates and rules
    'payment-cache': {...},                         // Cached payment data
    'transaction-history': [...]                    // Local transaction history
  }
}
```

**ROUTING**: Route parameters and application state must be synchronized via use-query-params. City selection, payment step, and transaction ID should be reflected in URL without conflicting with React Router or Bootstrap components.

**DOCUMENTATION**: Architecture changes must be reflected in README files without creating new documentation files.

## Storage Implementation

**LOCAL STORAGE**: Use structured storage via `src/platform/storage/` with city-aware architecture:

```typescript
/**
 * Tourist Tax LocalStorage Manager
 * Manages nested localStorage structure for tourist tax data
 *
 * ARCHITECTURE PRINCIPLE: City-aware storage
 * Structure:
 */
{
  'global:cities:v1.0.0': [...],              // Available cities list
  'global:currentCity:v1.0.0': cityCode,      // Current selected city
  'global:userPreferences:v1.0.0': {...},     // User preferences
  'city:KRK': {                               // City-specific data
    'tax-config': {...},                      // Tax rates and rules
    'payment-cache': {...},                   // Form data cache
    'gdpr-consents': [...]                    // GDPR consent records
  }
}
```

**INDEXEDDB**: Use for large data storage (transaction history, receipts, audit logs) with city-isolated databases and global databases for shared data.

## Application Architecture

**LAYERED CONTEXT APPROACH** for Tourist Tax Payment System:

**Layer 1: Platform Services (Static)**
- Provides access to payment services, storage, and utilities
- Static layer that remains constant throughout app lifecycle
- Foundation for other context layers
- Located: `src/platform/`
- Services: StorageService, ImojePaymentService, TaxCalculationService

**Layer 2: Language Context (Semi-Static)**
- Manages application language state with i18next integration
- Provides formatting utilities for Polish currency and dates
- Two-way URL synchronization with use-query-params
- Document attributes and Bootstrap classes updated automatically
- Located: `src/shell/context/LanguageContext.tsx`
- Hook: `useLanguage()`

**Layer 3: City Context (Dynamic)**
- Manages current city state with automatic tax configuration loading
- Handles city switching without page reload
- Synchronizes city with URL parameters
- Loads city-specific data automatically (tax rates, rules, payment methods)
- Direct synchronous localStorage access via StorageService
- Located: `src/shell/context/CityContext.tsx`
- Hook: `useCity()`

**Architecture Principles:**
1. **Clean Separation of Concerns** - Each layer has distinct responsibilities
2. **Automatic Data Reloading** - City data reloads automatically on context changes
3. **Type Safety** - Full TypeScript coverage with strict typing
4. **Performance Optimization** - Sub-millisecond city switching with smart caching
5. **Two-Way URL Sync** - All contexts synchronized with URL parameters

IMPORTANT: 🏢 Entity Switching Flow (Sub-millisecond Performance) ```
1. User selects new entity in EntitySwitcher component
2. EntityContext.switchEntity(entityId) called with validation
3. Current entity data cleared from in-memory state immediately
4. New entity loaded from EntityManager with smart caching (cache-first, localStorage fallback)
5. Entity-specific data loaded synchronously via EntityLocalStorageManager:
   - JPK configuration from 'jpk-config' storage type
   - Bank accounts from 'bank-accounts' storage type
   - Records cache from 'records-cache' storage type
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current entity stored in localStorage synchronously for persistence
9. All components re-render with new entity data (sub-millisecond performance)
10. Event emitted asynchronously via EventBus (PLATFORM_EVENTS.ENTITY_SELECTED) for services to react
11. No page reload required - all operations are synchronous with smart caching
12. Error handling for invalid entities and storage failures
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

IMPORTANT: 🌐🏢 Combined Entity + Language Flow (Independent Operation) ```
1. User switches entity → Entity context updates via smart caching → Components reload entity data (sub-millisecond)
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously with separate caching strategies:
   - Entity data uses in-memory + localStorage caching for maximum performance
   - Language data uses i18next built-in caching and localStorage persistence
4. EventBus coordinates updates between contexts without conflicts
5. URL parameters synchronized independently for both entity and language
6. No conflicts or page reloads - all operations are optimally cached and coordinated
7. Components receive updates from both contexts simultaneously without interference
8. Error handling is isolated per context to prevent cascading failures
```

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser local storage or indexeddb

IMPORTANT: localStorage access must use repository pattern via `entityLocalStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via EntityManager for optimal performance

IMPORTANT: entity switching must be sub-millisecond with synchronous localStorage access and EventBus coordination. Avoid async/await in UI event handlers for entity switching - use fire-and-forget pattern with error handling

IMPORTANT: large data types (audit logs, jpk history, jpk files, record files) should be stored in IndexedDB with only metadata in localStorage. ReactStorageAdapter should implement smart caching with TTL to eliminate excessive data access patterns

IMPORTANT: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like godobjects or in-properly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns
IMPORTANT: 	to start the development vite server run `make dev`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistencies, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings, but references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global and per context-entity-aware storage/indexeddb keys

IMPORTANT: global context of the app should include a currently active entity that has logically separate localStorage and indexeddb data, and switching entities should happen without page reload, data should reload automatically in the page without freezing, with best practice entity events

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if an entity is active in context it should also be as query parameter in the route, if a key based jpk/record is previewed it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: localStorage access must use repository pattern via `entityLocalStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via EntityManager for optimal performance

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb with instant synchronous access. NEVER use dual storage systems for context and metadata (localStorage + sessionStorage) - use single localStorage + in-memory caching for optimal performance and data integrity; as for bigger data like audits, logs, jpks, xmls, uploads, records, responses from apis, cache, use indexeddb

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

