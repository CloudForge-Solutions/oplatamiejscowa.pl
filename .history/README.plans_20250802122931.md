# Tourist Tax Payment System - Implementation Plan
## Blob-Specific SAS Token Architecture with Data Retention

**🔒 Security Architecture:**
- ✅ Non-expiring SAS tokens (as per strict requirements)
- ✅ Frontend blob storage access (minimal backend auth)
- ✅ Secure logging implemented (no sensitive data exposure)
- ✅ Blob-specific access control with relocation-based revocation

## 🎯 Project Overview

**Oplata Miejscowa Online** - A secure, mobile-first tourist tax payment system using blob-specific, non-expiring SAS tokens for direct Azure Storage access with comprehensive rate limiting, API polling for status updates, and compliant data retention.

### Core Business Flow
1. **Tourist** opens payment URL: `oplatamiejscowa.pl/p/{uuid}`
2. **Backend** validates UUID, checks rate limits, generates blob-specific SAS token (time-limited)
3. **Frontend** accesses single private blob directly with SAS token (cached in localStorage)
4. **Payment** processed via imoje, status updates stored in backend
5. **Frontend** polls payment status via API calls (mobile-optimized intervals, no WebSocket)
6. **Data Retention** automatic archiving after payment completion (1-5 years)
7. **Access Revocation** via blob relocation to secure archive location

### Technology Stack
- **Frontend**: React 18.2.0 + TypeScript 5.1.6 + React Bootstrap 2.9.x + Vite 5.0.x (Mobile-First)
- **Backend**: Azure Functions v4 + TypeScript (with @azure/functions adapter)
- **Storage**: Azure Storage Emulator (Tables + Blobs)
- **Status Updates**: API polling only (mobile-optimized intervals, no WebSocket complexity)
- **Payments**: imoje Payment Gateway integration (Apple Pay, Google Pay support)
- **Build**: Makefile for local operations
- **Security**: Time-limited SAS tokens + rate limiting + data archiving + localStorage caching

---

## 🏗️ Architecture Levels

### Level 0: System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Tourist Mobile  │───▶│ Static React    │───▶│ Azure Functions │
│ (Payment URL)   │    │ (GitHub Pages)  │    │ (SAS + API)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Direct Blob     │    │ Azure Storage   │
                       │ Access (SAS)    │    │ (Blobs Only)    │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ API Polling     │◀───│ Payment Status  │
                       │ (Mobile-Opt)    │    │ Storage         │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Mobile-First UI │    │ imoje Payment   │
                       │ Updates         │    │ (Apple/Google)  │
                       └─────────────────┘    └─────────────────┘
```

**Core Principles:**
- **Mobile-First**: Touch-friendly UI with 44px minimum touch targets, mobile-first CSS
- **Security-First**: Time-limited SAS tokens + rate limiting + localStorage caching
- **Performance**: Direct blob access with smart caching and mobile-optimized API polling
- **Cost-Effective**: Minimal backend calls with localStorage persistence
- **EventBus-Driven**: Coordinated updates via EventBus pattern (no WebSocket complexity)
- **Simple Storage**: localStorage only (no IndexedDB) with flat structure
- **Constants-Driven**: All strings/keys via barrel exports from src/constants/index.ts
- **Single Responsibility**: Each component/service has one clear purpose
- **Fail-Fast Validation**: Strict validation with immediate error throwing
- **Deployment-Separated**: GitHub Pages (frontend) + Azure Functions (backend)

### Level 1: Application Layers

#### 1.1 Frontend Layer (Simple Payment App - Mobile-First)
**Location**: `src/app/` (simplified structure for single payment purpose)
**Responsibility**: Static React application with mobile-first design

**Key Applications** (`src/app/apps/` - single payment app):
- **Tourist Tax App** (`src/app/apps/tourist-tax/`) - Payment flow (mobile-first, 44px touch targets)

**Platform Services** (`src/app/platform/` - essential services only):
- **Storage Layer** - localStorage-only with flat structure (no IndexedDB)
- **API Layer** - Payment status polling only (no WebSocket)
- **Validation Layer** - Strict validation with fail-fast error throwing

**Application Shell** (`src/app/shell/` - 3-layer context architecture):
- **ServiceContext** - Static services (StorageService, ApiService)
- **LanguageContext** - i18next integration with URL sync
- **TouristTaxContext** - Payment state with localStorage caching

#### 1.2 Backend Layer (Granular Function-Based Services)
**Location**: `src/api/`
**Responsibility**: Feature-specific Azure Functions with clear service boundaries

**Function Categories:**
- **Reservation Functions** (`src/api/functions/reservation/`) - UUID validation, SAS generation
- **Payment Functions** (`src/api/functions/payment/`) - imoje integration, status API endpoints

**Service Categories:**
- **Reservation Services** (`src/api/services/reservation/`) - Core reservation logic, validation
- **Payment Services** (`src/api/services/payment/`) - Payment processing, status tracking
- **Security Services** (`src/api/services/security/`) - Rate limiting, authentication

#### 1.3 Storage Layer (Simple localStorage + Blob Access)
**Location**: Browser localStorage + Azure Blob (SAS token access)
**Responsibility**: Simple data persistence with mobile-optimized caching

**Key Components:**
- **localStorage** - All app data with flat structure (preferences, session, cache)
- **Blob Storage** - Reservation data via time-limited SAS tokens
- **Smart Caching** - TTL-based caching with localStorage persistence
- **EventBus Coordination** - Storage updates via event-driven pattern

#### 1.4 Mock Services Layer
**Location**: `mocks/`
**Responsibility**: Development and testing simulation

**Key Components:**
- **imoje Mock Server** - Payment gateway simulation
- **API Status Mock** - Payment status polling simulation
- **Data Lifecycle Simulator** - Archive and retention testing
- **Test Data Generator** - Sample reservations and payments

---

## 📁 Directory Structure

### Project Root Structure
```
oplata-miejscowa/
├── Makefile                    # Local development operations
├── docker-compose.yml          # Local services orchestration
├── package.json               # Root workspace configuration
├── README.md                  # Project documentation
├── .env.local                 # Local environment variables
├── .gitignore                 # Git ignore patterns
└── tsconfig.json              # Root TypeScript configuration
```

### Granular Feature-Based Structure (mVat Pattern Applied)
```
src/
├── app/                       # Static React App (mobile-first payment page)
│   ├── apps/                      # Feature-based applications (simplified)
│   │   └── payment/               # Tourist payment flow (mobile-first)
│   │       ├── PaymentPage.tsx           # Main payment page
│   │       ├── components/
│   │       │   ├── ReservationDisplay.tsx    # Reservation details (mobile-optimized)
│   │       │   ├── PaymentForm.tsx           # imoje payment form (Apple/Google Pay)
│   │       │   ├── PaymentStatus.tsx         # Polling-based status
│   │       │   ├── PaymentReceipt.tsx        # Receipt display
│   │       │   └── MobileNavigation.tsx      # Mobile-friendly navigation
│   │       ├── hooks/
│   │       │   ├── usePaymentFlow.ts         # Payment state management
│   │       │   ├── useReservationData.ts     # Reservation loading
│   │       │   └── usePaymentPolling.ts      # Status polling (mobile-optimized)
│   │       ├── services/
│   │       │   ├── PaymentService.ts         # imoje integration
│   │       │   ├── ReservationService.ts     # Reservation data
│   │       │   └── PollingService.ts         # Payment status polling
│   │       ├── constants/
│   │       │   ├── PaymentConstants.ts       # Payment-related constants
│   │       │   └── MobileConstants.ts        # Mobile-specific constants
│   │       └── types/
│   │           ├── PaymentTypes.ts           # Payment interfaces
│   │           └── ReservationTypes.ts       # Reservation interfaces

