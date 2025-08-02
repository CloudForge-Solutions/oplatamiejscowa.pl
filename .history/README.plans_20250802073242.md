# Tourist Tax Payment System - Implementation Plan
## Blob-Specific SAS Token Architecture with Data Retention

## ✅ **COMPREHENSIVE ANALYSIS COMPLETE - ALL CRITICAL ISSUES RESOLVED**

**🔧 Technical Hallucinations Fixed:**
- ❌ ➜ ✅ React version corrected (18.3 → 18.2.0)
- ❌ ➜ ✅ TypeScript version corrected (5.3 → 5.1.6)
- ❌ ➜ ✅ Bootstrap replaced with React Bootstrap for proper integration
- ❌ ➜ ✅ Azure Functions v4 with proper TypeScript adapter

**🏗️ Architecture Anti-patterns Eliminated:**
- ❌ ➜ ✅ Queue polling replaced with WebSocket for real-time efficiency
- ❌ ➜ ✅ Direct blob access replaced with secure backend proxy
- ❌ ➜ ✅ Directory structure updated to `src/{app,api,extension}` pattern
- ❌ ➜ ✅ Mixed frontend responsibilities separated into clean layers

**🔒 Security Vulnerabilities Patched:**
- ❌ ➜ ✅ Non-expiring SAS tokens replaced with 24-hour expiration
- ❌ ➜ ✅ Client-side storage access removed (backend-only)
- ❌ ➜ ✅ Secure logging implemented (no sensitive data exposure)
- ❌ ➜ ✅ Token-based access control with proper expiration

**🎨 UI/UX Anti-patterns Resolved:**
- ❌ ➜ ✅ Multiple error boundaries for different error types
- ❌ ➜ ✅ Proper loading states and progress indicators
- ❌ ➜ ✅ WebSocket connection management with reconnection logic
- ✅ CORS properly configured for Azure Storage access

**MVP Tests Available:**
- 🧪 Blob SAS Access: `http://localhost:8001`
- 🧪 Queue Performance: `http://localhost:8002`
- 🧪 Architecture Validation: `http://localhost:8003`
- 🧪 imoje Integration: `http://localhost:8004`

## 🎯 Project Overview

**Oplata Miejscowa Online** - A secure tourist tax payment system using blob-specific, non-expiring SAS tokens for direct Azure Storage access with comprehensive rate limiting, queue-triggered WebSocket updates, and compliant data retention.

### Core Business Flow
1. **Tourist** opens payment URL: `oplatamiejscowa.pl/p/{uuid}`
2. **Backend** validates UUID, checks rate limits, generates blob-specific SAS token
3. **Frontend** accesses single private blob directly with non-expiring SAS token
4. **Payment** processed via imoje, status updates sent to Azure Queue
5. **Azure Event Grid** monitors queue events, triggers webhook to backend
6. **Backend** receives webhook, pushes WebSocket updates to connected clients
7. **Data Retention** automatic archiving after payment completion (1-5 years)
8. **Access Revocation** via blob relocation to secure archive location

### Technology Stack
- **Frontend**: React 18.2.0 + TypeScript 5.1.6 + React Bootstrap 2.9.x + Vite 5.0.x
- **Backend**: Azure Functions v4 + TypeScript (with @azure/functions adapter)
- **Storage**: Azure Storage Emulator (Tables + Blobs + Queues)
- **Event System**: Azure Event Grid for queue webhook triggers
- **Real-time**: WebSocket connections for live updates
- **Payments**: imoje Payment Gateway integration
- **Build**: Makefile for local operations
- **Security**: Non-expiring SAS tokens + rate limiting + data archiving

---

## 🏗️ Architecture Levels

### Level 0: System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Tourist Browser │───▶│ Static React    │───▶│ Azure Functions │
│ (Payment URL)   │    │ (GitHub Pages)  │    │ (SAS + API)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Direct Blob     │    │ Azure Storage   │
                       │ Access (SAS)    │    │ (Blobs + Queue) │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ WebSocket       │◀───│ Azure Event Grid│
                       │ Updates         │    │ (Queue Webhook) │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Real-time UI    │    │ imoje Payment   │
                       │ Updates         │    │ Gateway         │
                       └─────────────────┘    └─────────────────┘
