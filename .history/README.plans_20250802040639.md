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

---

## 🎨 UI/UX Architecture - Complete Component Hierarchy

### Level 0: Application Shell

**Root Layout Structure:**
```
App.tsx
├── ErrorBoundary
├── LanguageProvider
├── ServiceProvider
├── TouristTaxProvider
└── Router
    ├── Layout
    │   ├── Navbar (Mode-Specific)
    │   ├── Main Content Area
    │   └── FloatingActionButton
    └── Routes (Mode-Specific Pages)
```

### Level 1: Core Layout Components

#### 1.1 Layout Component (`src/shell/components/Layout.tsx`)
**Responsibility**: Main application shell with mode detection
**Features**:
- Automatic mode detection from route (`/landlord/*` vs `/tourist/*`)
- Mode-specific navbar rendering
- Responsive main content area
- Development mode indicator
- Floating action button integration

**Layout Structure:**
```tsx
<div className="d-flex flex-column vh-100">
  {/* Mode-specific Navbar */}
  {currentMode === 'tourist' ? <TouristNavbar /> : <LandlordNavbar />}

  {/* Main Content Area */}
  <main className="flex-grow-1 overflow-auto bg-light">
    {children}
  </main>

  {/* Floating Action Button */}
  <FloatingActionButton />

  {/* Development Indicator */}
  {import.meta.env.DEV && <DevelopmentBadge />}
</div>
```

#### 1.2 Navigation Components

**TouristNavbar** (`src/shell/components/navbar/TouristNavbar.tsx`)
- **Purpose**: Simplified navigation for payment flow
- **Features**:
  - City selector dropdown
  - Language switcher
  - Mode switch button
  - Progress indicator for multi-step forms
  - Mobile-optimized hamburger menu

**LandlordNavbar** (`src/shell/components/navbar/LandlordNavbar.tsx`)
- **Purpose**: Comprehensive navigation for business operations
- **Features**:
  - Dashboard navigation
  - Reservations management
  - Reports and analytics
  - Import/export tools
  - Settings and configuration
  - Real-time notification badges

### Level 2: Page-Level Components

#### 2.1 Tourist Mode Pages

**TouristPaymentForm** (`src/apps/tourist-tax/components/TouristPaymentForm.tsx`)
- **Purpose**: Main payment interface for tourists
- **Layout**: Multi-step wizard with progress tracking
- **Components**:
  ```tsx
<Container>
    <ProgressBar currentStep={currentStep} totalSteps={4} />

    {currentStep === 'destination' && (
      <DestinationStep>
        <CitySelector />
        <DateRangePicker />
        <GuestCountSelector />
      </DestinationStep>
    )}

    {currentStep === 'details' && (
      <PersonalDetailsStep>
        <GuestInformationForm />
        <AccommodationDetailsForm />
      </PersonalDetailsStep>
    )}

    {currentStep === 'summary' && (
      <PaymentSummaryStep>
        <TaxCalculationDisplay />
        <PaymentMethodSelector />
        <GDPRConsentCheckboxes />
      </PaymentSummaryStep>
    )}

    {currentStep === 'payment' && (
      <PaymentProcessingStep>
        <ImojePaymentWidget />
        <PaymentStatusIndicator />
      </PaymentProcessingStep>
    )}
  </Container>
```

**MobilePaymentSummary** (`src/apps/tourist-tax/components/MobilePaymentSummary.tsx`)
- **Purpose**: Mobile-optimized payment summary
- **Features**:
  - Swipe-friendly interface
  - Large touch targets
  - Simplified information display
  - Quick payment actions

#### 2.2 Landlord Mode Pages

**LandlordDashboard** (`src/apps/tourist-tax/pages/LandlordDashboard.tsx`)
- **Purpose**: Main landlord control center
- **Layout**: Grid-based dashboard with widgets
- **Components**:
  ```tsx
<Container fluid>
    <Row className="mb-4">
      <Col><DashboardHeader /></Col>
    </Row>

    <Row className="mb-4">
      <Col md={3}><StatisticsCard type="total-reservations" /></Col>
      <Col md={3}><StatisticsCard type="pending-payments" /></Col>
      <Col md={3}><StatisticsCard type="total-revenue" /></Col>
      <Col md={3}><StatisticsCard type="today-checkins" /></Col>
    </Row>

    <Row className="mb-4">
      <Col md={8}><RecentReservationsTable /></Col>
      <Col md={4}><QuickActionsPanel /></Col>
    </Row>

    <Row>
      <Col md={6}><RevenueChart /></Col>
      <Col md={6}><CityDistributionChart /></Col>
    </Row>
  </Container>
```

**LandlordReservations** (`src/apps/tourist-tax/pages/LandlordReservations.tsx`)
- **Purpose**: Comprehensive reservation management
- **Features**:
  - Advanced filtering and search
  - Bulk operations
  - Export functionality
  - Real-time status updates

**LandlordDynamicDashboard** (`src/apps/tourist-tax/pages/LandlordDynamicDashboard.tsx`)
- **Purpose**: Real-time dashboard with live data
- **Features**:
  - Auto-refresh capabilities
  - Real-time status indicators
  - Dynamic filtering
  - Live statistics updates

### Level 3: Feature Components

#### 3.1 Core Business Components

**CitySelector** (`src/apps/tourist-tax/components/CitySelector.tsx`)
- **Purpose**: City selection with tax rate display
- **Features**:
  - Dropdown with city search
  - Tax rate preview
  - City-specific information
  - Validation and error handling
- **Structure**:
  ```tsx
<Form.Group>
    <Form.Label>{t('city.select')}</Form.Label>
    <Form.Select
      value={selectedCity}
      onChange={handleCityChange}
      isInvalid={!!errors.city}
    >
      <option value="">{t('city.placeholder')}</option>
      {cities.map(city => (
        <option key={city.code} value={city.code}>
          {city.name} - {formatCurrency(city.taxRate)}/night
        </option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">
      {errors.city}
    </Form.Control.Feedback>
  </Form.Group>
```

**DynamicReservationsList** (`src/apps/tourist-tax/components/DynamicReservationsList.tsx`)
- **Purpose**: Real-time reservations display with filtering
- **Features**:
  - Live data updates
  - Advanced filtering
  - Pagination
  - Export capabilities
  - Bulk actions

**PaymentReceipt** (`src/apps/tourist-tax/components/PaymentReceipt.tsx`)
- **Purpose**: Payment confirmation and receipt display
- **Features**:
  - PDF generation
  - QR code display
  - Email sending
  - Print functionality

#### 3.2 Form Components

**TaxCalculationDisplay** (`src/apps/tourist-tax/components/TaxCalculationDisplay.tsx`)
- **Purpose**: Tax breakdown visualization
- **Features**:
  - Itemized calculation
  - Visual breakdown charts
  - Currency formatting
  - Multi-language support