│   ├── platform/                  # Core platform services (simplified)
│   │   ├── storage/               # Storage abstraction layer
│   │   │   ├── BlobStorageService.ts     # Azure Blob operations
│   │   │   ├── LocalStorageManager.ts    # Browser storage (mobile-optimized)
│   │   │   └── CacheService.ts           # Caching layer
│   │   ├── api/                   # API communication
│   │   │   ├── ApiService.ts             # Backend API calls
│   │   │   ├── PollingService.ts         # Status polling (mobile-optimized)
│   │   │   └── PaymentApiService.ts      # imoje integration
│   │   ├── validation/            # Validation services
│   │   │   ├── ReservationValidator.ts   # Reservation validation
│   │   │   ├── PaymentValidator.ts       # Payment validation
│   │   │   └── MobileFormValidator.ts    # Mobile form validation
│   │   └── utils/                 # Shared utilities
│   │       ├── formatters.ts             # Data formatting
│   │       ├── mobileUtils.ts            # Mobile-specific utilities
│   │       └── constants.ts              # Global constants
├── api/                       # Azure Functions Backend
│   ├── package.json                      # Backend dependencies
│   ├── host.json                         # Azure Functions configuration
│   ├── local.settings.json               # Local development settings
│   └── src/
│       ├── functions/
│       │   ├── reservation/              # Reservation endpoints
│       │   │   ├── get-reservation.ts        # Get reservation data
│       │   │   ├── generate-sas.ts           # Generate SAS token
│       │   │   └── validate-uuid.ts          # UUID validation
│       │   └── payment/               # Payment endpoints
│       │       ├── initiate-payment.ts       # Start payment process
│       │       ├── payment-webhook.ts        # imoje webhooks
│       │       └── payment-status.ts         # Status queries (polling endpoint)
│       ├── services/
│       │   ├── reservation/           # Reservation services
│       │   │   ├── ReservationService.ts     # Core reservation logic
│       │   │   ├── ValidationService.ts      # Reservation validation
│       │   │   └── SASTokenService.ts        # SAS token generation
│       │   ├── payment/               # Payment services
│       │   │   ├── PaymentService.ts         # imoje integration
│       │   │   ├── StatusService.ts          # Payment status tracking
│       │   │   └── WebhookService.ts         # Webhook processing
│       │   └── security/              # Security services
│       │       ├── RateLimitService.ts       # Rate limiting
│       │       └── AuthService.ts            # Authentication
│       ├── middleware/
│       │   ├── auth.ts                   # Authentication middleware
│       │   ├── rateLimit.ts              # Rate limiting middleware
│       │   └── cors.ts                   # CORS configuration
│       └── utils/
│           ├── logger.ts                 # Secure server-side logging
│           ├── crypto.ts                 # Cryptographic utilities
│           └── validators.ts             # Server-side validation

│   └── shell/                     # Application shell (mobile-first)
│       ├── App.tsx                       # Root application component
│       ├── components/
│       │   ├── Layout.tsx                    # Main layout component (mobile-optimized)
│       │   ├── ErrorBoundary.tsx             # Error boundary wrapper
│       │   ├── LoadingSpinner.tsx            # Loading state component
│       │   └── MobileNavigation.tsx          # Mobile-friendly navigation
│       ├── context/
│       │   ├── PaymentContext.tsx            # Payment state context
│       │   └── LanguageContext.tsx           # Internationalization context
│       ├── services/
│       │   └── ConfigService.ts              # Configuration management
│       └── main.tsx                      # Application entry point
```

├── assets/                    # Static assets (following mVat pattern)
│   ├── icons/                        # Application icons
│   │   ├── payment/                      # Payment-related icons
│   │   ├── status/                       # Status indicator icons
│   │   └── cities/                       # City-specific icons
│   ├── images/                       # Static images
│   │   ├── logos/                        # City logos and branding
│   │   └── backgrounds/                  # Background images
│   ├── styles/                       # Global styles
│   │   ├── base/
│   │   │   ├── _reset.scss                   # CSS reset
│   │   │   ├── _typography.scss              # Typography definitions
│   │   │   └── _variables.scss               # SCSS variables
│   │   ├── components/
│   │   │   ├── _buttons.scss                 # Button styles
│   │   │   ├── _forms.scss                   # Form styles
│   │   │   ├── _modals.scss                  # Modal styles
│   │   │   └── _payment.scss                 # Payment-specific styles
│   │   ├── layout/
│   │   │   ├── _navbar.scss                  # Navigation styles
│   │   │   └── _main-content.scss            # Main content layout
│   │   ├── pages/
│   │   │   ├── _payment.scss                 # Payment page styles
│   │   │   └── _admin.scss                   # Admin page styles
│   │   ├── themes/
│   │   │   ├── _light.scss                   # Light theme
│   │   │   └── _dark.scss                    # Dark theme
│   │   └── utilities/
│   │       ├── _colors.scss                  # Color utilities
│   │       └── _spacing.scss                 # Spacing utilities
│   └── locales/                      # Internationalization
│       ├── en/
│       │   ├── common.json                   # Common translations
│       │   ├── payment.json                  # Payment translations
│       │   └── errors.json                   # Error messages
│       └── pl/
│           ├── common.json                   # Polish translations
│           ├── payment.json                  # Payment translations
│           └── errors.json                   # Error messages
├── constants/                 # Centralized constants hub
│   └── index.ts                      # Single barrel export hub (all constants)
└── __tests__/                 # Testing structure (simplified for payment focus)
    ├── app/                          # Frontend tests
    │   ├── unit/                         # Unit tests by feature
    │   │   ├── payment/                      # Payment app tests
    │   │   │   ├── components/               # Component tests (mobile-focused)
    │   │   │   ├── hooks/                    # Hook tests
    │   │   │   └── services/                 # Service tests
    │   │   ├── platform/                     # Platform service tests
    │   │   │   ├── storage/                      # Storage tests
    │   │   │   ├── api/                          # API polling tests
    │   │   │   └── validation/                   # Validation tests
    │   │   └── shell/                        # Shell component tests
    │   ├── integration/                  # Frontend integration tests
    │   │   └── payment-flow/                 # Payment flow tests (mobile scenarios)
    │   └── e2e/                         # End-to-end tests
    │       └── mobile-payment-scenarios/     # Mobile payment flow scenarios
    ├── api/                          # Backend function tests
    │   ├── unit/
    │   │   ├── functions/                    # Function tests
    │   │   └── services/                     # Service tests
    │   └── integration/                  # API integration tests
    └── fixtures/                    # Test data
        ├── reservations/                 # Sample reservation data
        ├── payments/                     # Sample payment data
        └── responses/                    # Mock API responses
```

