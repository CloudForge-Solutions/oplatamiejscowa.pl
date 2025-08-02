IMPORTANT: I have pasted current console logs to README.current-logs.md, analyse and review line by line, be precise, comprehensive, detailed, systematic, semantic, critical and picky

NOTE: we have the Chrome extension integration and Azure Function backend to work on, ui/ux part looks ready, but Chrome extension content scripts, background scripts, and Azure Function NestJS integration may have issues after recent migrations to react and directory structure refactoring

TASK: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: changing js to ts file require stopping `make dev` process and starting it again to cleanup vite cache

IMPORTANT: we are eventbus driven

IMPORTANT: any currently modified file that is not yet ts/tsx in src do migrate to typescript along current task changes, also when importing do not use extensions of files

IMPORTANT: instead of dummy patching find if its not an architectural issue, be precise, comprehensive, detailed, systematic, semantic, critical and picky

IMPORTANT: to start the development vite server run `make dev` and to install packages look at Makefile, update install target and run `make install`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

IMPORTANT: we will only ever use our app in desktop machines, mobile apps development is forbidden

IMPORTANT: making any changes or directly using code from .deprecated1 and .deprecated2 is forbidden, as those deprecated code was left only for reference

IMPORTANT: using dumb patches like `cleanupMalformedKeys` is forbidden as root cause of malformed keys should be resolved, so use `assertMalformedKeys` with error throwing

IMPORTANT: each time logs/code are provided, analyse and review line by line, find warnings, errors, hidden issues, semantic/logic inconsistencies, be precise, critical, comprehensive, detailed and picky

IMPORTANT: never assume that something is completed or production ready before you will see all related logs from user tested application

IMPORTANT: Storage keys, and events should be not hardcoded magic strings, but references to variables in constants as in README.mini-constants.md and always do barrel import via `src/constants/index.js`, also we have fixed rules per global and per context-entity-aware storage/indexeddb keys ```typescript
// ✅ ALLOWED - Barrel import only
import { JPK_STATUS, ENTITY_TYPES, UI_STATES } from '@/constants';
// ❌ FORBIDDEN - Direct domain imports (for now)
import { JPK_STATUS } from '@/apps/jpk/constants';
import { ENTITY_TYPES } from '@/core/constants/EntityConstants';
```

IMPORTANT: global context of the app should include a currently active entity that has logically separate localStorage and indexeddb data, and switching entities should happen without page reload (sub-millisecond performance), data should reload automatically in the page without freezing, with best practice entity events and smart caching

IMPORTANT: if there are any changes in our architecture, make sure to reflect it in related @README.mini*.md files without prepending/appending it or adding new docs files

IMPORTANT: route and language and context should be in two way sync via use-query-params lib, if an entity is active in context it should also be as query parameter in the route, if a key based jpk/record is previewed it should also be in route parameter, but hard requirement is not to fight with bootstrap, react, and router to avoid any kind of hellish bugs

IMPORTANT: local storage should follow entity context aware storage structure architecture as in `src/platform/storage/index.js` with local storage in nested structured ```
* Entity LocalStorage Manager
 * Manages nested localStorage structure for entity data
 *
 * ARCHITECTURE PRINCIPLE: Nested entity storage
 * Structure:
 {
   'global:entities:v1.0.0': [...],           // Global keys (flat)
   'global:currentEntity:v1.0.0': entityId,  // Global keys (flat)
   'entity:01985077': {                       // Entity-nested data
     'jpk-config': {...},
     'bank-accounts': [...],
     'records-cache': {...}
   }
 }
``` and indexeddb databases in isolated per entity dbs and global dbs for some cases

IMPORTANT: ARCHITECTURE: LAYERED CONTEXT APPROACH with ```
Layer 1: Service Context (Static) - Services never change during app lifecycle
  - Provides access to all application services via ServicesManager
  - Static layer that remains constant throughout app lifecycle
  - Foundation for other context layers
  - Located: src/shell/context/ServiceContext.tsx
  - Hook: useServices(), useService(name), useCommonServices()

Layer 2: Language Context (Semi-Static) - Changes infrequently
  - Manages application language state with i18next integration
  - Provides formatting utilities for Polish accounting
  - Two-way URL synchronization with use-query-params
  - Document attributes and Bootstrap classes updated automatically
  - Located: src/shell/context/LanguageContext.tsx
  - Hook: useLanguage()

Layer 3: Entity Context (Dynamic) - Changes frequently with optimized performance
  - Manages current entity state with automatic data reloading
  - Handles entity switching without page reload
  - Synchronizes entity with URL parameters
  - Loads entity-specific data automatically (JPK config, bank accounts, records cache)
  - Direct synchronous localStorage access via EntityLocalStorageManager
  - Located: src/shell/context/EntityContext.tsx
  - Hook: useEntity()

Architecture Principles:
1. Clean Separation of Concerns - Each layer has distinct responsibilities
2. Automatic Data Reloading - Entity data reloads automatically on context changes
3. Type Safety & Intellisense - Full TypeScript coverage with strict typing
4. Event-Driven Updates - EventBus coordination between contexts and services
5. Performance Optimization - Optimized entity switching with smart caching
6. Two-Way URL Sync - All contexts synchronized with URL parameters via use-query-params
```