- **Structure**:
  ```tsx
<Card className="tax-calculation-card">
    <Card.Header>
      <h5>{t('tax.calculation.title')}</h5>
    </Card.Header>
    <Card.Body>
      <Table borderless>
        <tbody>
          <tr>
            <td>{t('tax.nights')}</td>
            <td className="text-end">{numberOfNights}</td>
          </tr>
          <tr>
            <td>{t('tax.guests')}</td>
            <td className="text-end">{guestCount}</td>
          </tr>
          <tr>
            <td>{t('tax.rate')}</td>
            <td className="text-end">{formatCurrency(taxRate)}</td>
          </tr>
          <tr className="border-top">
            <td><strong>{t('tax.total')}</strong></td>
            <td className="text-end">
              <strong>{formatCurrency(totalAmount)}</strong>
            </td>
          </tr>
        </tbody>
      </Table>
    </Card.Body>
  </Card>
```

**GuestInformationForm** (`src/apps/tourist-tax/components/GuestInformationForm.tsx`)
- **Purpose**: Guest details collection
- **Features**:
  - Real-time validation
  - Auto-completion
  - GDPR compliance
  - Multi-language labels

**AccommodationDetailsForm** (`src/apps/tourist-tax/components/AccommodationDetailsForm.tsx`)
- **Purpose**: Accommodation information collection
- **Features**:
  - Accommodation type selection
  - Address validation
  - Integration with booking platforms
  - Auto-fill from Chrome extension data

### Level 4: UI Elements & Micro-Components

#### 4.1 Interactive Elements

**DateRangePicker** (`src/apps/tourist-tax/components/elements/DateRangePicker.tsx`)
- **Purpose**: Check-in/check-out date selection
- **Features**:
  - Calendar widget
  - Date validation
  - Minimum stay requirements
  - Seasonal rate display
- **Implementation**:
  ```tsx
<Row>
    <Col md={6}>
      <Form.Group>
        <Form.Label>{t('dates.checkin')}</Form.Label>
        <Form.Control
          type="date"
          value={checkInDate}
          onChange={handleCheckInChange}
          min={today}
          max={maxDate}
          isInvalid={!!errors.checkIn}
        />
      </Form.Group>
    </Col>
    <Col md={6}>
      <Form.Group>
        <Form.Label>{t('dates.checkout')}</Form.Label>
        <Form.Control
          type="date"
          value={checkOutDate}
          onChange={handleCheckOutChange}
          min={minCheckOut}
          max={maxDate}
          isInvalid={!!errors.checkOut}
        />
      </Form.Group>
    </Col>
  </Row>
```

**GuestCountSelector** (`src/apps/tourist-tax/components/elements/GuestCountSelector.tsx`)
- **Purpose**: Number of guests selection
- **Features**:
  - Increment/decrement buttons
  - Input validation
  - Maximum guest limits
  - Visual feedback

**ProgressBar** (`src/apps/tourist-tax/components/elements/ProgressBar.tsx`)
- **Purpose**: Multi-step form progress indication
- **Features**:
  - Step visualization
  - Current step highlighting
  - Clickable navigation
  - Mobile-responsive design

#### 4.2 Display Components

**StatisticsCard** (`src/apps/tourist-tax/components/elements/StatisticsCard.tsx`)
- **Purpose**: Dashboard metric display
- **Features**:
  - Animated counters
  - Trend indicators
  - Color-coded status
  - Responsive sizing
- **Variants**:
  - `total-reservations`
  - `pending-payments`
  - `total-revenue`
  - `today-checkins`
  - `conversion-rate`

**StatusBadge** (`src/apps/tourist-tax/components/elements/StatusBadge.tsx`)
- **Purpose**: Status indication for reservations/payments
- **Features**:
  - Color-coded statuses
  - Icon integration
  - Tooltip information
  - Animation effects

**CurrencyDisplay** (`src/apps/tourist-tax/components/elements/CurrencyDisplay.tsx`)
- **Purpose**: Consistent currency formatting
- **Features**:
  - Multi-currency support
  - Locale-aware formatting
  - Size variants
  - Emphasis styling

#### 4.3 Interactive Widgets

**PaymentMethodSelector** (`src/apps/tourist-tax/components/elements/PaymentMethodSelector.tsx`)
- **Purpose**: Payment method selection interface
- **Features**:
  - Visual payment method cards
  - Fee information display
  - Security indicators
  - Mobile-optimized layout

**ImojePaymentWidget** (`src/apps/tourist-tax/components/elements/ImojePaymentWidget.tsx`)
- **Purpose**: Embedded imoje payment interface
- **Features**:
  - Secure iframe integration
  - Payment status tracking
  - Error handling
  - Mobile responsiveness

**QRCodeDisplay** (`src/apps/tourist-tax/components/elements/QRCodeDisplay.tsx`)
- **Purpose**: QR code generation and display
- **Features**:
  - Dynamic QR code generation
  - Download functionality
  - Print optimization
  - Mobile sharing

### Level 5: Atomic UI Components

#### 5.1 Form Controls

**CitySearchInput** (`src/apps/tourist-tax/components/atoms/CitySearchInput.tsx`)
- **Purpose**: Searchable city input with autocomplete
- **Features**:
  - Real-time search filtering
  - Keyboard navigation
  - Accessibility compliance
  - Custom styling
- **Implementation**:
  ```tsx
<div className="city-search-container">
    <Form.Control
      type="text"
      placeholder={t('city.search.placeholder')}
      value={searchTerm}
      onChange={handleSearch}
      onKeyDown={handleKeyDown}
      aria-label={t('city.search.aria')}
      aria-expanded={isDropdownOpen}
      aria-haspopup="listbox"
    />
    {isDropdownOpen && (
      <div className="city-dropdown" role="listbox">
        {filteredCities.map((city, index) => (
          <div
            key={city.code}
            className={`city-option ${index === selectedIndex ? 'selected' : ''}`}
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => selectCity(city)}
          >
            <span className="city-name">{city.name}</span>
            <span className="city-rate">{formatCurrency(city.taxRate)}/night</span>
          </div>
        ))}
      </div>
    )}
  </div>
```

**NumericInput** (`src/apps/tourist-tax/components/atoms/NumericInput.tsx`)
- **Purpose**: Numeric input with increment/decrement controls
- **Features**:
  - Touch-friendly buttons
  - Keyboard input support
  - Min/max validation
  - Custom step values

**CurrencyInput** (`src/apps/tourist-tax/components/atoms/CurrencyInput.tsx`)
- **Purpose**: Currency-specific input formatting
- **Features**:
  - Real-time formatting
  - Locale-aware display
  - Validation rules
  - Error states

#### 5.2 Feedback Components

**LoadingSpinner** (`src/apps/tourist-tax/components/atoms/LoadingSpinner.tsx`)
- **Purpose**: Loading state indication
- **Variants**:
  - `small` - Inline loading
  - `medium` - Button loading
  - `large` - Page loading
  - `overlay` - Full-screen loading

**Toast** (`src/apps/tourist-tax/components/atoms/Toast.tsx`)
- **Purpose**: Temporary notification display
- **Types**:
  - `success` - Payment completed
  - `error` - Payment failed
  - `warning` - Validation issues
  - `info` - General information