### Mock Services Structure (`mocks/`)
```
mocks/
├── package.json                      # Mock services dependencies
├── docker-compose.yml                # Mock services orchestration
├── imoje-mock/
│   ├── server.ts                     # imoje payment gateway mock
│   ├── routes/
│   │   ├── payment.routes.ts         # Payment endpoint simulation
│   │   ├── status.routes.ts          # Payment status endpoints (polling)
│   │   └── webhook.routes.ts         # Webhook simulation
│   ├── data/
│   │   ├── payments.json             # Sample payment data
│   │   └── responses.json            # Mock API responses
│   └── utils/
│       ├── payment-simulator.ts     # Automated payment status changes
│       └── webhook-sender.ts        # Webhook delivery simulation
├── data-generator/
│   ├── generate-reservations.ts     # Sample reservation generator
│   ├── generate-payments.ts         # Sample payment generator
│   └── templates/
│       ├── reservation.template.ts  # Reservation data template
│       └── payment.template.ts      # Payment data template
└── azure-storage-setup/
    ├── setup-containers.ts          # Blob container initialization
    ├── setup-tables.ts              # Table storage initialization
    ├── setup-queues.ts              # Queue storage initialization
    ├── setup-archive-structure.ts   # Archive container setup
    └── seed-data.ts                 # Development data seeding

### Configuration Files
```
config/
├── azure-storage-emulator.json      # Storage emulator configuration
├── functions-emulator.json          # Functions emulator configuration
├── nginx.conf                       # Local reverse proxy configuration
└── ssl/
    ├── localhost.crt                # Local SSL certificate
    └── localhost.key                # Local SSL private key
```

---

## 🔧 Level 2: Core Components Implementation

### 2.1 Frontend Core Components

#### PaymentPage Component
**Responsibility**: Payment page presentation only
**Single Responsibility**: Render payment UI with mobile-first design

```typescript
// src/app/apps/tourist-tax/components/PaymentPage.tsx
import { TOURIST_TAX_CONSTANTS, UI_CONSTANTS, LOGGER } from '@/constants';

interface PaymentPageProps {
  reservationId: string;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ reservationId }) => {
  // Single responsibility: Presentation only
  const { reservation, loading, error } = useTouristTax();
  const { t } = useLanguage();

  // Fail-fast validation
  if (!reservationId) {
    LOGGER.error('PaymentPage: Missing reservationId');
    throw new Error('Invalid payment page access');
  }

  // Mobile-first loading states
  if (loading) return <MobileLoadingSpinner />;
  if (error) return <MobileErrorDisplay error={error} />;
  if (!reservation) return <MobileNotFoundDisplay />;

  return (
    <MobileLayout className={UI_CONSTANTS.MOBILE_CONTAINER_CLASS}>
      <ReservationDisplay
        reservation={reservation}
        touchTargetSize={UI_CONSTANTS.MIN_TOUCH_TARGET}
      />
      <PaymentForm
        reservation={reservation}
        mobileOptimized={true}
        touchTargetSize={UI_CONSTANTS.MIN_TOUCH_TARGET}
      />
      <PaymentStatusDisplay
        pollingEnabled={true}
        mobileOptimized={true}
      />
    </MobileLayout>
  );
};
```

#### BlobStorageService Implementation
**Responsibility**: Direct single blob Azure Storage access with blob-specific SAS tokens
**Single Responsibility**: Handle single blob operations only

```typescript
// src/services/BlobStorageService.ts
interface BlobStorageConfig {
  storageAccount: string;
  blobPath: string;        // Specific blob path: reservations/{uuid}.json
  sasToken: string;        // Blob-specific SAS token
}

export class BlobStorageService {
  private blobClient: BlobClient;

  constructor(private config: BlobStorageConfig) {
    // Single responsibility: Initialize blob-specific client
    this.initializeBlobClient();
  }

  private initializeBlobClient(): void {
    // SECURE: Direct blob access only, no container enumeration
    const blobUrl = `https://${this.config.storageAccount}.blob.core.windows.net/${this.config.blobPath}?${this.config.sasToken}`;
    this.blobClient = new BlobClient(blobUrl);
  }

  async getReservation(): Promise<Reservation> {
    // Single responsibility: Fetch this specific reservation only
    try {
      const downloadResponse = await this.blobClient.download();
      const content = await this.streamToString(downloadResponse.readableStreamBody!);
      return JSON.parse(content) as Reservation;
    } catch (error) {
      if (error.statusCode === 404) {
        throw new ReservationNotFoundError('Reservation has been archived or does not exist');
      }
      throw new StorageError(`Failed to fetch reservation`, error);
    }
  }