IMPORTANT: � Entity Switching Flow (Optimized Performance) ```
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
9. All components re-render with new entity data (optimized performance)
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
1. User switches entity → Entity context updates via smart caching → Components reload entity data (optimized performance)
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

IMPORTANT: forbidden is any fallback to legacy and any form of data migration as we are in development phase before production, also absurd timeouts instead of proper fixes are forbidden, also absurdly long timeouts are forbidden when we are having all data inside the browser localStorage or indexeddb

IMPORTANT: localStorage access must use repository pattern via `entityLocalStorageManager` singleton from `src/platform/storage/index.js` with direct synchronous access - never wrap localStorage in async services or adapters. Use SINGLE STORAGE + IN-MEMORY CACHING approach via EntityManager for optimal performance

IMPORTANT: entity switching must be optimized with synchronous localStorage access and EventBus coordination. Avoid async/await in UI event handlers for entity switching - use fire-and-forget pattern with error handling

IMPORTANT: large data types (audit logs, jpk history, jpk files, record files) should be stored in IndexedDB with only metadata in localStorage. ReactStorageAdapter should implement smart caching with TTL to eliminate excessive data access patterns

IMPORTANT: implement the fixes and robust solutions, but before and after making any changes, verify and analyse comprehensively each change, be critical and picky, comprehensive and precise, if we are not adding any antipatterns like god objects or improperly mixing our architecture, fighting with bootstrap, so beware any antipatterns, keep code DRY and agnostic, stick to Single Responsibility Principle, when fixing issues or adding a feature review and analyse line by line related code and patterns

IMPORTANT: to start the development vite server run `make dev`, never change production src code to accommodate tests special requirements, do other way around and make sure tests can work with vite, also run the tests via Makefile targets

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
- Entity switching operations (optimized performance requirement)
- JPK configuration and settings
- Bank accounts and basic entity data
- User preferences and UI state
- Navigation state and route parameters
- Small configuration objects and metadata

**ASYNCHRONOUS DATA (IndexedDB with metadata in localStorage):**
- Large file content (PDF files, XML files, uploaded documents)
- Audit logs and processing history
- JPK generated files and validation results
- AI analysis results and embeddings
- OCR text content and processing results
- Record processing cache and detailed analysis
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


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc

IMPORTANT: all modals should be resizable and reusing src/platform/components/common






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


IMPORTANT: using console.log is forbidden, make sure to use logger with standard verbosity level methods without custom methods like platform/shell etc

IMPORTANT: all modals should be resizable and reusing src/platform/components/common

IMPORTANT: stating claims like "PRODUCTION-READY TECHNICAL SPECIFICATION" or similar is forbidden as we are in development phase

### Performance Optimization

1. **Fast Entity Switching (Optimized Performance)**
   - Optimized localStorage access with error handling
   - In-memory caching layer for frequently accessed data
   - Batched React state updates to prevent multiple re-renders
   - Smart cache invalidation with TTL-based expiration

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

### Fast Local Data Flow (Target <100ms)
```
User Action → Context Update → localStorage (1-10ms) → In-Memory Cache → Component Re-render
```

### Network Data Flow (Variable latency)
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
**Responsibility**: Main application shell with context-aware rendering
**Features**:
- Context-driven mode detection via TouristTaxContext
- Mode-specific navbar rendering with proper error boundaries
- Responsive main content area with accessibility landmarks
- Development mode indicator for debugging
- Conditional action elements based on user role

**Layout Structure:**
```tsx
<div className="d-flex flex-column vh-100" role="application">
  {/* Mode-specific Navbar with error boundary */}
  <ErrorBoundary fallback={<NavbarFallback />}>
    {currentMode === 'tourist' ? <TouristNavbar /> : <LandlordNavbar />}
  </ErrorBoundary>

  {/* Main Content Area with proper landmarks */}
  <main className="flex-grow-1 overflow-auto bg-light" role="main" aria-label="Main content">
    <ErrorBoundary fallback={<ContentErrorFallback />}>
      {children}
    </ErrorBoundary>
  </main>

  {/* Conditional Development Indicator */}
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