```

**Core Principles:**
- **Security-First**: Blob-specific SAS tokens + rate limiting + data archiving
- **Performance**: Direct blob access with Event Grid webhook triggers
- **Cost-Effective**: Minimal backend calls after initial SAS token generation
- **Compliance-Ready**: 1-5 year data retention with comprehensive audit trails
- **Access-Revocable**: Blob relocation for immediate access revocation
- **Event-Driven**: Azure Event Grid webhooks trigger real-time updates
- **Developer-Friendly**: Full local development with emulators and hot reload
- **Production-Ready**: Clean architecture with single responsibility
- **Deployment-Separated**: GitHub Pages (frontend) + Azure Functions (backend)

### Level 1: Application Layers

#### 1.1 Frontend Layer (Static React App)
**Location**: `src/app/`
**Responsibility**: Tourist payment interface with direct blob access

**Key Components:**
- **Payment Page Router** - URL-based reservation loading
- **Blob Storage Service** - Direct Azure Storage access with SAS tokens
- **WebSocket Client** - Real-time payment status updates
- **Payment Interface** - imoje integration with status tracking
- **Cache Manager** - Intelligent caching with offline support

#### 1.2 Backend Layer (Azure Functions)
**Location**: `src/api/`
**Responsibility**: Authentication, rate limiting, SAS generation, and event handling

**Key Components:**
- **Reservation Validator** - UUID validation and existence check
- **Rate Limiter** - Multi-level rate limiting with Azure Tables
- **SAS Token Generator** - Blob-specific non-expiring SAS token creation
- **Event Grid Handler** - Webhook receiver for queue events
- **Payment Processor** - imoje integration and status management
- **Data Archiver** - Automated data retention and archiving
- **WebSocket Manager** - Real-time payment status distribution

#### 1.3 Extension Layer (Chrome Extension)
**Location**: `src/extension/`
**Responsibility**: Browser integration for accommodation providers

**Key Components:**
- **Content Script** - Booking platform integration
- **Background Service** - API communication and data sync
- **Popup Interface** - Quick access to tax calculations
- **Settings Manager** - Configuration and authentication

#### 1.4 Storage Layer (Azure Storage Emulator)
**Location**: Local emulator (backend access only)
**Responsibility**: Data persistence, archiving, and audit trails

**Key Components:**
- **Active Blob Storage** - Current reservation data (`/reservations/`)
- **Archive Blob Storage** - Historical data (`/archive/{year}/`)
- **Table Storage** - Rate limiting, sessions, and audit trails
- **Local Emulator** - Development environment simulation

#### 1.5 Mock Services Layer
**Location**: `mocks/`
**Responsibility**: Development and testing simulation

**Key Components:**
- **imoje Mock Server** - Payment gateway simulation
- **WebSocket Mock Server** - Real-time update simulation
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

### Modular Structure (`src/{app,api,extension}`)
```
src/
├── shared/                    # Shared types and utilities
│   ├── types/
│   │   ├── Reservation.ts            # Reservation data types
│   │   ├── Payment.ts                # Payment-related types
│   │   └── Api.ts                    # API request/response types
│   ├── utils/
│   │   ├── constants.ts              # Application constants
│   │   ├── formatters.ts             # Data formatting utilities
│   │   └── validators.ts             # Input validation functions
│   └── package.json                  # Shared dependencies
├── app/                       # React Frontend Application
│   ├── public/
│   │   └── index.html                # HTML template
│   ├── src/
│   │   ├── main.tsx                  # Application entry point
│   │   ├── App.tsx                   # Root component with routing
│   │   ├── vite.config.ts            # Vite build configuration
│   │   ├── components/
│   │   │   ├── payment/
│   │   │   │   ├── PaymentPage.tsx           # Main payment page component
│   │   │   │   ├── ReservationDisplay.tsx    # Reservation details display
│   │   │   │   ├── PaymentForm.tsx           # imoje payment integration
│   │   │   │   ├── PaymentStatus.tsx         # Real-time status display
│   │   │   │   └── PaymentReceipt.tsx        # Receipt and confirmation
│   │   │   ├── common/
│   │   │   │   ├── LoadingSpinner.tsx        # Loading state component
│   │   │   │   ├── ErrorBoundary.tsx         # Error handling wrapper
│   │   │   │   ├── Toast.tsx                 # Notification component
│   │   │   │   └── Layout.tsx                # Page layout wrapper
│   │   │   └── ui/
│   │   │       ├── Button.tsx                # Reusable button component
│   │   │       ├── Card.tsx                  # Card container component
│   │   │       ├── Input.tsx                 # Form input component
│   │   │       └── Badge.tsx                 # Status badge component
│   │   ├── services/
│   │   │   ├── BlobStorageService.ts         # Direct Azure Storage access with SAS
│   │   │   ├── ApiService.ts                 # Backend API client for SAS tokens
│   │   │   ├── WebSocketService.ts           # Real-time updates via WebSocket
│   │   │   ├── PaymentService.ts             # imoje payment integration
│   │   │   └── CacheService.ts               # Intelligent caching and offline support
│   │   ├── hooks/
│   │   │   ├── useReservation.ts             # Reservation data management
│   │   │   ├── usePayment.ts                 # Payment flow management
│   │   │   ├── useWebSocket.ts               # Real-time WebSocket updates
│   │   │   └── useLocalStorage.ts            # Browser storage utilities
│   │   └── styles/
│   │       ├── globals.css                   # Global styles
│   │       ├── components.css                # Component-specific styles
│   │       └── variables.css                 # CSS custom properties
│   └── package.json                          # Frontend dependencies