  async checkBlobExists(): Promise<boolean> {
    // Single responsibility: Check if blob exists (for access validation)
    try {
      await this.blobClient.getProperties();
      return true;
    } catch (error) {
      if (error.statusCode === 404) {
        return false;
      }
      throw error;
    }
  }

  private async streamToString(readableStream: NodeJS.ReadableStream): Promise<string> {
    // Utility method with single responsibility
    return new Promise((resolve, reject) => {
      const chunks: string[] = [];
      readableStream.on('data', (data) => chunks.push(data.toString()));
      readableStream.on('end', () => resolve(chunks.join('')));
      readableStream.on('error', reject);
    });
  }
}

#### BlobSASTokenService Implementation
**Responsibility**: Generate blob-specific SAS tokens with security controls
**Single Responsibility**: Create secure, scoped access tokens for individual blobs

```typescript
// functions/src/services/BlobSASTokenService.ts
interface BlobSASConfig {
  storageAccount: string;
  containerName: string;
  accountKey: string;
}

@Injectable()
export class BlobSASTokenService {
  private blobServiceClient: BlobServiceClient;

  constructor(private config: BlobSASConfig) {
    const credential = new StorageSharedKeyCredential(
      this.config.storageAccount,
      this.config.accountKey
    );
    this.blobServiceClient = new BlobServiceClient(
      `https://${this.config.storageAccount}.blob.core.windows.net`,
      credential
    );
  }

  async generateBlobSpecificSAS(reservationId: string): Promise<BlobSASResponse> {
    // Single responsibility: Generate SAS for specific blob only
    const blobName = `reservations/${reservationId}.json`;

    // SECURE: Blob-specific permissions only
    const sasOptions: BlobGenerateSasUrlOptions = {
      containerName: this.config.containerName,
      blobName: blobName,
      permissions: BlobSASPermissions.parse('r'), // Read only
      startsOn: new Date(),
      expiresOn: undefined, // Non-expiring as per requirements
      contentType: 'application/json',
      cacheControl: 'public, max-age=3600'
    };

    // Generate blob-specific SAS token
    const sasToken = generateBlobSASQueryParameters(
      sasOptions,
      new StorageSharedKeyCredential(this.config.storageAccount, this.config.accountKey)
    ).toString();

    // Log token generation for audit
    await this.auditTokenGeneration(reservationId, sasToken);

    return {
      blobPath: blobName,
      sasToken,
      fullUrl: `https://${this.config.storageAccount}.blob.core.windows.net/${blobName}?${sasToken}`,
      scope: 'single-blob-read-only',
      expiresAt: null // Non-expiring token
    };
  }

  async revokeBlobAccess(reservationId: string): Promise<void> {
    // Single responsibility: Revoke access by moving blob
    const sourceBlobName = `reservations/${reservationId}.json`;
    const archiveBlobName = `archive/${new Date().getFullYear()}/${reservationId}.json`;

    try {
      // Copy to archive location
      const sourceBlob = this.blobServiceClient
        .getContainerClient(this.config.containerName)
        .getBlobClient(sourceBlobName);

      const archiveBlob = this.blobServiceClient
        .getContainerClient('archive')
        .getBlobClient(archiveBlobName);

      // Copy blob to archive
      await archiveBlob.syncCopyFromURL(sourceBlob.url);

      // Delete original (invalidates all SAS tokens)
      await sourceBlob.delete();

      // Log revocation for audit
      await this.auditAccessRevocation(reservationId, 'blob-moved-to-archive');

    } catch (error) {
      throw new AccessRevocationError(`Failed to revoke access for ${reservationId}`, error);
    }
  }

  private async auditTokenGeneration(reservationId: string, sasToken: string): Promise<void> {
    // Single responsibility: Audit logging
    const auditEntry = {
      partitionKey: 'token-generation',
      rowKey: `${reservationId}-${Date.now()}`,
      reservationId,
      tokenHash: this.hashToken(sasToken), // Store hash, not actual token
      generatedAt: new Date(),
      action: 'SAS_TOKEN_GENERATED'
    };

    // Store in audit table
    await this.auditTableClient.createEntity(auditEntry);
  }

  private hashToken(token: string): string {
    // Single responsibility: Create audit-safe token hash
    return crypto.createHash('sha256').update(token).digest('hex').substring(0, 16);
  }
}

---

## 🔧 Level 3: Implementation Details & Makefile

### 3.1 Makefile for Local Development

```makefile
# Makefile for Tourist Tax Payment System
.PHONY: help install start stop clean test build deploy

# Default target
help:
	@echo "Tourist Tax Payment System - Local Development"
	@echo ""
	@echo "Available commands:"
	@echo "  make install     - Install all dependencies"
	@echo "  make start       - Start all local services"
	@echo "  make stop        - Stop all local services"
	@echo "  make test        - Run all tests"
	@echo "  make clean       - Clean all build artifacts"
	@echo "  make build       - Build all components"
	@echo "  make seed        - Seed development data"
	@echo "  make logs        - Show service logs"

# Installation
install:
	@echo "Installing dependencies..."
	npm install
	cd functions && npm install
	cd mocks && npm install
	@echo "Setting up Azure Storage Emulator..."
	azurite --silent --location ./data/azurite &
	sleep 5
	@echo "Creating storage containers..."
	node mocks/azure-storage-setup/setup-containers.js
	node mocks/azure-storage-setup/setup-tables.js
	node mocks/azure-storage-setup/setup-queues.js
	node mocks/azure-storage-setup/setup-archive-structure.js

# Start all services
start:
	@echo "Starting Tourist Tax Payment System..."
	docker-compose up -d
	@echo "Starting Azure Storage Emulator..."
	azurite --silent --location ./data/azurite &
	@echo "Starting Azure Functions Emulator..."
	cd functions && func start --port 7071 &
	@echo "Starting imoje Mock Server..."
	cd mocks/imoje-mock && npm start &
	@echo "Starting Frontend Development Server..."
	npm run dev &
	@echo ""
	@echo "Services started:"
	@echo "  Frontend (Mobile):   http://localhost:5173"
	@echo "  Azure Functions:     http://localhost:7071"
	@echo "  imoje Mock:          http://localhost:3001"
	@echo "  Storage UI:          http://localhost:10000"

# Stop all services
stop:
	@echo "Stopping all services..."
	docker-compose down
	pkill -f "azurite" || true
	pkill -f "func start" || true
	pkill -f "npm start" || true
	pkill -f "npm run dev" || true

# Seed development data
seed:
	@echo "Seeding development data..."
	node mocks/data-generator/generate-reservations.js
	node mocks/data-generator/generate-payments.js
	node mocks/azure-storage-setup/seed-data.js
	@echo "Development data seeded successfully"

# Run tests
test:
	@echo "Running frontend tests..."
	npm test
	@echo "Running backend tests..."
	cd functions && npm test
	@echo "Running integration tests..."
	npm run test:integration

# Build all components
build:
	@echo "Building frontend..."
	npm run build
	@echo "Building Azure Functions..."
	cd functions && npm run build
	@echo "Building mock services..."
	cd mocks && npm run build

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf dist/
	rm -rf functions/dist/
	rm -rf mocks/dist/
	rm -rf data/azurite/
	rm -rf node_modules/.cache/

# Show service logs
logs:
	@echo "Service logs:"
	docker-compose logs -f
```

