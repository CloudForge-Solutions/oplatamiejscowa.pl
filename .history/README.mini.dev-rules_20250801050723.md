# Tourist Tax Payment System - Development Rules

## Core Development Principles

**MISSION**: Build a professional-grade tourist tax payment system that rivals mVAT's quality standards. Every component must demonstrate enterprise-level polish, performance, and user experience.

**ARCHITECTURE**: Modular React + TypeScript architecture with professional styling:
- **Apps**: Tourist tax payment application (`src/apps/tourist-tax/`)
- **Platform**: Shared services and utilities (`src/platform/`)
- **Shell**: Application shell, routing, and layout (`src/shell/`)
- **Assets**: Professional styling system (`src/assets/styles/`)

**QUALITY STANDARDS**: Before and after making changes, verify comprehensively each change. Be critical, picky, comprehensive and precise. Avoid antipatterns like god objects or improperly mixing architecture. Keep code DRY, agnostic, and follow Single Responsibility Principle.

**TYPESCRIPT REQUIREMENT**: All files must be TypeScript (.ts/.tsx). No JavaScript files allowed in production code.

**NODE.JS MANAGEMENT**: All npm/node operations MUST use Makefile targets. Never run npm/node commands directly:
```bash
# ✅ CORRECT - Use Makefile
make install    # Install dependencies
make dev        # Start development server
make build      # Build for production
make test       # Run tests

# ❌ FORBIDDEN - Direct npm commands
npm install
npm run dev
npm run build
```

**TARGET PLATFORM**: Desktop-only application optimized for professional business users. Mobile development is explicitly forbidden.

**PRODUCTION READINESS**: Never assume completion before comprehensive user testing and application log analysis.

## Professional UI/UX Standards (mVAT Quality)

**STYLING ARCHITECTURE**: Professional CSS system following mVAT patterns:
- **Variables**: Complete design token system (`src/assets/styles/base/_variables.scss`)
- **Components**: Professional component library (`src/assets/styles/components/`)
- **Layout**: Enterprise-grade layout system (`src/assets/styles/layout/`)
- **Utilities**: Systematic spacing, shadows, typography (`src/assets/styles/utilities/`)

**DESIGN SYSTEM**: All components must follow mVAT's professional standards:
```scss
// ✅ CORRECT - Professional spacing system
.card {
  padding: var(--space-6);
  margin-bottom: var(--space-8);
  box-shadow: var(--shadow-md);
  border-radius: var(--border-radius-lg);
}

// ❌ FORBIDDEN - Magic numbers and inline styles
.card {
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
```

**COMPONENT QUALITY**: Every component must demonstrate:
- **Professional animations**: Smooth hover effects, micro-interactions
- **Visual hierarchy**: Proper typography, spacing, color usage
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- **Responsive design**: Desktop-optimized with proper breakpoints
- **Performance**: Optimized rendering, minimal re-renders

**FLOATING ACTION BUTTON**: Modern UX pattern for primary actions:
- Context-aware menu expansion
- Professional animations with staggered timing
- Mobile-responsive sizing
- Tooltip integration for accessibility

**NAVBAR STANDARDS**: Professional navigation following mVAT patterns:
- Clean white background with subtle shadows
- Gradient logo with proper branding
- Hover effects and active states
- Professional button styling
- Entity switcher for business context

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

## City Switching Flow (Sub-millisecond Performance)

```typescript
1. User selects new city in CitySelector component
2. CityContext.switchCity(cityCode) called with validation
3. Current city data cleared from in-memory state immediately
4. New city loaded from StorageService with smart caching (cache-first, localStorage fallback)
5. City-specific data loaded synchronously via StorageService:
   - Tax configuration from 'tax-config' storage type
   - Payment methods from 'payment-methods' storage type
   - GDPR settings from 'gdpr-config' storage type
6. Context state updated with batched setState operations to prevent multiple re-renders
7. URL parameter updated via setQuery() for two-way sync (non-blocking)
8. Current city stored in localStorage synchronously for persistence
9. All components re-render with new city data (sub-millisecond performance)
10. No page reload required - all operations are synchronous with smart caching
11. Error handling for invalid cities and storage failures
12. Cache invalidation and refresh mechanisms for optimal performance
```

## Language Switching Flow

```typescript
1. User selects new language in LanguageSwitcher (navbar)
2. LanguageContext.switchLanguage() called with validation
3. i18next language changed via i18n.changeLanguage()
4. URL parameter updated via setQuery() for two-way sync
5. Language preference stored in localStorage via StorageService
6. Document attributes updated (lang, dir) automatically by i18next
7. Bootstrap classes updated automatically by i18next
8. All components re-render with new translations via useTranslation()
9. No page reload required - all operations are synchronous
10. Error handling for unsupported languages and storage failures
```

## Combined City + Language Flow (Independent Operation)

```typescript
1. User switches city → City context updates via smart caching → Components reload city data (sub-millisecond)
2. User switches language → Language context updates via i18next → Same components show translated labels
3. Both contexts work independently and simultaneously with separate caching strategies:
   - City data uses in-memory + localStorage caching for maximum performance
   - Language data uses i18next built-in caching and localStorage persistence
4. URL parameters synchronized independently for both city and language
5. No conflicts or page reloads - all operations are optimally cached and coordinated
6. Components receive updates from both contexts simultaneously without interference
7. Error handling is isolated per context to prevent cascading failures
```

## Performance and Storage Rules

**NO LEGACY FALLBACKS**: Forbidden are any fallbacks to legacy code or data migration during development phase. No absurd timeouts instead of proper fixes. No long timeouts when data is in localStorage/IndexedDB with instant synchronous access.

**STORAGE ACCESS**: localStorage access must use repository pattern via StorageService from `src/platform/storage/` with direct synchronous access. Never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach for optimal performance.

**CITY SWITCHING**: Must be sub-millisecond with synchronous localStorage access. Avoid async/await in UI event handlers for city switching - use fire-and-forget pattern with error handling.

**LARGE DATA STORAGE**: Large data types (transaction history, receipts, audit logs, payment responses) should be stored in IndexedDB with only metadata in localStorage. Implement smart caching with TTL to eliminate excessive data access patterns.

**SINGLE STORAGE SYSTEM**: NEVER use dual storage systems (localStorage + sessionStorage). Use single localStorage + in-memory caching for optimal performance and data integrity. Use IndexedDB for large data like transaction logs, receipts, payment responses, and API cache.

## Code Quality Rules

**ARCHITECTURE REVIEW**: Before and after making changes, verify comprehensively each change. Be critical, picky, comprehensive and precise. Avoid antipatterns like god objects or improperly mixing architecture. Keep code DRY, agnostic, and follow Single Responsibility Principle.

**LOG ANALYSIS**: Each time logs/code are provided, analyze line by line for warnings, errors, hidden issues, semantic/logic inconsistencies. Be precise, critical, comprehensive, detailed and picky.

**PRODUCTION READINESS**: Never assume completion before seeing comprehensive user-tested application logs.

**LOGGING**: Using `console.log` is forbidden. Use proper logging service.

**CONSTANTS**: All storage keys and events must reference variables from constants, never hardcoded magic strings. Use barrel imports from `src/constants/index.ts`.

**URL SYNCHRONIZATION**: Route, language, and city context must be in two-way sync via use-query-params. City selection and payment step should be URL parameters without conflicting with Bootstrap, React, or Router.