**ErrorMessage** (`src/apps/tourist-tax/components/atoms/ErrorMessage.tsx`)
- **Purpose**: Error state display
- **Features**:
  - Icon integration
  - Retry functionality
  - Detailed error information
  - User-friendly messaging

#### 5.3 Navigation Elements

**Breadcrumb** (`src/apps/tourist-tax/components/atoms/Breadcrumb.tsx`)
- **Purpose**: Navigation path indication
- **Features**:
  - Clickable navigation
  - Current page highlighting
  - Mobile-responsive collapse
  - Accessibility support

**Pagination** (`src/apps/tourist-tax/components/atoms/Pagination.tsx`)
- **Purpose**: Data pagination controls
- **Features**:
  - Page number display
  - Previous/next navigation
  - Jump to page functionality
  - Mobile-optimized controls

**TabNavigation** (`src/apps/tourist-tax/components/atoms/TabNavigation.tsx`)
- **Purpose**: Tab-based content switching
- **Features**:
  - Keyboard navigation
  - Active state indication
  - Responsive design
  - Badge support for notifications

### Level 6: Layout & Container Components

#### 6.1 Grid System Components

**ResponsiveGrid** (`src/apps/tourist-tax/components/layout/ResponsiveGrid.tsx`)
- **Purpose**: Responsive grid layout system
- **Features**:
  - Bootstrap grid integration
  - Custom breakpoints
  - Auto-sizing columns
  - Gap control

**CardGrid** (`src/apps/tourist-tax/components/layout/CardGrid.tsx`)
- **Purpose**: Card-based grid layout
- **Features**:
  - Masonry layout support
  - Responsive card sizing
  - Hover effects
  - Loading states

**FlexContainer** (`src/apps/tourist-tax/components/layout/FlexContainer.tsx`)
- **Purpose**: Flexible layout container
- **Features**:
  - Direction control
  - Alignment options
  - Wrap behavior
  - Gap management

#### 6.2 Modal & Overlay Components

**ConfirmationModal** (`src/apps/tourist-tax/components/modals/ConfirmationModal.tsx`)
- **Purpose**: User action confirmation
- **Features**:
  - Customizable content
  - Action buttons
  - Escape key handling
  - Focus management

**PaymentModal** (`src/apps/tourist-tax/components/modals/PaymentModal.tsx`)
- **Purpose**: Payment processing overlay
- **Features**:
  - Secure payment form
  - Progress indication
  - Error handling
  - Mobile optimization

**ReservationDetailsModal** (`src/apps/tourist-tax/components/modals/ReservationDetailsModal.tsx`)
- **Purpose**: Detailed reservation information
- **Features**:
  - Comprehensive data display
  - Edit functionality
  - Print/export options
  - Status updates

#### 6.3 Sidebar & Panel Components

**FilterSidebar** (`src/apps/tourist-tax/components/panels/FilterSidebar.tsx`)
- **Purpose**: Advanced filtering interface
- **Features**:
  - Collapsible sections
  - Multiple filter types
  - Clear all functionality
  - Applied filters display

**QuickActionsPanel** (`src/apps/tourist-tax/components/panels/QuickActionsPanel.tsx`)
- **Purpose**: Frequently used actions
- **Features**:
  - Action shortcuts
  - Recent items
  - Favorites management
  - Customizable layout

**NotificationPanel** (`src/apps/tourist-tax/components/panels/NotificationPanel.tsx`)
- **Purpose**: System notifications display
- **Features**:
  - Real-time updates
  - Categorized notifications
  - Mark as read functionality
  - Action buttons

### Level 7: Data Visualization Components

#### 7.1 Chart Components

**RevenueChart** (`src/apps/tourist-tax/components/charts/RevenueChart.tsx`)
- **Purpose**: Revenue trend visualization
- **Features**:
  - Time-based data display
  - Interactive tooltips
  - Zoom functionality
  - Export capabilities
- **Chart Types**:
  - Line chart for trends
  - Bar chart for comparisons
  - Area chart for cumulative data

**CityDistributionChart** (`src/apps/tourist-tax/components/charts/CityDistributionChart.tsx`)
- **Purpose**: City-based data distribution
- **Features**:
  - Pie chart visualization
  - Interactive segments
  - Legend display
  - Percentage calculations

**OccupancyChart** (`src/apps/tourist-tax/components/charts/OccupancyChart.tsx`)
- **Purpose**: Accommodation occupancy rates
- **Features**:
  - Calendar heatmap
  - Seasonal patterns
  - Booking trends
  - Capacity indicators

#### 7.2 Table Components

**ReservationsTable** (`src/apps/tourist-tax/components/tables/ReservationsTable.tsx`)
- **Purpose**: Comprehensive reservations data display
- **Features**:
  - Sortable columns
  - Inline editing
  - Bulk selection
  - Export functionality
- **Columns**:
  - Guest information
  - Dates and duration
  - Payment status
  - Actions menu

**PaymentsTable** (`src/apps/tourist-tax/components/tables/PaymentsTable.tsx`)
- **Purpose**: Payment transactions display
- **Features**:
  - Transaction details
  - Status tracking
  - Refund capabilities
  - Receipt generation

**AuditTable** (`src/apps/tourist-tax/components/tables/AuditTable.tsx`)
- **Purpose**: System audit log display
- **Features**:
  - Chronological listing
  - User action tracking
  - Detailed change logs
  - Search functionality

#### 7.3 Summary Components

**DashboardSummary** (`src/apps/tourist-tax/components/summary/DashboardSummary.tsx`)
- **Purpose**: High-level metrics overview
- **Features**:
  - Key performance indicators
  - Trend indicators
  - Quick insights
  - Drill-down capabilities

**PaymentSummary** (`src/apps/tourist-tax/components/summary/PaymentSummary.tsx`)
- **Purpose**: Payment transaction summary
- **Features**:
  - Total amounts
  - Fee breakdown
  - Tax calculations
  - Receipt preview

**ReportSummary** (`src/apps/tourist-tax/components/summary/ReportSummary.tsx`)
- **Purpose**: Report data aggregation
- **Features**:
  - Period summaries
  - Comparative analysis
  - Export options
  - Scheduled reports

### Level 8: Chrome Extension UI Components

#### 8.1 Extension Popup Components

**ExtensionPopup** (`chrome-extension/popup/components/ExtensionPopup.tsx`)
- **Purpose**: Main extension interface
- **Features**:
  - Booking data extraction status
  - Quick actions menu
  - Settings access
  - Connection status indicator
- **Layout**:
  ```tsx
  <div className="extension-popup">
    <header className="popup-header">
      <img src="icon.png" alt="Tourist Tax" />
      <h3>Oplata Miejscowa</h3>
      <StatusIndicator />
    </header>

    <main className="popup-content">
      <BookingDetectionPanel />
      <QuickActionsMenu />
      <RecentReservations />
    </main>

    <footer className="popup-footer">
      <SettingsButton />
      <HelpButton />
    </footer>
  </div>
  ```