### 3.2 Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  azurite:
    image: mcr.microsoft.com/azure-storage/azurite:latest
    container_name: azurite
    ports:
      - "10000:10000"  # Blob service
      - "10001:10001"  # Queue service
      - "10002:10002"  # Table service
    volumes:
      - ./data/azurite:/data
    command: azurite --blobHost 0.0.0.0 --queueHost 0.0.0.0 --tableHost 0.0.0.0 --location /data

  imoje-mock:
    build: ./mocks/imoje-mock
    container_name: imoje-mock
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=development
      - WEBHOOK_URL=http://localhost:7071/api/payment-webhook
    volumes:
      - ./mocks/imoje-mock/data:/app/data

  nginx:
    image: nginx:alpine
    container_name: nginx-proxy
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./config/nginx.conf:/etc/nginx/nginx.conf
      - ./config/ssl:/etc/nginx/ssl
    depends_on:
      - azurite
      - imoje-mock
```

### 3.3 Environment Configuration

```bash
# .env.local
# Azure Storage Emulator
AZURE_STORAGE_CONNECTION_STRING="DefaultEndpointsProtocol=http;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;BlobEndpoint=http://127.0.0.1:10000/devstoreaccount1;QueueEndpoint=http://127.0.0.1:10001/devstoreaccount1;TableEndpoint=http://127.0.0.1:10002/devstoreaccount1;"

# Azure Functions
FUNCTIONS_WORKER_RUNTIME=node
AzureWebJobsStorage=UseDevelopmentStorage=true

# Application Settings
STORAGE_ACCOUNT_NAME=devstoreaccount1
STORAGE_ACCOUNT_KEY=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==
CONTAINER_NAME=reservations
ARCHIVE_CONTAINER_NAME=archive

# imoje Mock Settings
IMOJE_MOCK_URL=http://localhost:3001
IMOJE_MERCHANT_ID=test-merchant
IMOJE_SERVICE_KEY=test-service-key

# Rate Limiting
RATE_LIMIT_PER_IP_PER_MINUTE=60
RATE_LIMIT_PER_RESERVATION_PER_MINUTE=5
SUSPICIOUS_ACTIVITY_THRESHOLD=3
BLOCK_DURATION_MINUTES=60

# Data Retention
DATA_RETENTION_YEARS=5
ARCHIVE_AFTER_PAYMENT_DAYS=30
CLEANUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM

### 3.4 Azure Storage CORS Configuration

**Critical for Direct Blob Access from Browser**

```json
{
  "CorsRules": [
    {
      "AllowedOrigins": [
        "https://oplatamiejscowa.pl",
        "https://*.oplatamiejscowa.pl",
        "http://localhost:5173",
        "http://localhost:3000"
      ],
      "AllowedMethods": [
        "GET",
        "HEAD",
        "OPTIONS"
      ],
      "AllowedHeaders": [
        "Range",
        "x-ms-*",
        "Content-Type",
        "Authorization"
      ],
      "ExposedHeaders": [
        "Content-Length",
        "Content-Range",
        "x-ms-*",
        "ETag",
        "Last-Modified"
      ],
      "MaxAgeInSeconds": 3600
    }
  ]
}
```

**Azure CLI Configuration:**
```bash
# Configure CORS for blob service
az storage cors add \
  --account-name devstoreaccount1 \
  --services b \
  --methods GET HEAD OPTIONS \
  --origins "https://oplatamiejscowa.pl" "http://localhost:5173" \
  --allowed-headers "Range,x-ms-*,Content-Type" \
  --exposed-headers "Content-Length,Content-Range,x-ms-*,ETag" \
  --max-age 3600

# Verify CORS configuration
az storage cors list --account-name devstoreaccount1 --services b
```

**Local Development CORS (Azurite):**
```bash
# Azurite automatically allows localhost origins
# For custom domains, use --cors parameter
azurite --cors "*" --location ./data/azurite
```

### 3.4 UI/UX Features & Functionality

#### Payment Page UI Components

**Main Payment Interface**
```typescript
// src/components/payment/PaymentPage.tsx
export const PaymentPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const { reservation, loading, error } = useReservation(reservationId!);
  const { paymentStatus, processPayment } = usePayment(reservationId!);
  const { updates, isConnected } = useRealTimeUpdates(reservationId!);

  return (
    <Container className="payment-container">
      {/* Header with branding and progress */}
      <PaymentHeader
        title="Oplata Miejscowa"
        subtitle="Tourist Tax Payment"
        progress={paymentStatus.step}
        totalSteps={4}
      />

      {/* Main content area */}
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {loading && <LoadingCard message="Loading reservation details..." />}
          {error && <ErrorCard error={error} onRetry={() => window.location.reload()} />}

          {reservation && (
            <>
              {/* Reservation Details Card */}
              <ReservationDetailsCard
                reservation={reservation}
                className="mb-4"
              />

              {/* Payment Form Card */}
              <PaymentFormCard
                reservation={reservation}
                paymentStatus={paymentStatus}
                onPayment={processPayment}
                className="mb-4"
              />

              {/* Real-time Status Card */}
              <PaymentStatusCard
                status={paymentStatus}
                isRealTimeConnected={isConnected}
                lastUpdate={updates.lastUpdate}
              />
            </>
          )}
        </Col>
      </Row>

      {/* Footer with support info */}
      <PaymentFooter
        supportEmail="support@oplatamiejscowa.pl"
        supportPhone="+48 123 456 789"
      />
    </Container>
  );
};
```