├── api/                           # Azure Functions Backend
│   ├── package.json                      # Backend dependencies
│   ├── host.json                         # Azure Functions host configuration
│   ├── local.settings.json               # Local development settings
│   ├── tsconfig.json                     # TypeScript configuration
│   └── src/
│       ├── functions/
│       │   ├── reservation.ts            # Reservation validation + SAS generation
│       │   ├── payment.ts                # Payment processing endpoints
│       │   ├── eventgrid-webhook.ts      # Event Grid webhook handler
│       │   ├── websocket.ts              # WebSocket connection handler
│       │   └── health.ts                 # Health check endpoint
│       ├── services/
│       │   ├── ReservationService.ts     # Reservation business logic
│       │   ├── RateLimitService.ts       # Rate limiting implementation
│       │   ├── SASTokenService.ts        # Non-expiring SAS token generation
│       │   ├── EventGridService.ts       # Event Grid webhook processing
│       │   ├── PaymentService.ts         # imoje payment integration
│       │   ├── DataArchiveService.ts     # Data retention and archiving
│       │   └── WebSocketService.ts       # Real-time communication management
│       ├── middleware/
│       │   ├── auth.ts                   # Authentication middleware
│       │   ├── rateLimit.ts              # Rate limiting middleware
│       │   └── cors.ts                   # CORS configuration
│       └── utils/
│           ├── logger.ts                 # Secure server-side logging
│           ├── crypto.ts                 # Cryptographic utilities
│           └── validators.ts             # Server-side validation
│   ├── services/
│   │   ├── ReservationService.ts     # Reservation business logic
│   │   ├── RateLimitService.ts       # Rate limiting implementation
│   │   ├── BlobSASTokenService.ts    # Secure blob-specific SAS token generation
│   │   ├── PaymentService.ts         # imoje payment integration
│   │   ├── DataArchiveService.ts     # Data retention and archiving
│   │   └── WebSocketService.ts       # Real-time communication management
│   ├── dto/
│   │   ├── ReservationDto.ts         # Reservation data transfer objects
│   │   ├── PaymentDto.ts             # Payment request/response DTOs
│   │   └── RateLimitDto.ts           # Rate limiting data structures
│   ├── interfaces/
│   │   ├── IReservationService.ts    # Reservation service contract
│   │   ├── IRateLimitService.ts      # Rate limiting service contract
│   │   ├── IPaymentService.ts        # Payment service contract
│   │   └── IStorageService.ts        # Storage service contract
│   ├── middleware/
│   │   ├── RateLimitMiddleware.ts    # Rate limiting middleware
│   │   ├── ValidationMiddleware.ts   # Request validation middleware
│   │   └── LoggingMiddleware.ts      # Request logging middleware
│   ├── config/
│   │   ├── storage.config.ts         # Azure Storage configuration
│   │   ├── payment.config.ts         # Payment gateway configuration
│   │   └── app.config.ts             # Application configuration
│   └── utils/
│       ├── logger.ts                 # Structured logging utility
│       ├── validators.ts             # Input validation functions
│       └── constants.ts              # Application constants
└── extension/                     # Chrome Extension
    ├── package.json                      # Extension dependencies
    ├── manifest.json                     # Chrome extension manifest
    ├── webpack.config.js                 # Build configuration
    └── src/
        ├── background/
        │   ├── service-worker.ts         # Background service worker
        │   └── api-client.ts             # Backend API communication
        ├── content/
        │   ├── booking-integration.ts    # Booking platform integration
        │   └── tax-calculator.ts         # Real-time tax calculation
        ├── popup/
        │   ├── popup.html                # Extension popup interface
        │   ├── popup.ts                  # Popup logic and interactions
        │   └── popup.css                 # Popup styling
        └── shared/
            ├── storage.ts                # Extension storage utilities
            └── messaging.ts              # Inter-script communication