**BookingDetectionPanel** (`chrome-extension/popup/components/BookingDetectionPanel.tsx`)
- **Purpose**: Booking.com page detection and data extraction
- **Features**:
  - Page detection status
  - Data extraction preview
  - Manual extraction trigger
  - Error reporting

**QuickActionsMenu** (`chrome-extension/popup/components/QuickActionsMenu.tsx`)
- **Purpose**: Frequently used extension actions
- **Features**:
  - Create new reservation
  - View recent reservations
  - Open landlord dashboard
  - Sync with Azure Function

#### 8.2 Content Script UI Components

**BookingPageOverlay** (`chrome-extension/content/components/BookingPageOverlay.tsx`)
- **Purpose**: Overlay on booking.com pages
- **Features**:
  - Tourist tax information display
  - Quick calculation preview
  - Payment link generation
  - Seamless integration with booking UI

**ReservationHighlight** (`chrome-extension/content/components/ReservationHighlight.tsx`)
- **Purpose**: Highlight reservation elements on booking pages
- **Features**:
  - Visual indicators for processed reservations
  - Status badges
  - Quick action buttons
  - Non-intrusive design

**TaxCalculationTooltip** (`chrome-extension/content/components/TaxCalculationTooltip.tsx`)
- **Purpose**: Hover tooltip with tax calculation
- **Features**:
  - Real-time tax calculation
  - City-specific rates
  - Breakdown display
  - Payment link access

### Level 9: Responsive Design & Mobile Components

#### 9.1 Mobile-Specific Components

**MobileNavigation** (`src/apps/tourist-tax/components/mobile/MobileNavigation.tsx`)
- **Purpose**: Mobile-optimized navigation
- **Features**:
  - Bottom tab navigation
  - Swipe gestures
  - Large touch targets
  - Thumb-friendly design

**MobilePaymentFlow** (`src/apps/tourist-tax/components/mobile/MobilePaymentFlow.tsx`)
- **Purpose**: Mobile payment experience
- **Features**:
  - Single-column layout
  - Progressive disclosure
  - Touch-optimized inputs
  - Simplified navigation

**MobileDashboard** (`src/apps/tourist-tax/components/mobile/MobileDashboard.tsx`)
- **Purpose**: Mobile landlord dashboard
- **Features**:
  - Card-based layout
  - Swipeable sections
  - Collapsible panels
  - Quick actions

#### 9.2 Progressive Web App Components

**InstallPrompt** (`src/apps/tourist-tax/components/pwa/InstallPrompt.tsx`)
- **Purpose**: PWA installation prompt
- **Features**:
  - Native install prompt
  - Custom install UI
  - Dismissible banner
  - Installation tracking

**OfflineIndicator** (`src/apps/tourist-tax/components/pwa/OfflineIndicator.tsx`)
- **Purpose**: Offline status indication
- **Features**:
  - Connection status display
  - Offline capabilities info
  - Sync status indicator
  - Retry functionality

**PushNotificationManager** (`src/apps/tourist-tax/components/pwa/PushNotificationManager.tsx`)
- **Purpose**: Push notification handling
- **Features**:
  - Permission requests
  - Notification display
  - Action handling
  - Subscription management

### Level 10: Accessibility & Internationalization Components

#### 10.1 Accessibility Components

**ScreenReaderText** (`src/apps/tourist-tax/components/a11y/ScreenReaderText.tsx`)
- **Purpose**: Screen reader only content
- **Features**:
  - Visually hidden text
  - Context information
  - Navigation aids
  - Form descriptions

**FocusManager** (`src/apps/tourist-tax/components/a11y/FocusManager.tsx`)
- **Purpose**: Focus management for modals and overlays
- **Features**:
  - Focus trapping
  - Return focus handling
  - Skip links
  - Keyboard navigation

**AriaLiveRegion** (`src/apps/tourist-tax/components/a11y/AriaLiveRegion.tsx`)
- **Purpose**: Dynamic content announcements
- **Features**:
  - Status updates
  - Error announcements
  - Progress notifications
  - Form validation feedback

#### 10.2 Internationalization Components

**LanguageSwitcher** (`src/apps/tourist-tax/components/i18n/LanguageSwitcher.tsx`)
- **Purpose**: Language selection interface
- **Features**:
  - Flag icons
  - Language names
  - Smooth transitions
  - Persistence handling

**CurrencyFormatter** (`src/apps/tourist-tax/components/i18n/CurrencyFormatter.tsx`)
- **Purpose**: Locale-aware currency display
- **Features**:
  - Multi-currency support
  - Regional formatting
  - Symbol positioning
  - Decimal handling

**DateTimeFormatter** (`src/apps/tourist-tax/components/i18n/DateTimeFormatter.tsx`)
- **Purpose**: Locale-aware date/time display
- **Features**:
  - Regional date formats
  - Time zone handling
  - Relative time display
  - Calendar integration

### Level 11: Feature-Specific Functional Components

#### 11.1 Payment Processing Features

**PaymentFlowManager** (`src/apps/tourist-tax/features/payment/PaymentFlowManager.tsx`)
- **Purpose**: Complete payment flow orchestration
- **Features**:
  - Multi-step coordination
  - State management
  - Error recovery
  - Progress tracking

**PaymentMethodIntegration** (`src/apps/tourist-tax/features/payment/PaymentMethodIntegration.tsx`)
- **Purpose**: Payment provider integration
- **Features**:
  - imoje integration
  - Card payment handling
  - BLIK support
  - Bank transfer options

**PaymentValidation** (`src/apps/tourist-tax/features/payment/PaymentValidation.tsx`)
- **Purpose**: Payment data validation
- **Features**:
  - Real-time validation
  - Security checks
  - Fraud detection
  - Compliance verification

#### 11.2 Reservation Management Features

**ReservationImporter** (`src/apps/tourist-tax/features/reservation/ReservationImporter.tsx`)
- **Purpose**: Booking platform data import
- **Features**:
  - Chrome extension integration
  - Data mapping
  - Validation rules
  - Conflict resolution

**ReservationProcessor** (`src/apps/tourist-tax/features/reservation/ReservationProcessor.tsx`)
- **Purpose**: Reservation data processing
- **Features**:
  - Tax calculation
  - Status management
  - Notification sending
  - Audit logging

**BulkReservationManager** (`src/apps/tourist-tax/features/reservation/BulkReservationManager.tsx`)
- **Purpose**: Bulk reservation operations
- **Features**:
  - Batch processing
  - Progress tracking
  - Error handling
  - Rollback capabilities

#### 11.3 Reporting & Analytics Features

**ReportGenerator** (`src/apps/tourist-tax/features/reporting/ReportGenerator.tsx`)
- **Purpose**: Automated report generation
- **Features**:
  - Template system
  - Data aggregation
  - Export formats
  - Scheduling options

**AnalyticsDashboard** (`src/apps/tourist-tax/features/analytics/AnalyticsDashboard.tsx`)
- **Purpose**: Business intelligence interface
- **Features**:
  - Real-time metrics
  - Trend analysis
  - Comparative reports
  - Drill-down capabilities