**Reservation Details Display**
```typescript
// src/components/payment/ReservationDetailsCard.tsx
interface ReservationDetailsCardProps {
  reservation: Reservation;
  className?: string;
}

export const ReservationDetailsCard: React.FC<ReservationDetailsCardProps> = ({
  reservation,
  className
}) => {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useFormatters();

  return (
    <Card className={`reservation-details ${className}`}>
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <FaMapMarkerAlt className="me-2" />
          {t('reservation.details.title')}
        </h5>
      </Card.Header>

      <Card.Body>
        <Row>
          <Col md={6}>
            <div className="detail-group mb-3">
              <label className="detail-label">{t('reservation.city')}</label>
              <div className="detail-value">{reservation.city.name}</div>
            </div>

            <div className="detail-group mb-3">
              <label className="detail-label">{t('reservation.accommodation')}</label>
              <div className="detail-value">{reservation.accommodation.name}</div>
              <small className="text-muted">{reservation.accommodation.address}</small>
            </div>
          </Col>

          <Col md={6}>
            <div className="detail-group mb-3">
              <label className="detail-label">{t('reservation.dates')}</label>
              <div className="detail-value">
                {formatDate(reservation.checkIn)} - {formatDate(reservation.checkOut)}
              </div>
              <small className="text-muted">
                {reservation.numberOfNights} {t('reservation.nights')}
              </small>
            </div>

            <div className="detail-group mb-3">
              <label className="detail-label">{t('reservation.guests')}</label>
              <div className="detail-value">
                {reservation.guests.length} {t('reservation.guests')}
              </div>
            </div>
          </Col>
        </Row>

        {/* Tax Calculation Summary */}
        <div className="tax-summary mt-4 p-3 bg-light rounded">
          <Row className="align-items-center">
            <Col>
              <div className="tax-breakdown">
                <div className="d-flex justify-content-between">
                  <span>{t('tax.rate')}</span>
                  <span>{formatCurrency(reservation.city.taxRate)}/{t('tax.per_night')}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>{t('tax.calculation')}</span>
                  <span>
                    {reservation.guests.length} × {reservation.numberOfNights} × {formatCurrency(reservation.city.taxRate)}
                  </span>
                </div>
              </div>
            </Col>
          </Row>
          <hr className="my-2" />
          <Row>
            <Col>
              <div className="d-flex justify-content-between align-items-center">
                <strong className="h5 mb-0">{t('tax.total')}</strong>
                <strong className="h4 mb-0 text-primary">
                  {formatCurrency(reservation.totalAmount)}
                </strong>
              </div>
            </Col>
          </Row>
        </div>
      </Card.Body>
    </Card>
  );
};
```

**Real-time Payment Status**
```typescript
// src/components/payment/PaymentStatusCard.tsx
interface PaymentStatusCardProps {
  status: PaymentStatus;
  isRealTimeConnected: boolean;
  lastUpdate?: Date;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({
  status,
  isRealTimeConnected,
  lastUpdate
}) => {
  const { t } = useTranslation();
  const [nextRefresh, setNextRefresh] = useState<number>(60);

  useEffect(() => {
    if (!isRealTimeConnected) {
      const interval = setInterval(() => {
        setNextRefresh(prev => prev > 0 ? prev - 1 : 60);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isRealTimeConnected]);

  const getStatusIcon = (status: PaymentStatus['state']) => {
    switch (status) {
      case 'pending': return <FaClock className="text-warning" />;
      case 'processing': return <FaSpinner className="text-info spin" />;
      case 'completed': return <FaCheckCircle className="text-success" />;
      case 'failed': return <FaTimesCircle className="text-danger" />;
      default: return <FaQuestionCircle className="text-muted" />;
    }
  };

  const getStatusVariant = (status: PaymentStatus['state']) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'completed': return 'success';
      case 'failed': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Card className="payment-status-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h6 className="mb-0">{t('payment.status.title')}</h6>
        <div className="d-flex align-items-center">
          {isRealTimeConnected ? (
            <Badge bg="success" className="me-2">
              <FaWifi className="me-1" />
              {t('status.realtime')}
            </Badge>
          ) : (
            <Badge bg="secondary" className="me-2">
              <FaClock className="me-1" />
              {t('status.next_check')}: {nextRefresh}s
            </Badge>
          )}
        </div>
      </Card.Header>

      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <div className="status-icon me-3">
            {getStatusIcon(status.state)}
          </div>
          <div>
            <Badge bg={getStatusVariant(status.state)} className="mb-1">
              {t(`payment.status.${status.state}`)}
            </Badge>
            <div className="text-muted small">
              {status.message}
            </div>
          </div>
        </div>

        {status.state === 'processing' && (
          <ProgressBar
            animated
            variant="info"
            now={75}
            label={t('payment.processing')}
            className="mb-3"
          />
        )}

        {status.state === 'completed' && status.receiptUrl && (
          <div className="receipt-actions">
            <Button
              variant="outline-primary"
              size="sm"
              href={status.receiptUrl}
              target="_blank"
              className="me-2"
            >
              <FaDownload className="me-1" />
              {t('receipt.download')}
            </Button>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => window.print()}
            >
              <FaPrint className="me-1" />
              {t('receipt.print')}
            </Button>
          </div>
        )}

        {lastUpdate && (
          <div className="text-muted small mt-2">
            {t('status.last_update')}: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

### 3.5 Mock imoje Server Implementation

```typescript
// mocks/imoje-mock/server.ts
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail: string;
  returnUrl: string;
  failureUrl: string;
}

interface PaymentResponse {
  paymentId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  paymentUrl: string;
  amount: number;
  currency: string;
}

class ImojePaymentMock {
  private payments = new Map<string, PaymentResponse>();
  private app = express();