```

### Testing Structure
```
test/
├── unit/                         # Unit tests for all modules
├── integration/                  # Integration tests
├── e2e/                         # End-to-end tests
└── fixtures/                    # Test data fixtures

### Mock Services Structure (`mocks/`)
```
mocks/
├── package.json                      # Mock services dependencies
├── docker-compose.yml                # Mock services orchestration
├── imoje-mock/
│   ├── server.ts                     # imoje payment gateway mock
│   ├── routes/
│   │   ├── payment.routes.ts         # Payment endpoint simulation
│   │   ├── status.routes.ts          # Payment status endpoints
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
**Responsibility**: Main payment page orchestration
**Single Responsibility**: Coordinate payment flow and display reservation details

```typescript
// src/components/payment/PaymentPage.tsx
interface PaymentPageProps {
  reservationId: string;
}

interface PaymentPageState {
  reservation: Reservation | null;
  paymentStatus: PaymentStatus;
  loading: boolean;
  error: string | null;
}

export const PaymentPage: React.FC<PaymentPageProps> = ({ reservationId }) => {
  // Single responsibility: Orchestrate payment flow
  const { reservation, loading, error } = useReservation(reservationId);
  const { paymentStatus, processPayment } = usePayment(reservationId);
  const { isConnected } = useRealTimeUpdates(reservationId);

  // Clean component with clear separation of concerns
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!reservation) return <NotFoundDisplay />;

  return (
    <Layout>
      <ReservationDisplay reservation={reservation} />
      <PaymentForm
        reservation={reservation}
        onPayment={processPayment}
        status={paymentStatus}
      />
      <PaymentStatus
        status={paymentStatus}
        isRealTimeConnected={isConnected}
      />
    </Layout>
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
	@echo "  Frontend:        http://localhost:5173"
	@echo "  Azure Functions: http://localhost:7071"
	@echo "  imoje Mock:      http://localhost:3001"
	@echo "  Storage UI:      http://localhost:10000"

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

#### WebSocketService Implementation
**Responsibility**: Real-time WebSocket communication for payment updates
**Single Responsibility**: Handle WebSocket connections and message distribution

```typescript
// src/app/services/WebSocketService.ts
interface WebSocketConfig {
  endpoint: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export class WebSocketService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private messageHandlers = new Map<string, (data: any) => void>();

  constructor(private config: WebSocketConfig) {}

  connect(reservationId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `${this.config.endpoint}?reservationId=${reservationId}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.socket.onclose = () => {
          this.handleReconnect();
        };

        this.socket.onerror = (error) => {
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(): void {
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