**ComplianceReporting** (`src/apps/tourist-tax/features/compliance/ComplianceReporting.tsx`)
- **Purpose**: Regulatory compliance reporting
- **Features**:
  - Government reporting formats
  - Audit trail generation
  - Data validation
  - Submission tracking

**CitySearchInput** (`src/apps/tourist-tax/components/atoms/CitySearchInput.tsx`)
- **Purpose**: Searchable city input with autocomplete
- **Features**:
  - Real-time search filtering
  - Keyboard navigation
  - Accessibility compliance
  - Custom styling
- **Implementation**:
  ```tsx
  <div className="city-search-container">
    <Form.Control
      type="text"
      placeholder={t('city.search.placeholder')}
      value={searchTerm}
      onChange={handleSearch}
      onKeyDown={handleKeyDown}
      aria-label={t('city.search.aria')}
      aria-expanded={isDropdownOpen}
      aria-haspopup="listbox"
    />
    {isDropdownOpen && (
      <div className="city-dropdown" role="listbox">
        {filteredCities.map((city, index) => (
          <div
            key={city.code}
            className={`city-option ${index === selectedIndex ? 'selected' : ''}`}
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => selectCity(city)}
          >
            <span className="city-name">{city.name}</span>
            <span className="city-rate">{formatCurrency(city.taxRate)}/night</span>
          </div>
        ))}
      </div>
    )}
  </div>
  ```

**NumericInput** (`src/apps/tourist-tax/components/atoms/NumericInput.tsx`)
- **Purpose**: Numeric input with increment/decrement controls
- **Features**:
  - Touch-friendly buttons
  - Keyboard input support
  - Min/max validation
  - Custom step values

**CurrencyInput** (`src/apps/tourist-tax/components/atoms/CurrencyInput.tsx`)
- **Purpose**: Currency-specific input formatting
- **Features**:
  - Real-time formatting
  - Locale-aware display
  - Validation rules
  - Error states

#### 5.2 Feedback Components

**LoadingSpinner** (`src/apps/tourist-tax/components/atoms/LoadingSpinner.tsx`)
- **Purpose**: Loading state indication
- **Variants**:
  - `small` - Inline loading
  - `medium` - Button loading
  - `large` - Page loading
  - `overlay` - Full-screen loading

**Toast** (`src/apps/tourist-tax/components/atoms/Toast.tsx`)
- **Purpose**: Temporary notification display
- **Types**:
  - `success` - Payment completed
  - `error` - Payment failed
  - `warning` - Validation issues
  - `info` - General information

**ErrorMessage** (`src/apps/tourist-tax/components/atoms/ErrorMessage.tsx`)
- **Purpose**: Error state display
- **Features**:
  - Icon integration
  - Retry functionality
  - Detailed error information
  - User-friendly messaging

#### 5.3 Navigation Elements

**Breadcrumb** (`src/apps/tourist-tax/components/atoms/Breadcrumb.tsx`)
- **Purpose**: Navigation path indication
- **Features**:
  - Clickable navigation
  - Current page highlighting
  - Mobile-responsive collapse
  - Accessibility support

**Pagination** (`src/apps/tourist-tax/components/atoms/Pagination.tsx`)
- **Purpose**: Data pagination controls
- **Features**:
  - Page number display
  - Previous/next navigation
  - Jump to page functionality
  - Mobile-optimized controls

**TabNavigation** (`src/apps/tourist-tax/components/atoms/TabNavigation.tsx`)
- **Purpose**: Tab-based content switching
- **Features**:
  - Keyboard navigation
  - Active state indication
  - Responsive design
  - Badge support for notifications

### Level 6: Layout & Container Components

#### 6.1 Grid System Components

**ResponsiveGrid** (`src/apps/tourist-tax/components/layout/ResponsiveGrid.tsx`)
- **Purpose**: Responsive grid layout system
- **Features**:
  - Bootstrap grid integration
  - Custom breakpoints
  - Auto-sizing columns
  - Gap control

**CardGrid** (`src/apps/tourist-tax/components/layout/CardGrid.tsx`)
- **Purpose**: Card-based grid layout
- **Features**:
  - Masonry layout support
  - Responsive card sizing
  - Hover effects
  - Loading states

**FlexContainer** (`src/apps/tourist-tax/components/layout/FlexContainer.tsx`)
- **Purpose**: Flexible layout container
- **Features**:
  - Direction control
  - Alignment options
  - Wrap behavior
  - Gap management

#### 6.2 Modal & Overlay Components

**ConfirmationModal** (`src/apps/tourist-tax/components/modals/ConfirmationModal.tsx`)
- **Purpose**: User action confirmation
- **Features**:
  - Customizable content
  - Action buttons
  - Escape key handling
  - Focus management

**PaymentModal** (`src/apps/tourist-tax/components/modals/PaymentModal.tsx`)
- **Purpose**: Payment processing overlay
- **Features**:
  - Secure payment form
  - Progress indication
  - Error handling
  - Mobile optimization

**ReservationDetailsModal** (`src/apps/tourist-tax/components/modals/ReservationDetailsModal.tsx`)
- **Purpose**: Detailed reservation information
- **Features**:
  - Comprehensive data display
  - Edit functionality
  - Print/export options
  - Status updates

#### 6.3 Sidebar & Panel Components

**FilterSidebar** (`src/apps/tourist-tax/components/panels/FilterSidebar.tsx`)
- **Purpose**: Advanced filtering interface
- **Features**:
  - Collapsible sections
  - Multiple filter types
  - Clear all functionality
  - Applied filters display

**QuickActionsPanel** (`src/apps/tourist-tax/components/panels/QuickActionsPanel.tsx`)
- **Purpose**: Frequently used actions
- **Features**:
  - Action shortcuts
  - Recent items
  - Favorites management
  - Customizable layout

**NotificationPanel** (`src/apps/tourist-tax/components/panels/NotificationPanel.tsx`)
- **Purpose**: System notifications display
- **Features**:
  - Real-time updates
  - Categorized notifications
  - Mark as read functionality
  - Action buttons

### Level 7: Data Visualization Components

#### 7.1 Chart Components

**RevenueChart** (`src/apps/tourist-tax/components/charts/RevenueChart.tsx`)
- **Purpose**: Revenue trend visualization
- **Features**:
  - Time-based data display
  - Interactive tooltips
  - Zoom functionality
  - Export capabilities
- **Chart Types**:
  - Line chart for trends
  - Bar chart for comparisons
  - Area chart for cumulative data

**CityDistributionChart** (`src/apps/tourist-tax/components/charts/CityDistributionChart.tsx`)
- **Purpose**: City-based data distribution
- **Features**:
  - Pie chart visualization
  - Interactive segments
  - Legend display
  - Percentage calculations

**OccupancyChart** (`src/apps/tourist-tax/components/charts/OccupancyChart.tsx`)
- **Purpose**: Accommodation occupancy rates
- **Features**:
  - Calendar heatmap
  - Seasonal patterns
  - Booking trends
  - Capacity indicators

