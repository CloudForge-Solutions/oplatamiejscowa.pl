# 🏛️ Tourist Tax Payment System - Development Rules & Architecture

IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we had recent refactoring of directory structures so we have a mess now, and related to missing this or that errors most of code probably exists, we are also migrating to typescript to be typesafe and resilent, and also we are in progress of making the records upload modal work per each subtab

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes

IMPORTANT: insted of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: 	to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accomodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets


## 📋 Project Overview
**Project**: Opłata Miejscowa Online (Tourist Tax Payment System)
**Domain**: Polish cities tourist tax collection with lowest fees
**Tech Stack**: React + TypeScript + Vite + Bootstrap + imoje Payment Gateway
**Target**: Desktop-only application (mobile development forbidden)

## 🚨 CRITICAL DEVELOPMENT RULES

### 🔧 Development Workflow
- **Start server**: `make dev` (uses Makefile exclusively for npm/node operations)
- **Install packages**: `make install` (never use npm directly)
- **Run tests**: Use Makefile targets only
- **TypeScript migration**: Stop `make dev` and restart after .js → .ts conversion (clears Vite cache)

### 🏗️ Architecture Principles
- **Event-driven architecture**: EventBus coordination throughout application
- **Desktop-only**: Mobile development strictly forbidden
- **TypeScript-first**: Migrate any modified .js files to .ts/.tsx during changes
- **No dummy patches**: Find root architectural causes, use `assertMalformedKeys` with error throwing
- **Single Responsibility**: Keep code DRY, agnostic, avoid god objects
- **Bootstrap harmony**: Never fight with Bootstrap, React, or Router

### 🔍 Code Quality Standards
- **Line-by-line analysis**: Review all logs/code comprehensively, find warnings, errors, hidden issues
- **No console.log**: Use logger exclusively
- **No production assumptions**: Never assume completion without user-tested application logs
- **No legacy fallbacks**: No data migration (development phase), no absurd timeouts
- **No deprecated code**: .deprecated1 and .deprecated2 directories are reference-only

## 📦 Constants & Import Rules

### 🔗 Import Standards
```typescript
// ✅ ALLOWED - Barrel import only
import { PAYMENT_STATUS, TOURIST_TAX_TYPES, UI_STATES } from '@/constants';

// ❌ FORBIDDEN - Direct domain imports
import { PAYMENT_STATUS } from '@/apps/tourist-tax/constants';
import { UI_STATES } from '@/shell/constants/UIConstants';
```

**Rules**:
- Storage keys and events: Use constants variables, never hardcoded magic strings
- Barrel imports only via `src/constants/index.ts`
- Reference README.mini-constants.md for constant definitions

### 🌐 URL & Context Synchronization
- **Two-way sync**: Route ↔ Language ↔ Context via use-query-params
- **City in URL**: Selected city as query parameter
- **Payment preview**: Payment ID in route parameter for receipt viewing
- **No framework conflicts**: Never fight with Bootstrap, React, Router

## 💾 Storage Architecture

### 🏗️ Tourist Tax Storage Structure
**Location**: `src/platform/storage/` (TypeScript modules)

**LocalStorage Structure**:
```typescript
// NOTE: Magic strings for example only - use constants in codebase
{
  'global:language:v1.0.0': 'pl',              // User language preference
  'global:selectedCity:v1.0.0': 'krakow',     // Currently selected city
  'global:paymentHistory:v1.0.0': [...],      // Recent payment references
  'tourist:preferences': {...},               // Tourist mode preferences
  'landlord:config': {...},                   // Landlord mode configuration
  'cache:cityRates': {...},                   // Cached tax rates per city
  'cache:reservations': [...]                 // Cached reservation data
}
```

**IndexedDB Structure**:
- **Global database**: City data, tax rates, payment receipts
- **Large data storage**: Payment confirmations, QR codes, reservation files
- **No entity isolation**: Single-user application per browser

### 📋 Storage Access Rules
- **Repository pattern**: Use `LocalStorageManager` and `IndexedDBManager` from `src/platform/storage/`
- **Synchronous access**: Direct localStorage access, never wrap in async
- **Single storage**: localStorage + in-memory caching (no sessionStorage)
- **Large data**: Use IndexedDB for receipts, files, audit logs
- **Smart caching**: TTL-based caching to eliminate excessive access

## 🏗️ Context Architecture

### 📊 Two-Layer Context System (Tourist Tax Specific)