**TouristPaymentPage** (`src/apps/tourist-tax/pages/TouristPaymentPage.tsx`)
- **Purpose**: Main payment page orchestrating the payment flow
- **Layout**: Multi-step wizard with proper state management
- **Architecture**: Composition of focused components with single responsibilities
- **Components**:
  ```tsx
<Container className="payment-page" role="main" aria-label="Tourist tax payment">
  <PaymentProgressTracker currentStep={currentStep} totalSteps={4} />

  <ErrorBoundary fallback={<PaymentErrorFallback />}>
    <PaymentStepRouter
      currentStep={currentStep}
      onStepChange={handleStepChange}
      onComplete={handlePaymentComplete}
    />
  </ErrorBoundary>

  <PaymentFooter
    canProceed={isCurrentStepValid}
    onBack={handleBack}
    onNext={handleNext}
  />
</Container>

// Separate step components for better maintainability:
// - DestinationSelectionStep.tsx
// - PersonalDetailsStep.tsx
// - PaymentSummaryStep.tsx
// - PaymentProcessingStep.tsx
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

### Level 8: Chrome Extension UI Implementation

#### 8.1 Extension Popup Interface

**ExtensionPopupManager** (`chrome-extension/src/popup/popup.ts`)
- **Purpose**: Main extension popup logic and DOM manipulation
- **Technology**: Vanilla TypeScript with DOM APIs (no React)
- **Features**:
  - Booking data extraction status display
  - Quick actions menu with event handlers
  - Settings access and persistence
  - Connection status indicator with real-time updates
- **Implementation**:
  ```typescript
  class ExtensionPopupManager {
    private statusIndicator: HTMLElement;
    private actionButtons: NodeListOf<HTMLButtonElement>;

    constructor() {
      this.initializeUI();
      this.bindEventHandlers();
      this.updateStatus();
    }

    private initializeUI(): void {
      this.statusIndicator = document.getElementById('status-indicator')!;
      this.actionButtons = document.querySelectorAll('.action-button');
    }
  }
  ```

**BookingDetectionModule** (`chrome-extension/src/popup/modules/BookingDetection.ts`)
- **Purpose**: Booking.com page detection and data extraction status
- **Technology**: Chrome APIs with TypeScript
- **Features**:
  - Active tab detection for booking.com
  - Data extraction status monitoring
  - Manual extraction trigger with validation
  - Error reporting with user-friendly messages

#### 8.2 Content Script UI Injection

**BookingPageUIInjector** (`chrome-extension/src/content/ui/BookingPageUIInjector.ts`)
- **Purpose**: Inject tourist tax UI elements into booking.com pages
- **Technology**: Vanilla DOM manipulation with Shadow DOM isolation
- **Features**:
  - Tourist tax information overlay with CSS isolation
  - Quick calculation preview with real-time updates
  - Payment link generation with secure token handling
  - Seamless integration respecting booking.com's layout

**ReservationElementHighlighter** (`chrome-extension/src/content/ui/ReservationHighlighter.ts`)
- **Purpose**: Visual enhancement of reservation elements
- **Technology**: CSS injection with MutationObserver
- **Features**:
  - Visual indicators for processed reservations
  - Status badges with color coding
  - Quick action buttons with proper event delegation
  - Non-intrusive design with fallback removal

**TaxCalculationTooltipManager** (`chrome-extension/src/content/ui/TooltipManager.ts`)
- **Purpose**: Hover tooltip system for tax calculations
- **Technology**: Custom tooltip implementation with positioning logic
- **Features**:
  - Real-time tax calculation with debounced API calls
  - City-specific rates with caching
  - Breakdown display with proper formatting
  - Payment link access with security validation

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

### Level 11: Business Logic Services (Non-UI)

#### 11.1 Payment Processing Services

**PaymentFlowService** (`src/apps/tourist-tax/services/PaymentFlowService.ts`)
- **Purpose**: Payment flow orchestration and state management
- **Pattern**: Service class with async operations
- **Features**:
  - Multi-step coordination with state persistence
  - Error recovery with retry mechanisms
  - Progress tracking with event emission
  - Integration with imoje payment gateway

**PaymentValidationService** (`src/apps/tourist-tax/services/PaymentValidationService.ts`)
- **Purpose**: Payment data validation and security checks
- **Pattern**: Pure functions with validation rules
- **Features**:
  - Real-time validation with debounced checks
  - Security validation for payment data
  - Fraud detection with risk scoring
  - GDPR compliance verification

#### 11.2 Data Management Services

**ReservationDataService** (`src/apps/tourist-tax/services/ReservationDataService.ts`)
- **Purpose**: Reservation data processing and management
- **Pattern**: Service class with caching layer
- **Features**:
  - Chrome extension data import with validation
  - Data mapping and transformation
  - Conflict resolution with user prompts
  - Batch processing with progress tracking

**ReportingService** (`src/apps/tourist-tax/services/ReportingService.ts`)
- **Purpose**: Report generation and analytics
- **Pattern**: Service class with template system
- **Features**:
  - Automated report generation with templates
  - Data aggregation with efficient queries
  - Multiple export formats (PDF, Excel, CSV)
  - Government compliance reporting formats

---

## 🔄 Event-Driven Architecture

### EventBus Implementation

**EventBus** (`src/platform/eventbus/EventBus.ts`)
- **Responsibility**: Application-wide event coordination
- **Pattern**: Consistent async event handling to prevent race conditions
- **Usage**: Decoupled communication between components

```typescript
// Event emission (returns Promise for consistency)
await EventBus.emit(PLATFORM_EVENTS.CITY_SELECTED, { cityCode: 'krakow' });