#### 7.2 Table Components

**ReservationsTable** (`src/apps/tourist-tax/components/tables/ReservationsTable.tsx`)
- **Purpose**: Comprehensive reservations data display
- **Features**:
  - Sortable columns
  - Inline editing
  - Bulk selection
  - Export functionality
- **Columns**:
  - Guest information
  - Dates and duration
  - Payment status
  - Actions menu

**PaymentsTable** (`src/apps/tourist-tax/components/tables/PaymentsTable.tsx`)
- **Purpose**: Payment transactions display
- **Features**:
  - Transaction details
  - Status tracking
  - Refund capabilities
  - Receipt generation

**AuditTable** (`src/apps/tourist-tax/components/tables/AuditTable.tsx`)
- **Purpose**: System audit log display
- **Features**:
  - Chronological listing
  - User action tracking
  - Detailed change logs
  - Search functionality

#### 7.3 Summary Components

**DashboardSummary** (`src/apps/tourist-tax/components/summary/DashboardSummary.tsx`)
- **Purpose**: High-level metrics overview
- **Features**:
  - Key performance indicators
  - Trend indicators
  - Quick insights
  - Drill-down capabilities

**PaymentSummary** (`src/apps/tourist-tax/components/summary/PaymentSummary.tsx`)
- **Purpose**: Payment transaction summary
- **Features**:
  - Total amounts
  - Fee breakdown
  - Tax calculations
  - Receipt preview

**ReportSummary** (`src/apps/tourist-tax/components/summary/ReportSummary.tsx`)
- **Purpose**: Report data aggregation
- **Features**:
  - Period summaries
  - Comparative analysis
  - Export options
  - Scheduled reports

---

## 🔄 Event-Driven Architecture
```
App.tsx
├── ErrorBoundary
├── LanguageProvider
├── ServiceProvider
├── TouristTaxProvider
└── Router
    ├── Layout
    │   ├── Navbar (Mode-Specific)
    │   ├── Main Content Area
    │   └── FloatingActionButton
    └── Routes (Mode-Specific Pages)
```

### Level 1: Core Layout Components

#### 1.1 Layout Component (`src/shell/components/Layout.tsx`)
**Responsibility**: Main application shell with mode detection
**Features**:
- Automatic mode detection from route (`/landlord/*` vs `/tourist/*`)
- Mode-specific navbar rendering
- Responsive main content area
- Development mode indicator
- Floating action button integration

**Layout Structure:**
```tsx
<div className="d-flex flex-column vh-100">
  {/* Mode-specific Navbar */}
  {currentMode === 'tourist' ? <TouristNavbar /> : <LandlordNavbar />}

  {/* Main Content Area */}
  <main className="flex-grow-1 overflow-auto bg-light">
    {children}
  </main>

  {/* Floating Action Button */}
  <FloatingActionButton />

  {/* Development Indicator */}
  {import.meta.env.DEV && <DevelopmentBadge />}
</div>
```

#### 1.2 Navigation Components

**TouristNavbar** (`src/shell/components/navbar/TouristNavbar.tsx`)
- **Purpose**: Simplified navigation for payment flow
- **Features**:
  - City selector dropdown
  - Language switcher
  - Mode switch button
  - Progress indicator for multi-step forms
  - Mobile-optimized hamburger menu

**LandlordNavbar** (`src/shell/components/navbar/LandlordNavbar.tsx`)
- **Purpose**: Comprehensive navigation for business operations
- **Features**:
  - Dashboard navigation
  - Reservations management
  - Reports and analytics
  - Import/export tools
  - Settings and configuration
  - Real-time notification badges

### Level 2: Page-Level Components

#### 2.1 Tourist Mode Pages

**TouristPaymentForm** (`src/apps/tourist-tax/components/TouristPaymentForm.tsx`)
- **Purpose**: Main payment interface for tourists
- **Layout**: Multi-step wizard with progress tracking
- **Components**:
  ```tsx
  <Container>
    <ProgressBar currentStep={currentStep} totalSteps={4} />

    {currentStep === 'destination' && (
      <DestinationStep>
        <CitySelector />
        <DateRangePicker />
        <GuestCountSelector />
      </DestinationStep>
    )}

    {currentStep === 'details' && (
      <PersonalDetailsStep>
        <GuestInformationForm />
        <AccommodationDetailsForm />
      </PersonalDetailsStep>
    )}

    {currentStep === 'summary' && (
      <PaymentSummaryStep>
        <TaxCalculationDisplay />
        <PaymentMethodSelector />
        <GDPRConsentCheckboxes />
      </PaymentSummaryStep>
    )}

    {currentStep === 'payment' && (
      <PaymentProcessingStep>
        <ImojePaymentWidget />
        <PaymentStatusIndicator />
      </PaymentProcessingStep>
    )}
  </Container>
  ```

**MobilePaymentSummary** (`src/apps/tourist-tax/components/MobilePaymentSummary.tsx`)
- **Purpose**: Mobile-optimized payment summary
- **Features**:
  - Swipe-friendly interface
  - Large touch targets
  - Simplified information display
  - Quick payment actions

#### 2.2 Landlord Mode Pages

**LandlordDashboard** (`src/apps/tourist-tax/pages/LandlordDashboard.tsx`)
- **Purpose**: Main landlord control center
- **Layout**: Grid-based dashboard with widgets
- **Components**:
  ```tsx
  <Container fluid>
    <Row className="mb-4">
      <Col><DashboardHeader /></Col>
    </Row>

    <Row className="mb-4">
      <Col md={3}><StatisticsCard type="total-reservations" /></Col>
      <Col md={3}><StatisticsCard type="pending-payments" /></Col>
      <Col md={3}><StatisticsCard type="total-revenue" /></Col>
      <Col md={3}><StatisticsCard type="today-checkins" /></Col>
    </Row>

    <Row className="mb-4">
      <Col md={8}><RecentReservationsTable /></Col>
      <Col md={4}><QuickActionsPanel /></Col>
    </Row>

    <Row>
      <Col md={6}><RevenueChart /></Col>
      <Col md={6}><CityDistributionChart /></Col>
    </Row>
  </Container>
  ```

**LandlordReservations** (`src/apps/tourist-tax/pages/LandlordReservations.tsx`)
- **Purpose**: Comprehensive reservation management
- **Features**:
  - Advanced filtering and search
  - Bulk operations
  - Export functionality
  - Real-time status updates

**LandlordDynamicDashboard** (`src/apps/tourist-tax/pages/LandlordDynamicDashboard.tsx`)
- **Purpose**: Real-time dashboard with live data
- **Features**:
  - Auto-refresh capabilities
  - Real-time status indicators
  - Dynamic filtering
  - Live statistics updates

### Level 3: Feature Components

#### 3.1 Core Business Components

**CitySelector** (`src/apps/tourist-tax/components/CitySelector.tsx`)
- **Purpose**: City selection with tax rate display
- **Features**:
  - Dropdown with city search
  - Tax rate preview
  - City-specific information
  - Validation and error handling