  constructor() {
    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  private setupRoutes(): void {
    // Create payment
    this.app.post('/api/payment', (req, res) => {
      const paymentRequest: PaymentRequest = req.body;
      const paymentId = uuidv4();

      const payment: PaymentResponse = {
        paymentId,
        status: 'pending',
        paymentUrl: `http://localhost:3001/payment/${paymentId}`,
        amount: paymentRequest.amount,
        currency: paymentRequest.currency
      };

      this.payments.set(paymentId, payment);

      // Simulate payment processing
      this.simulatePaymentFlow(paymentId, paymentRequest);

      res.json(payment);
    });

    // Get payment status
    this.app.get('/api/payment/:paymentId', (req, res) => {
      const { paymentId } = req.params;
      const payment = this.payments.get(paymentId);

      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      res.json(payment);
    });

    // Payment page (for user interaction)
    this.app.get('/payment/:paymentId', (req, res) => {
      const { paymentId } = req.params;
      const payment = this.payments.get(paymentId);

      if (!payment) {
        return res.status(404).send('Payment not found');
      }

      res.send(this.generatePaymentPage(payment));
    });

    // Process payment (simulate user action)
    this.app.post('/payment/:paymentId/process', (req, res) => {
      const { paymentId } = req.params;
      const { action } = req.body; // 'approve' or 'reject'

      const payment = this.payments.get(paymentId);
      if (!payment) {
        return res.status(404).json({ error: 'Payment not found' });
      }

      payment.status = action === 'approve' ? 'completed' : 'failed';
      this.payments.set(paymentId, payment);

      // Send webhook notification
      this.sendWebhook(paymentId, payment);

      res.json({ success: true, status: payment.status });
    });
  }

  private simulatePaymentFlow(paymentId: string, request: PaymentRequest): void {
    // Simulate realistic payment timing
    setTimeout(() => {
      const payment = this.payments.get(paymentId);
      if (payment && payment.status === 'pending') {
        payment.status = 'processing';
        this.payments.set(paymentId, payment);
        this.sendWebhook(paymentId, payment);
      }
    }, 2000); // 2 seconds to processing

    // Auto-complete after 30 seconds if not manually processed
    setTimeout(() => {
      const payment = this.payments.get(paymentId);
      if (payment && payment.status === 'processing') {
        payment.status = Math.random() > 0.1 ? 'completed' : 'failed'; // 90% success rate
        this.payments.set(paymentId, payment);
        this.sendWebhook(paymentId, payment);
      }
    }, 30000); // 30 seconds auto-completion
  }

  private async sendWebhook(paymentId: string, payment: PaymentResponse): Promise<void> {
    const webhookUrl = process.env.WEBHOOK_URL || 'http://localhost:7071/api/payment-webhook';

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Imoje-Signature': this.generateSignature(paymentId)
        },
        body: JSON.stringify({
          paymentId,
          status: payment.status,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: new Date().toISOString()
        })
      });

      console.log(`Webhook sent for payment ${paymentId}: ${response.status}`);
    } catch (error) {
      console.error(`Failed to send webhook for payment ${paymentId}:`, error);
    }
  }

  private generateSignature(paymentId: string): string {
    // Simple signature for development
    return Buffer.from(`${paymentId}:${process.env.IMOJE_SERVICE_KEY || 'test-key'}`).toString('base64');
  }

  private generatePaymentPage(payment: PaymentResponse): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>imoje Payment - ${payment.paymentId}</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
      </head>
      <body class="bg-light">
        <div class="container mt-5">
          <div class="row justify-content-center">
            <div class="col-md-6">
              <div class="card">
                <div class="card-header bg-primary text-white">
                  <h5 class="mb-0">imoje Payment Gateway</h5>
                </div>
                <div class="card-body">
                  <h6>Payment Details</h6>
                  <p><strong>Amount:</strong> ${payment.amount} ${payment.currency}</p>
                  <p><strong>Status:</strong> <span class="badge bg-warning">${payment.status}</span></p>

                  <div class="d-grid gap-2">
                    <button class="btn btn-success" onclick="processPayment('approve')">
                      Approve Payment
                    </button>
                    <button class="btn btn-danger" onclick="processPayment('reject')">
                      Reject Payment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <script>
          async function processPayment(action) {
            try {
              const response = await fetch('/payment/${payment.paymentId}/process', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
              });

              if (response.ok) {
                alert('Payment ' + action + 'd successfully!');
                window.close();
              }
            } catch (error) {
              alert('Error processing payment: ' + error.message);
            }
          }
        </script>
      </body>
      </html>
    `;
  }

  start(port: number = 3001): void {
    this.app.listen(port, () => {
      console.log(`imoje Mock Server running on port ${port}`);
      console.log(`Payment gateway: http://localhost:${port}`);
    });
  }
}

// Start the mock server
const mockServer = new ImojePaymentMock();
mockServer.start();
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js 18+
- Azure CLI
- Docker Desktop
- Git

### Setup Commands
```bash
# Clone repository
git clone <repository-url>
cd oplata-miejscowa

# Install dependencies and setup local environment
make install

# Start all services
make start

# Seed development data
make seed

# Open application
open http://localhost:5173/p/550e8400-e29b-41d4-a716-446655440000
```

### Development Workflow
1. **Frontend Development**: `npm run dev` - Hot reload React app
2. **Backend Development**: `cd functions && func start` - Azure Functions emulator
3. **Mock Services**: `cd mocks && npm start` - imoje payment simulation
4. **Storage Management**: Azure Storage Explorer or web UI at `http://localhost:10000`

### Testing Payment Flow
1. Open payment URL: `http://localhost:5173/p/{uuid}`
2. View reservation details loaded from blob storage
3. Click "Pay Now" to initiate imoje payment
4. Complete payment in mock gateway
5. Observe real-time status updates via WebSocket connection

This implementation provides a complete, working solution with blob-specific SAS tokens, comprehensive security, and full local development capabilities using only emulators.
```
```

#### Event Grid Webhook Implementation
**Responsibility**: Handle Azure Event Grid webhooks for queue events
**Single Responsibility**: Process queue events and trigger WebSocket updates

```typescript
// src/api/functions/eventgrid-webhook.ts
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';

interface EventGridEvent {
  id: string;
  eventType: string;
  subject: string;
  eventTime: string;
  data: {
    queueName: string;
    messageId: string;
    insertionTime: string;
    expirationTime: string;
    popReceipt: string;
    timeNextVisible: string;
    dequeueCount: number;
    messageText: string;
  };
}

export async function eventGridWebhook(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log('Event Grid webhook triggered');

  try {
    const events: EventGridEvent[] = await request.json() as EventGridEvent[];

    for (const event of events) {
      // Validate event type
      if (event.eventType === 'Microsoft.Storage.QueueMessageAdded') {
        await processQueueEvent(event, context);
      }
    }

    return { status: 200, body: 'Events processed successfully' };
  } catch (error) {
    context.log.error('Error processing Event Grid webhook:', error);
    return { status: 500, body: 'Error processing events' };
  }
}

async function processQueueEvent(event: EventGridEvent, context: InvocationContext): Promise<void> {
  try {
    // Extract payment update from queue message
    const messageData = JSON.parse(event.data.messageText);
    const { reservationId, status, paymentId } = messageData;

    context.log(`Processing payment update for reservation ${reservationId}: ${status}`);

    // Trigger WebSocket update to connected clients
    await triggerWebSocketUpdate(reservationId, {
      type: 'payment_status_update',
      reservationId,
      paymentId,
      status,
      timestamp: event.eventTime
    });

  } catch (error) {
    context.log.error('Error processing queue event:', error);
  }
}

async function triggerWebSocketUpdate(reservationId: string, updateData: any): Promise<void> {
  // Implementation to send WebSocket message to connected clients
  // This would use Azure SignalR Service or custom WebSocket management
  const webSocketService = new WebSocketService();
  await webSocketService.sendToReservation(reservationId, updateData);
}

app.http('eventgrid-webhook', {
  methods: ['POST'],
  authLevel: 'function',
  handler: eventGridWebhook
});
```