// Event subscription (async handlers for consistency)
EventBus.on(PLATFORM_EVENTS.CITY_SELECTED, async (data) => {
  await loadCitySpecificData(data.cityCode);
});

// Synchronous handlers only for simple state updates
EventBus.on(PLATFORM_EVENTS.CITY_SELECTED, (data) => {
  updateUIState(data.cityCode); // No async operations
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

// Input validation with proper imports
import DOMPurify from 'dompurify';

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

---

## 🎯 Implementation Priorities & Risk Mitigation

### Phase 1: Foundation (Weeks 1-4)
**Priority**: Core architecture and basic functionality
- Set up React 18.2 + TypeScript 5.0 + Vite build pipeline
- Implement LocalStorageManager and basic context providers
- Create Chrome extension build pipeline with TypeScript compilation
- Establish Azure Function NestJS backend with basic CRUD operations
- Implement basic city selection and tax calculation

### Phase 2: Core Features (Weeks 5-8)
**Priority**: Essential business functionality
- Complete payment flow with imoje integration
- Implement Chrome extension content script for booking.com
- Add Azure Storage integration (Table + Blob)
- Create landlord dashboard with real-time data
- Implement GDPR compliance features

### Phase 3: Enhancement (Weeks 9-12)
**Priority**: User experience and optimization
- Add PWA features and offline capabilities
- Implement comprehensive error handling and recovery
- Add analytics and reporting features
- Performance optimization and caching improvements
- Comprehensive testing suite

### Critical Risk Factors

1. **Chrome Extension Complexity**
   - **Risk**: Booking.com DOM changes breaking data extraction
   - **Mitigation**: Robust selectors, fallback mechanisms, automated testing

2. **Payment Integration Security**
   - **Risk**: PCI compliance and security vulnerabilities
   - **Mitigation**: Use imoje's secure iframe, implement proper validation

3. **Performance Requirements**
   - **Risk**: City switching performance degradation
   - **Mitigation**: Implement proper caching, avoid over-engineering

4. **GDPR Compliance**
   - **Risk**: Data protection violations
   - **Mitigation**: Implement proper consent management, data retention policies

### Architecture Quality Gates

**Before Implementation:**
- [ ] Validate React 18.2 compatibility with GitHub Pages
- [ ] Confirm Chrome Extension Manifest V3 requirements
- [ ] Test Azure Function cold start performance
- [ ] Verify imoje integration requirements

**During Development:**
- [ ] Maintain <100ms city switching performance
- [ ] Ensure proper error boundaries and fallbacks
- [ ] Implement comprehensive logging (no console.log)
- [ ] Follow single responsibility principle for all components

**Before Deployment:**
- [ ] Complete security audit for Chrome extension
- [ ] Verify GDPR compliance implementation
- [ ] Performance testing under load
- [ ] Cross-browser compatibility testing

This architecture provides a **realistic, implementable foundation** for the tourist tax payment system while avoiding common antipatterns and maintaining focus on core business requirements.