- **Structure**:
  ```tsx
  <Form.Group>
    <Form.Label>{t('city.select')}</Form.Label>
    <Form.Select
      value={selectedCity}
      onChange={handleCityChange}
      isInvalid={!!errors.city}
    >
      <option value="">{t('city.placeholder')}</option>
      {cities.map(city => (
        <option key={city.code} value={city.code}>
          {city.name} - {formatCurrency(city.taxRate)}/night
        </option>
      ))}
    </Form.Select>
    <Form.Control.Feedback type="invalid">
      {errors.city}
    </Form.Control.Feedback>
  </Form.Group>
  ```

**DynamicReservationsList** (`src/apps/tourist-tax/components/DynamicReservationsList.tsx`)
- **Purpose**: Real-time reservations display with filtering
- **Features**:
  - Live data updates
  - Advanced filtering
  - Pagination
  - Export capabilities
  - Bulk actions

**PaymentReceipt** (`src/apps/tourist-tax/components/PaymentReceipt.tsx`)
- **Purpose**: Payment confirmation and receipt display
- **Features**:
  - PDF generation
  - QR code display
  - Email sending
  - Print functionality

#### 3.2 Form Components

**TaxCalculationDisplay** (`src/apps/tourist-tax/components/TaxCalculationDisplay.tsx`)
- **Purpose**: Tax breakdown visualization
- **Features**:
  - Itemized calculation
  - Visual breakdown charts
  - Currency formatting
  - Multi-language support
- **Structure**:
  ```tsx
  <Card className="tax-calculation-card">
    <Card.Header>
      <h5>{t('tax.calculation.title')}</h5>
    </Card.Header>
    <Card.Body>
      <Table borderless>
        <tbody>
          <tr>
            <td>{t('tax.nights')}</td>
            <td className="text-end">{numberOfNights}</td>
          </tr>
          <tr>
            <td>{t('tax.guests')}</td>
            <td className="text-end">{guestCount}</td>
          </tr>
          <tr>
            <td>{t('tax.rate')}</td>
            <td className="text-end">{formatCurrency(taxRate)}</td>
          </tr>
          <tr className="border-top">
            <td><strong>{t('tax.total')}</strong></td>
            <td className="text-end">
              <strong>{formatCurrency(totalAmount)}</strong>
            </td>
          </tr>
        </tbody>
      </Table>
    </Card.Body>
  </Card>
  ```

**GuestInformationForm** (`src/apps/tourist-tax/components/GuestInformationForm.tsx`)
- **Purpose**: Guest details collection
- **Features**:
  - Real-time validation
  - Auto-completion
  - GDPR compliance
  - Multi-language labels

**AccommodationDetailsForm** (`src/apps/tourist-tax/components/AccommodationDetailsForm.tsx`)
- **Purpose**: Accommodation information collection
- **Features**:
  - Accommodation type selection
  - Address validation
  - Integration with booking platforms
  - Auto-fill from Chrome extension data

### Level 4: UI Elements & Micro-Components

#### 4.1 Interactive Elements

**DateRangePicker** (`src/apps/tourist-tax/components/elements/DateRangePicker.tsx`)
- **Purpose**: Check-in/check-out date selection
- **Features**:
  - Calendar widget
  - Date validation
  - Minimum stay requirements
  - Seasonal rate display
- **Implementation**:
  ```tsx
  <Row>
    <Col md={6}>
      <Form.Group>
        <Form.Label>{t('dates.checkin')}</Form.Label>
        <Form.Control
          type="date"
          value={checkInDate}
          onChange={handleCheckInChange}
          min={today}
          max={maxDate}
          isInvalid={!!errors.checkIn}
        />
      </Form.Group>
    </Col>
    <Col md={6}>
      <Form.Group>
        <Form.Label>{t('dates.checkout')}</Form.Label>
        <Form.Control
          type="date"
          value={checkOutDate}
          onChange={handleCheckOutChange}
          min={minCheckOut}
          max={maxDate}
          isInvalid={!!errors.checkOut}
        />
      </Form.Group>
    </Col>
  </Row>
  ```

**GuestCountSelector** (`src/apps/tourist-tax/components/elements/GuestCountSelector.tsx`)
- **Purpose**: Number of guests selection
- **Features**:
  - Increment/decrement buttons
  - Input validation
  - Maximum guest limits
  - Visual feedback

**ProgressBar** (`src/apps/tourist-tax/components/elements/ProgressBar.tsx`)
- **Purpose**: Multi-step form progress indication
- **Features**:
  - Step visualization
  - Current step highlighting
  - Clickable navigation
  - Mobile-responsive design

#### 4.2 Display Components

**StatisticsCard** (`src/apps/tourist-tax/components/elements/StatisticsCard.tsx`)
- **Purpose**: Dashboard metric display
- **Features**:
  - Animated counters
  - Trend indicators
  - Color-coded status
  - Responsive sizing
- **Variants**:
  - `total-reservations`
  - `pending-payments`
  - `total-revenue`
  - `today-checkins`
  - `conversion-rate`

**StatusBadge** (`src/apps/tourist-tax/components/elements/StatusBadge.tsx`)
- **Purpose**: Status indication for reservations/payments
- **Features**:
  - Color-coded statuses
  - Icon integration
  - Tooltip information
  - Animation effects

**CurrencyDisplay** (`src/apps/tourist-tax/components/elements/CurrencyDisplay.tsx`)
- **Purpose**: Consistent currency formatting
- **Features**:
  - Multi-currency support
  - Locale-aware formatting
  - Size variants
  - Emphasis styling

#### 4.3 Interactive Widgets

**PaymentMethodSelector** (`src/apps/tourist-tax/components/elements/PaymentMethodSelector.tsx`)
- **Purpose**: Payment method selection interface
- **Features**:
  - Visual payment method cards
  - Fee information display
  - Security indicators
  - Mobile-optimized layout

**ImojePaymentWidget** (`src/apps/tourist-tax/components/elements/ImojePaymentWidget.tsx`)
- **Purpose**: Embedded imoje payment interface
- **Features**:
  - Secure iframe integration
  - Payment status tracking
  - Error handling
  - Mobile responsiveness

**QRCodeDisplay** (`src/apps/tourist-tax/components/elements/QRCodeDisplay.tsx`)
- **Purpose**: QR code generation and display
- **Features**:
  - Dynamic QR code generation
  - Download functionality
  - Print optimization
  - Mobile sharing

---

## 🔄 Event-Driven Architecture

### EventBus Implementation

**EventBus** (`src/platform/eventbus/EventBus.ts`)
- **Responsibility**: Application-wide event coordination
- **Pattern**: Synchronous event emission, async event handling
- **Usage**: Decoupled communication between components

```typescript
// Event emission (SYNC)
EventBus.emit(PLATFORM_EVENTS.CITY_SELECTED, { cityCode: 'krakow' });

// Event subscription (ASYNC handlers allowed)
EventBus.on(PLATFORM_EVENTS.CITY_SELECTED, async (data) => {
  await loadCitySpecificData(data.cityCode);
});
```