**Layer 1: Service Context (Static)**
- **Purpose**: Application services via ServicesManager
- **Lifecycle**: Never changes during app lifecycle
- **Location**: `src/shell/context/ServiceContext.tsx` (to be implemented)
- **Hooks**: `useServices()`, `useService(name)`
- **Services**: PaymentService, TaxCalculationService, CityDataService

**Layer 2: Language Context (Semi-Static)**
- **Purpose**: i18next integration for Polish/English support
- **Location**: `src/shell/context/LanguageContext.tsx`
- **Hook**: `useLanguage()`
- **Features**:
  - Two-way URL sync via use-query-params
  - Polish currency/date formatting
  - Document attributes auto-update
  - Bootstrap class localization

### 🎯 Architecture Principles
1. **Separation of Concerns**: Each layer has distinct responsibilities
2. **Type Safety**: Full TypeScript coverage with strict typing
3. **Event-Driven**: EventBus coordination between contexts
4. **URL Synchronization**: Language and city selection sync with URL
5. **No Entity Switching**: Single-user application, cities are data not entities
6. **Mode Switching**: Tourist ↔ Landlord modes via routing, not context

## 🌐 Language Switching Flow

**Tourist Tax Language Switching**:
1. User selects new language in LanguageSwitcher (navbar)
2. LanguageContext.switchLanguage() called with validation
3. i18next language changed via i18n.changeLanguage()
4. URL parameter updated via setQuery() for two-way sync
5. Language preference stored in localStorage
6. Document attributes updated (lang, dir) automatically
7. Bootstrap classes updated for RTL/LTR support
8. All components re-render with new translations
9. Event emitted via EventBus for services to react
10. No page reload required - synchronous operation
11. Error handling for unsupported languages

## 🏙️ City Selection Flow

**Tourist Tax City Selection**:
1. User selects city in CitySelector component
2. City data loaded from cache or CityDataService
3. Tax rates and regulations loaded for selected city
4. URL parameter updated for city selection
5. City preference stored in localStorage
6. Components re-render with city-specific data
7. Payment forms update with correct tax rates
8. No page reload required - cached data access

## 🔄 Mode Switching Flow

**Tourist ↔ Landlord Mode Switching**:
1. User clicks mode toggle in navbar
2. Router navigates to appropriate route (/tourist or /landlord)
3. Layout component detects route and updates UI
4. Mode-specific components load with different functionality
5. No context switching - pure routing-based approach
6. Mode preference stored in localStorage
7. Different navigation menus and features per mode

## 💳 Payment Processing Flow

**Tourist Tax Payment Processing**:
1. User fills payment form with reservation details
2. Tax calculation performed based on city rates
3. Payment data validated and sanitized
4. imoje payment gateway integration initiated
5. Payment confirmation received and stored
6. Receipt generated with QR code for verification
7. Payment reference stored in localStorage history
8. Large receipt data stored in IndexedDB
9. Success/failure feedback to user
10. Event emitted for payment completion

## 🔧 Development Best Practices

### 📝 Code Review Checklist
- **Architecture compliance**: No god objects, proper separation of concerns
- **TypeScript coverage**: All new code must be TypeScript
- **Event-driven patterns**: Use EventBus for component communication
- **Storage patterns**: Use repository pattern, no direct localStorage calls
- **Error handling**: Comprehensive error boundaries and validation
- **Performance**: No unnecessary re-renders, smart caching

### 🧪 Testing Requirements
- **Unit tests**: All business logic and utilities
- **Integration tests**: Payment flow, city data loading
- **Component tests**: User interactions and state changes
- **E2E tests**: Complete payment scenarios
- **Run via Makefile**: `make test`, `make test-watch`, `make test-coverage`

### 🔒 Security Considerations
- **Payment data**: Never store sensitive payment info in localStorage
- **API keys**: Environment variables only, never in code
- **Input validation**: Sanitize all user inputs
- **XSS prevention**: Proper escaping and Content Security Policy
- **HTTPS only**: All payment operations over secure connections

## 📚 Documentation Requirements

### 📖 Required Documentation
- **README.mini-constants.md**: All application constants
- **README.mini-architecture.md**: Detailed architecture decisions
- **README.mini-api.md**: API integration documentation
- **Component documentation**: JSDoc for all public interfaces

### 🔄 Documentation Updates
- **Architecture changes**: Update all related README.mini-*.md files
- **No new files**: Update existing documentation, don't create new ones
- **Comprehensive updates**: Don't append/prepend, rewrite sections completely
- **Version control**: Document breaking changes and migration paths
