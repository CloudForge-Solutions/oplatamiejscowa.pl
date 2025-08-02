# Tourist Tax Payment System - Comprehensive Architecture Plan

## 🎯 Project Overview

**Oplata Miejscowa Online** - A comprehensive tourist tax payment system for Polish cities with Chrome extension integration, static GitHub Pages frontend, and Azure Function NestJS backend.

### Core Business Flow
1. **Landlord** creates tourist record via Chrome extension from booking.com reservation pages
2. **System** generates payment link and PDF receipt via Azure Function
3. **Tourist** receives link/QR code, opens on mobile/desktop to pay via imoje
4. **Data** stored in Azure Storage (Table + Blob) with local caching for performance

### Technology Stack
- **Frontend**: React 19 + TypeScript + Bootstrap 5 + Vite (GitHub Pages)
- **Backend**: NestJS + Azure Functions Flex Consumption
- **Storage**: Azure Table Storage + Blob Storage + localStorage + IndexedDB
- **Extension**: Chrome Extension V3 with content scripts
- **Payments**: imoje integration
- **i18n**: i18next with Polish/English support

---

## 🏗️ Architecture Levels

### Level 0: System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Chrome Extension│───▶│ GitHub Pages    │───▶│ Azure Function  │
│ (Booking.com)   │    │ (Static React)  │    │ (NestJS)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ localStorage +  │    │ Azure Storage   │
                       │ IndexedDB       │    │ (Table + Blob)  │
                       └─────────────────┘    └─────────────────┘
```

**Principles:**
- **Eventbus-driven**: All components communicate via EventBus
- **Sub-millisecond performance**: City/mode switching without page reload
- **Offline-first**: Smart caching with localStorage/IndexedDB
- **Type-safe**: Full TypeScript coverage with strict typing

### Level 1: Application Layers

#### 1.1 Chrome Extension Layer
**Location**: `chrome-extension/`
**Responsibility**: Extract booking data from booking.com pages

**Components:**
- **Manifest V3** (`manifest.json`)
- **Background Script** (`background.js`) - Service worker for API communication
- **Content Script** (`content.js`) - DOM manipulation on booking.com
- **Popup** (`popup.html`) - Extension UI for configuration

**Sync/Async Rules:**
- **SYNC**: DOM reading, localStorage access, message passing
- **ASYNC**: API calls to Azure Function, file downloads

#### 1.2 Static Frontend Layer
**Location**: `src/`
**Responsibility**: User interface for tourists and landlords

**Sub-layers:**
- **Shell** (`src/shell/`) - Application foundation
- **Apps** (`src/apps/tourist-tax/`) - Business logic
- **Platform** (`src/platform/`) - Shared utilities
- **Constants** (`src/constants/`) - Application constants

#### 1.3 Backend API Layer
**Location**: `azure-function-nestjs/`
**Responsibility**: Business logic and data persistence

**Components:**
- **Controllers** - HTTP request handling
- **Services** - Business logic implementation
- **DTOs** - Data transfer objects
- **Interfaces** - Type definitions

#### 1.4 Storage Layer
**Responsibility**: Data persistence and caching

**Components:**
- **Azure Table Storage** - Structured data (reservations, payments)
- **Azure Blob Storage** - Files (PDFs, QR codes, audit logs)
- **localStorage** - Context and preferences (synchronous)
- **IndexedDB** - Large data and offline storage (asynchronous)

---

## 📁 Directory Structure

### Frontend Structure (`src/`)

```
src/
├── constants/
│   └── index.ts                    # Barrel export for all constants
├── platform/
│   ├── storage/
│   │   ├── LocalStorageManager.ts  # Synchronous localStorage operations
│   │   ├── IndexedDBManager.ts     # Asynchronous large data storage
│   │   └── StorageService.ts       # Unified storage interface
│   ├── utils/
│   │   ├── formatters.ts           # Currency, date formatting utilities
│   │   ├── validators.ts           # Form validation utilities
│   │   └── logger.ts               # Centralized logging (NO console.log)
│   └── eventbus/
│       └── EventBus.ts             # Application-wide event coordination
├── shell/
│   ├── components/
│   │   ├── Layout.tsx              # Main application layout
│   │   ├── navbar/
│   │   │   ├── TouristNavbar.tsx   # Tourist mode navigation
│   │   │   └── LandlordNavbar.tsx  # Landlord mode navigation
│   │   ├── ErrorBoundary.tsx       # React error boundary
│   │   └── NotFoundPage.tsx        # 404 page component
│   ├── context/
│   │   ├── ServiceContext.tsx      # Layer 1: Static services
│   │   ├── LanguageContext.tsx     # Layer 2: i18n management
│   │   └── TouristTaxContext.tsx   # Layer 3: Dynamic city/mode state
│   ├── i18n/
│   │   ├── config.ts               # i18next configuration
│   │   └── locales/
│   │       ├── pl/                 # Polish translations
│   │       └── en/                 # English translations
│   ├── main.tsx                    # Application entry point
│   └── App.tsx                     # Root component with routing
└── apps/
    └── tourist-tax/
        ├── components/
        │   ├── TouristPaymentForm.tsx      # Tourist payment interface
        │   ├── DynamicReservationsList.tsx # Real-time reservations display
        │   ├── CitySelector.tsx            # City selection component
        │   ├── MobilePaymentSummary.tsx    # Mobile-optimized summary
        │   └── PaymentReceipt.tsx          # Receipt display component
        ├── pages/
        │   ├── LandlordDashboard.tsx       # Landlord main dashboard
        │   ├── LandlordReservations.tsx    # Reservations management
        │   ├── LandlordReports.tsx         # Reports and analytics
        │   └── LandlordDynamicDashboard.tsx # Real-time dashboard example
        ├── hooks/
        │   ├── useTaxCalculation.ts        # Tax calculation logic
        │   ├── usePaymentProcessing.ts     # Payment flow management
        │   ├── useApiData.ts               # Dynamic data fetching
        │   └── useLocalStorage.ts          # Storage operations
        ├── services/
        │   ├── ApiService.ts               # Centralized API client
        │   ├── TaxCalculationService.ts    # Tax calculation logic
        │   ├── ImojePaymentService.ts      # Payment processing
        │   └── ReservationDatabaseService.ts # Local database operations
        └── types/
            └── TouristTaxTypes.ts          # TypeScript type definitions