### Event Categories

1. **Platform Events** (`PLATFORM_EVENTS`)
   - `CITY_SELECTED` - City context change
   - `LANGUAGE_CHANGED` - Language preference update
   - `MODE_SWITCHED` - Tourist/Landlord mode change
   - `STORAGE_UPDATED` - Storage layer modifications

2. **Payment Events** (`PAYMENT_EVENTS`)
   - `PAYMENT_INITIATED` - Payment process started
   - `PAYMENT_COMPLETED` - Successful payment
   - `PAYMENT_FAILED` - Payment error occurred

3. **Reservation Events** (`RESERVATION_EVENTS`)
   - `RESERVATION_CREATED` - New reservation added
   - `RESERVATION_UPDATED` - Reservation modified
   - `RESERVATION_IMPORTED` - Chrome extension import

---

## 🎨 UI/UX Architecture

### Bootstrap 5 Integration

**Responsive Design Principles:**
- Mobile-first approach for tourist interface
- Desktop-optimized for landlord dashboard
- Consistent spacing using Bootstrap utilities
- Custom CSS variables for theme customization

**Component Styling Strategy:**
```scss
// Custom variables
:root {
  --tourist-tax-primary: #0d6efd;
  --tourist-tax-success: #198754;
  --tourist-tax-warning: #ffc107;
  --tourist-tax-danger: #dc3545;
}

// Bootstrap customization
.tourist-payment-form {
  @extend .card;
  @extend .shadow-sm;
  border-radius: var(--bs-border-radius-lg);
}
```

### Mode-Specific Navigation

**Tourist Mode Navigation:**
- Simplified interface focused on payment flow
- Progress indicators for multi-step forms
- Mobile-optimized touch targets
- Clear call-to-action buttons

**Landlord Mode Navigation:**
- Comprehensive dashboard with data tables
- Advanced filtering and search capabilities
- Bulk operations for reservation management
- Real-time status indicators

---

## 🔐 Security Architecture

### Data Protection Layers

1. **Client-Side Security**
   - Input validation and sanitization
   - XSS prevention through React's built-in protection
   - CSRF protection via SameSite cookies
   - Content Security Policy implementation

2. **API Security**
   - Request/response validation using DTOs
   - Rate limiting per endpoint
   - Authentication via Azure AD integration
   - Audit logging for all operations

3. **Storage Security**
   - Encrypted sensitive data in localStorage
   - Secure Azure Storage access keys
   - GDPR-compliant data retention
   - Regular security audits

### Chrome Extension Security

**Content Script Isolation:**
```javascript
// Secure message passing
chrome.runtime.sendMessage({
  type: 'EXTRACT_RESERVATION',
  data: sanitizeReservationData(rawData)
});

// Input validation
function sanitizeReservationData(data) {
  return {
    guestName: DOMPurify.sanitize(data.guestName),
    checkIn: validateDate(data.checkIn),
    checkOut: validateDate(data.checkOut)
  };
}
```

---

## 📱 Mobile Optimization

### Progressive Web App Features

**Service Worker Implementation:**
- Offline capability for payment forms
- Background sync for failed payments
- Push notifications for payment status
- Caching strategy for static assets

**Mobile-Specific Optimizations:**
- Touch-friendly interface elements
- Optimized form layouts for mobile keyboards
- Swipe gestures for navigation
- Reduced data usage through smart caching

---

## 🧪 Testing Strategy

### Frontend Testing

**Unit Tests** (Vitest)
```typescript
// Component testing
describe('CitySelector', () => {
  it('should switch city context on selection', async () => {
    const { getByRole } = render(<CitySelector />);
    const krakowOption = getByRole('option', { name: 'Kraków' });

    fireEvent.click(krakowOption);

    expect(mockSwitchCity).toHaveBeenCalledWith('KRK');
  });
});

// Hook testing
describe('useApiData', () => {
  it('should cache API responses', async () => {
    const { result } = renderHook(() => useApiData(mockFetchFn, 'test-key'));

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
      expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
    });
  });
});
```

**Integration Tests** (Playwright)
```typescript
// E2E testing
test('complete payment flow', async ({ page }) => {
  await page.goto('/');
  await page.selectOption('[data-testid="city-selector"]', 'KRK');
  await page.fill('[data-testid="guest-count"]', '2');
  await page.click('[data-testid="calculate-tax"]');

  await expect(page.locator('[data-testid="tax-amount"]')).toContainText('5.00 PLN');
});
```

### Backend Testing

**Unit Tests** (Jest)
```typescript
describe('ReservationService', () => {
  it('should create reservation with audit log', async () => {
    const dto = createMockReservationDto();
    const result = await service.create(dto);

    expect(result.id).toBeDefined();
    expect(mockTableClient.createEntity).toHaveBeenCalled();
    expect(mockBlobClient.upload).toHaveBeenCalledWith(
      expect.stringContaining('reservation_created')
    );
  });
});
```

### Chrome Extension Testing

**Content Script Testing:**
```javascript
// Mock DOM environment
describe('Content Script', () => {
  beforeEach(() => {
    document.body.innerHTML = mockBookingPageHTML;
  });

  it('should extract reservation data correctly', () => {
    const data = extractReservationData();

    expect(data.guestName).toBe('John Doe');
    expect(data.checkIn).toBe('2024-08-15');
    expect(data.guestCount).toBe(2);
  });
});
```

---

## 🚀 Deployment Strategy

### GitHub Pages Deployment

**Build Process:**
```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

### Azure Function Deployment

**Infrastructure as Code:**
```bicep
// main.bicep
resource functionApp 'Microsoft.Web/sites@2022-03-01' = {
  name: 'tourist-tax-api'
  location: resourceGroup().location
  kind: 'functionapp,linux'
  properties: {
    serverFarmId: hostingPlan.id
    siteConfig: {
      linuxFxVersion: 'NODE|18'
      appSettings: [
        {
          name: 'AZURE_STORAGE_CONNECTION_STRING'
          value: storageAccount.connectionString
        }
      ]
    }
  }
}
```

### Chrome Extension Distribution

**Store Submission Process:**
1. Code review and security audit
2. Privacy policy compliance check
3. Manifest validation
4. Automated testing suite
5. Chrome Web Store submission

---

## 📊 Monitoring & Analytics

### Application Performance Monitoring

**Frontend Metrics:**
- Page load times and Core Web Vitals
- API response times and error rates
- User interaction tracking
- Cache hit/miss ratios

**Backend Metrics:**
- Azure Function execution times
- Storage operation latencies
- Error rates and exception tracking
- Cost optimization metrics

### Business Intelligence

**Payment Analytics:**
- Conversion rates by city
- Average payment amounts
- Seasonal trends analysis
- User behavior patterns

**Operational Metrics:**
- Chrome extension usage statistics
- API endpoint performance
- Storage utilization trends
- Error pattern analysis

This comprehensive architecture ensures maintainable, performant, and scalable tourist tax payment system with proper separation of concerns and optimal user experience.