#### WebSocket Service Implementation
**Responsibility**: Manage WebSocket connections and message distribution
**Single Responsibility**: Handle real-time communication with frontend clients

```typescript
// src/api/services/WebSocketService.ts
export class WebSocketService {
  private connections = new Map<string, WebSocket[]>();

  async sendToReservation(reservationId: string, data: any): Promise<void> {
    const connections = this.connections.get(reservationId) || [];

    const message = JSON.stringify(data);

    for (const connection of connections) {
      if (connection.readyState === WebSocket.OPEN) {
        connection.send(message);
      }
    }
  }

  addConnection(reservationId: string, connection: WebSocket): void {
    if (!this.connections.has(reservationId)) {
      this.connections.set(reservationId, []);
    }
    this.connections.get(reservationId)!.push(connection);
  }

  removeConnection(reservationId: string, connection: WebSocket): void {
    // Single responsibility: Stop polling
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private async pollForUpdates(onUpdate: (message: PaymentStatusUpdate) => void): Promise<void> {
    // Single responsibility: Poll and process queue messages
    const response = await this.queueClient.receiveMessages({ numberOfMessages: 1 });

    if (response.receivedMessageItems.length > 0) {
      const message = response.receivedMessageItems[0];
      const update = JSON.parse(message.messageText) as PaymentStatusUpdate;

      // Process the update
      onUpdate(update);

      // Delete the processed message
      await this.queueClient.deleteMessage(message.messageId, message.popReceipt);
    }
  }
}
```

### 2.2 Backend Core Components

#### ReservationController
**Responsibility**: Handle reservation validation and SAS token generation
**Single Responsibility**: HTTP request handling for reservation access

```typescript
// functions/src/controllers/reservation.controller.ts
@Controller('reservation')
export class ReservationController {
  constructor(
    private readonly reservationService: ReservationService,
    private readonly rateLimitService: RateLimitService,
    private readonly sasTokenService: SASTokenService
  ) {}

  @Get(':id')
  async getReservationAccess(
    @Param('id') reservationId: string,
    @Req() request: Request
  ): Promise<ReservationAccessResponse> {
    // Single responsibility: Validate and provide access to reservation

    // 1. Rate limiting check
    const clientIP = this.getClientIP(request);
    await this.rateLimitService.checkRateLimit(clientIP, reservationId);

    // 2. Validate reservation exists
    const reservation = await this.reservationService.validateReservation(reservationId);
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    // 3. Generate SAS token for blob access
    const sasToken = await this.sasTokenService.generateToken(reservationId);

    // 4. Return access credentials
    return {
      reservationId,
      sasToken,
      queueName: `payment-updates-${reservationId}`,
      expiresAt: null // Non-expiring token as per requirements
    };
  }

  private getClientIP(request: Request): string {
    // Single responsibility: Extract client IP
    return request.headers['x-forwarded-for'] as string ||
           request.headers['x-real-ip'] as string ||
           request.connection.remoteAddress ||
           'unknown';
  }
}
```

#### RateLimitService
**Responsibility**: Multi-level rate limiting with Azure Tables
**Single Responsibility**: Prevent abuse and enumeration attacks

```typescript
// functions/src/services/RateLimitService.ts
interface RateLimitConfig {
  perIPPerMinute: number;
  perReservationPerMinute: number;
  suspiciousThreshold: number;
  blockDuration: number;
}

@Injectable()
export class RateLimitService {
  private tableClient: TableClient;

  constructor(
    private config: RateLimitConfig,
    @Inject('STORAGE_CONNECTION') private connectionString: string
  ) {
    this.tableClient = new TableClient(connectionString, 'RateLimits');
  }

  async checkRateLimit(clientIP: string, reservationId?: string): Promise<void> {
    // Single responsibility: Check all rate limit rules

    const checks = await Promise.all([
      this.checkIPRateLimit(clientIP),
      this.checkReservationRateLimit(reservationId),
      this.checkSuspiciousActivity(clientIP)
    ]);

    const violations = checks.filter(check => check.violated);
    if (violations.length > 0) {
      throw new TooManyRequestsException(violations[0].message);
    }
  }

  private async checkIPRateLimit(clientIP: string): Promise<RateLimitResult> {
    // Single responsibility: Check IP-based rate limits
    const partitionKey = `ip-${clientIP}`;
    const rowKey = this.getCurrentTimeWindow();

    try {
      const entity = await this.tableClient.getEntity(partitionKey, rowKey);
      const currentCount = entity.requestCount as number;

      if (currentCount >= this.config.perIPPerMinute) {
        return {
          violated: true,
          message: 'IP rate limit exceeded',
          retryAfter: this.calculateRetryAfter(entity.windowStart as Date)
        };
      }

      // Increment counter
      await this.tableClient.updateEntity({
        partitionKey,
        rowKey,
        requestCount: currentCount + 1,
        lastRequest: new Date()
      }, 'Merge');

      return { violated: false };

    } catch (error) {
      if (error.statusCode === 404) {
        // First request in this window
        await this.tableClient.createEntity({
          partitionKey,
          rowKey,
          requestCount: 1,
          windowStart: new Date(),
          lastRequest: new Date()
        });
        return { violated: false };
      }
      throw error;
    }
  }

  private getCurrentTimeWindow(): string {
    // Single responsibility: Generate time-based partition key
    const now = new Date();
    const minutes = Math.floor(now.getMinutes());
    return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}-${minutes}`;
  }
}
```
```