```

### Backend Structure (`azure-function-nestjs/`)

```
azure-function-nestjs/
├── src/
│   ├── controllers/
│   │   ├── reservations.controller.ts  # Reservation CRUD operations
│   │   ├── payments.controller.ts      # Payment processing
│   │   ├── cities.controller.ts        # City configuration
│   │   └── documents.controller.ts     # PDF/QR generation
│   ├── services/
│   │   ├── reservation.service.ts      # Reservation business logic
│   │   ├── payment.service.ts          # Payment processing logic
│   │   ├── city.service.ts             # City data management
│   │   └── document.service.ts         # Document generation
│   ├── dto/
│   │   ├── reservation.dto.ts          # Reservation data transfer objects
│   │   ├── payment.dto.ts              # Payment DTOs
│   │   └── city.dto.ts                 # City configuration DTOs
│   ├── interfaces/
│   │   ├── reservation.interface.ts    # Reservation type definitions
│   │   ├── payment.interface.ts        # Payment interfaces
│   │   └── storage.interface.ts        # Storage abstractions
│   ├── modules/
│   │   ├── reservation.module.ts       # Reservation module
│   │   ├── payment.module.ts           # Payment module
│   │   └── city.module.ts              # City module
│   ├── app.module.ts                   # Root NestJS module
│   └── main.ts                         # Azure Function entry point
├── package.json                        # Dependencies and scripts
└── host.json                          # Azure Functions configuration
```

### Chrome Extension Structure (`chrome-extension/`)

```
chrome-extension/
├── manifest.json                       # Extension manifest V3
├── background.js                       # Service worker (ASYNC API calls)
├── content.js                          # Content script (SYNC DOM operations)
├── popup/
│   ├── popup.html                      # Extension popup UI
│   ├── popup.js                        # Popup logic (SYNC)
│   └── popup.css                       # Popup styling
├── icons/                              # Extension icons
└── permissions.json                    # Required permissions
```

---

## 🔧 Class Responsibilities & Sync/Async Patterns

### Frontend Classes

#### Core Storage Classes

**LocalStorageManager** (`src/platform/storage/LocalStorageManager.ts`)
- **Responsibility**: Synchronous localStorage operations for context data
- **Pattern**: SYNC ONLY - sub-millisecond performance requirement
- **Methods**:
  - `get(key: string): any` - SYNC retrieval
  - `set(key: string, value: any): boolean` - SYNC storage
  - `remove(key: string): void` - SYNC deletion
  - `getUserPreferences(): UserPreferences` - SYNC preferences
  - `updateFormDataCache(data: FormDataCache): boolean` - SYNC cache update

**IndexedDBManager** (`src/platform/storage/IndexedDBManager.ts`)
- **Responsibility**: Asynchronous large data storage
- **Pattern**: ASYNC with Promise-based API
- **Methods**:
  - `async initialize(): Promise<void>` - ASYNC database setup
  - `async storeDocument(doc: Document): Promise<string>` - ASYNC file storage
  - `async getDocument(id: string): Promise<Document>` - ASYNC retrieval
  - `async clearExpiredCache(): Promise<void>` - ASYNC cleanup

#### Context Classes

**TouristTaxContext** (`src/shell/context/TouristTaxContext.tsx`)
- **Responsibility**: Dynamic city/mode state management
- **Pattern**: SYNC state updates, ASYNC data loading
- **Methods**:
  - `switchCity(cityCode: string): void` - SYNC context switch
  - `switchMode(mode: AppMode): void` - SYNC mode change
  - `async loadCityData(cityCode: string): Promise<void>` - ASYNC data loading
  - `getCachedCityData(cityCode: string): CityData | null` - SYNC cache access

**LanguageContext** (`src/shell/context/LanguageContext.tsx`)
- **Responsibility**: i18n state management
- **Pattern**: SYNC language switching
- **Methods**:
  - `switchLanguage(lang: Language): void` - SYNC language change
  - `formatCurrency(amount: number): string` - SYNC formatting
  - `formatDate(date: Date): string` - SYNC formatting

#### Service Classes

**ApiService** (`src/apps/tourist-tax/services/ApiService.ts`)
- **Responsibility**: Centralized HTTP client with caching
- **Pattern**: ASYNC with retry logic and caching
- **Methods**:
  - `async createReservation(data: ReservationData): Promise<ApiResponse>` - ASYNC API call
  - `async getReservationsByCity(cityCode: string): Promise<ApiResponse>` - ASYNC with cache
  - `async generateReceipt(id: string): Promise<ApiResponse>` - ASYNC document generation

**TaxCalculationService** (`src/apps/tourist-tax/services/TaxCalculationService.ts`)
- **Responsibility**: Tax calculation logic with fallbacks
- **Pattern**: ASYNC with local fallback
- **Methods**:
  - `async calculateTax(request: TaxCalculationRequest): Promise<ApiResponse>` - ASYNC API call
  - `calculateTaxLocally(request: TaxCalculationRequest): ApiResponse` - SYNC fallback

#### Hook Classes

**useApiData** (`src/apps/tourist-tax/hooks/useApiData.ts`)
- **Responsibility**: Dynamic data fetching with caching
- **Pattern**: ASYNC data loading, SYNC cache access
- **Methods**:
  - `loadFromCache(): T | null` - SYNC cache retrieval
  - `saveToCache(data: T): void` - SYNC cache storage
  - `async fetchData(): Promise<void>` - ASYNC API call
  - `async refetch(): Promise<void>` - ASYNC manual refresh

### Backend Classes

#### Controller Classes

**ReservationsController** (`azure-function-nestjs/src/controllers/reservations.controller.ts`)
- **Responsibility**: HTTP request handling for reservations
- **Pattern**: ASYNC with proper error handling
- **Methods**:
  - `async createReservation(@Body() dto: CreateReservationDto): Promise<ReservationData>` - ASYNC
  - `async getReservationsByCity(@Param() cityCode: string): Promise<ReservationData[]>` - ASYNC
  - `async updateReservationStatus(@Param() id: string, @Body() dto: UpdateStatusDto): Promise<ReservationData>` - ASYNC

#### Service Classes

**ReservationService** (`azure-function-nestjs/src/services/reservation.service.ts`)
- **Responsibility**: Business logic and Azure Storage integration
- **Pattern**: ASYNC with transaction support
- **Methods**:
  - `async create(dto: CreateReservationDto): Promise<ReservationData>` - ASYNC with audit logging
  - `async findByCity(cityCode: string, query: ReservationQueryDto): Promise<ReservationData[]>` - ASYNC with filtering
  - `async updateStatus(id: string, status: ReservationStatus): Promise<ReservationData>` - ASYNC with validation

### Chrome Extension Classes

**BackgroundScript** (`chrome-extension/background.js`)
- **Responsibility**: Service worker for API communication
- **Pattern**: ASYNC message handling
- **Methods**:
  - `async handleMessage(message, sender, sendResponse)` - ASYNC message processing
  - `async sendToAzureFunction(data)` - ASYNC API communication
  - `async storeExtensionData(data)` - ASYNC local storage

**ContentScript** (`chrome-extension/content.js`)
- **Responsibility**: DOM manipulation on booking.com
- **Pattern**: SYNC DOM operations, ASYNC messaging
- **Methods**:
  - `extractReservationData()` - SYNC DOM reading
  - `injectTouristTaxUI()` - SYNC DOM modification
  - `async sendToBackground(data)` - ASYNC message to background script

---

## 🚀 Best Practices & Built-in Functionality

### React & TypeScript Best Practices

1. **Strict TypeScript Configuration**
   ```typescript
   // tsconfig.json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "strictNullChecks": true,
       "noImplicitReturns": true
     }
   }
   ```

2. **Component Patterns**
   - Use functional components with hooks
   - Implement proper error boundaries
   - Follow single responsibility principle
   - Use React.memo for performance optimization

3. **State Management**
   - Context API for global state (city, language, mode)
   - Local state for component-specific data
   - Custom hooks for reusable logic
   - EventBus for cross-component communication

### Chrome Extension Best Practices

1. **Manifest V3 Compliance**
   ```json
   {
     "manifest_version": 3,
     "service_worker": "background.js",
     "content_scripts": [{
       "matches": ["*://*.booking.com/*"],
       "js": ["content.js"]
     }]
   }
   ```

2. **Security Practices**
   - Use content security policy
   - Validate all external data
   - Sanitize DOM injections
   - Implement proper permissions

3. **Performance Optimization**
   - Lazy load content scripts
   - Use efficient DOM queries
   - Implement debouncing for user interactions
   - Cache frequently accessed data

### Browser API Utilization

1. **Storage APIs**
   ```typescript
   // localStorage for synchronous context data
   localStorage.setItem(STORAGE_KEYS.GLOBAL_SELECTED_CITY, cityCode);
   
   // IndexedDB for large asynchronous data
   await indexedDB.open('TouristTaxDB', 1);
   ```

2. **Fetch API with Error Handling**
   ```typescript
   const response = await fetch(url, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(data),
     signal: AbortSignal.timeout(30000)
   });
   ```

3. **URL API for Route Management**
   ```typescript
   const url = new URL(window.location);
   url.searchParams.set('city', cityCode);
   window.history.pushState({}, '', url);
   ```

### Performance Optimization

1. **Sub-millisecond City Switching**
   - Synchronous localStorage access
   - In-memory caching layer
   - Batched state updates
   - Smart cache invalidation

2. **Lazy Loading Strategies**
   - Code splitting with React.lazy
   - Dynamic imports for heavy components
   - Progressive data loading
   - Background prefetching

3. **Memory Management**
   - Proper cleanup in useEffect
   - WeakMap for object references
   - Debounced API calls
   - Efficient re-rendering patterns

### Security & GDPR Compliance

1. **Data Protection**
   - Encrypt sensitive data in storage
   - Implement data retention policies
   - Provide data export functionality
   - Clear consent mechanisms

2. **API Security**
   - HTTPS-only communication
   - Request validation and sanitization
   - Rate limiting implementation
   - Proper error handling without data leakage

---

## 📊 Data Flow Patterns

### Synchronous Data Flow (Sub-millisecond)
```
User Action → Context Update → localStorage → In-Memory Cache → Component Re-render
```

### Asynchronous Data Flow (Network/Heavy Operations)
```
User Action → Loading State → API Call → Cache Update → Success/Error State → Component Update
```

### Chrome Extension Data Flow
```
DOM Event → Content Script → Background Script → Azure Function → Response → UI Update
```

This comprehensive architecture ensures maintainable, performant, and scalable tourist tax payment system with proper separation of concerns and optimal user experience.
