# Tourist Tax Payment System - Implementation Plan
## Non-Expiring SAS Token Architecture with Local Development

## 🎯 Project Overview

**Oplata Miejscowa Online** - A secure tourist tax payment system using non-expiring SAS tokens for direct Azure Storage access with comprehensive rate limiting and real-time payment status updates.

### Core Business Flow
1. **Tourist** opens payment URL: `oplatamiejscowa.pl/p/{uuid}`
2. **Backend** validates UUID, checks rate limits, generates long-lived SAS token
3. **Frontend** accesses private blob storage directly with SAS token
4. **Payment** processed via imoje with real-time status updates via Azure Queue polling
5. **Status** updates trigger blob refresh and UI updates

### Technology Stack
- **Frontend**: React 18.3 + TypeScript 5.3 + Bootstrap 5.3 + Vite 5.1
- **Backend**: NestJS 10.3 + Azure Functions (local emulator)
- **Storage**: Azure Storage Emulator (Tables + Blobs + Queues)
- **Payments**: imoje Mock Server for development
- **Build**: Makefile for local operations
- **Security**: Rate limiting + SAS tokens + audit logging

---

## 🏗️ Architecture Levels

### Level 0: System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Tourist Browser │───▶│ Static React    │───▶│ Azure Functions │
│ (Payment URL)   │    │ (GitHub Pages)  │    │ (Local Emulator)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Direct Blob     │    │ Azure Storage   │
                       │ Access (SAS)    │    │ (Local Emulator)│
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Queue Polling   │    │ imoje Mock      │
                       │ (Status Updates)│    │ Server          │
                       └─────────────────┘    └─────────────────┘
```

**Core Principles:**
- **Security-First**: Rate limiting + non-expiring but revocable SAS tokens
- **Performance**: Direct blob access with intelligent caching
- **Cost-Effective**: Minimal backend calls after initial authentication
- **Developer-Friendly**: Full local development with emulators
- **Production-Ready**: Clean architecture with single responsibility

### Level 1: Application Layers

#### 1.1 Frontend Layer (Static React App)
**Location**: `src/`
**Responsibility**: Tourist payment interface with direct storage access

**Key Components:**
- **Payment Page Router** - URL-based reservation loading
- **SAS Token Manager** - Secure token handling and caching
- **Blob Storage Client** - Direct Azure Storage access
- **Queue Poller** - Real-time payment status updates
- **Payment Interface** - imoje integration

#### 1.2 Backend Layer (Azure Functions)
**Location**: `functions/`
**Responsibility**: Authentication, rate limiting, and payment processing

**Key Components:**
- **Reservation Validator** - UUID validation and existence check
- **Rate Limiter** - Multi-level rate limiting with Azure Tables
- **SAS Token Generator** - Long-lived token creation with revocation capability
- **Payment Processor** - imoje integration and status management
- **Queue Manager** - Payment status update distribution

#### 1.3 Storage Layer (Azure Storage Emulator)
**Location**: Local emulator
**Responsibility**: Data persistence and real-time communication

**Key Components:**
- **Blob Storage** - Private reservation data storage
- **Table Storage** - Rate limiting and token management
- **Queue Storage** - Payment status update distribution
- **Local Emulator** - Development environment simulation

#### 1.4 Mock Services Layer
**Location**: `mocks/`
**Responsibility**: Development and testing simulation

**Key Components:**
- **imoje Mock Server** - Payment gateway simulation
- **Payment Status Simulator** - Automated status changes
- **Test Data Generator** - Sample reservations and payments

---

## 📁 Directory Structure

### Project Root Structure
```
oplata-miejscowa/
├── Makefile                    # Local development operations
├── docker-compose.yml          # Local services orchestration
├── package.json               # Root package configuration
├── README.md                  # Project documentation
├── .env.local                 # Local environment variables
├── .gitignore                 # Git ignore patterns
└── tsconfig.json              # TypeScript configuration
```

### Frontend Structure (`src/`)
```
src/
├── main.tsx                   # Application entry point
├── App.tsx                    # Root component with routing
├── vite.config.ts             # Vite build configuration
├── index.html                 # HTML template
├── components/
│   ├── payment/
│   │   ├── PaymentPage.tsx           # Main payment page component
│   │   ├── ReservationDisplay.tsx    # Reservation details display
│   │   ├── PaymentForm.tsx           # imoje payment integration
│   │   ├── PaymentStatus.tsx         # Real-time status display
│   │   └── PaymentReceipt.tsx        # Receipt and confirmation
│   ├── common/
│   │   ├── LoadingSpinner.tsx        # Loading state component
│   │   ├── ErrorBoundary.tsx         # Error handling wrapper
│   │   ├── Toast.tsx                 # Notification component
│   │   └── Layout.tsx                # Page layout wrapper
│   └── ui/
│       ├── Button.tsx                # Reusable button component
│       ├── Card.tsx                  # Card container component
│       ├── Input.tsx                 # Form input component
│       └── Badge.tsx                 # Status badge component
├── services/
│   ├── StorageService.ts             # Azure Blob Storage client
│   ├── QueueService.ts               # Azure Queue polling service
│   ├── PaymentService.ts             # imoje payment integration
│   ├── TokenService.ts               # SAS token management
│   └── ApiService.ts                 # Backend API client
├── hooks/
│   ├── useReservation.ts             # Reservation data management
│   ├── usePayment.ts                 # Payment flow management
│   ├── useRealTimeUpdates.ts         # Queue polling and updates
│   └── useLocalStorage.ts            # Browser storage utilities
├── types/
│   ├── Reservation.ts                # Reservation data types
│   ├── Payment.ts                    # Payment-related types
│   ├── Storage.ts                    # Azure Storage types
│   └── Api.ts                        # API request/response types
├── utils/
│   ├── constants.ts                  # Application constants
│   ├── formatters.ts                 # Data formatting utilities
│   ├── validators.ts                 # Input validation functions
│   └── logger.ts                     # Client-side logging
└── styles/
    ├── globals.css                   # Global styles
    ├── components.css                # Component-specific styles
    └── variables.css                 # CSS custom properties

### Backend Structure (`functions/`)
```
functions/
├── package.json                      # Function app dependencies
├── host.json                         # Azure Functions host configuration
├── local.settings.json               # Local development settings
├── tsconfig.json                     # TypeScript configuration
├── src/
│   ├── main.ts                       # NestJS application bootstrap
│   ├── app.module.ts                 # Root application module
│   ├── controllers/
│   │   ├── reservation.controller.ts # Reservation validation endpoint
│   │   ├── payment.controller.ts     # Payment processing endpoints
│   │   └── health.controller.ts      # Health check endpoint
│   ├── services/
│   │   ├── ReservationService.ts     # Reservation business logic
│   │   ├── RateLimitService.ts       # Rate limiting implementation
│   │   ├── SASTokenService.ts        # SAS token generation
│   │   ├── PaymentService.ts         # imoje payment integration
│   │   └── QueueService.ts           # Azure Queue management
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
└── test/
    ├── unit/                         # Unit tests
    ├── integration/                  # Integration tests
    └── fixtures/                     # Test data fixtures

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

#### StorageService Implementation
**Responsibility**: Direct Azure Blob Storage access with SAS tokens
**Single Responsibility**: Handle all blob storage operations

```typescript
// src/services/StorageService.ts
interface StorageConfig {
  storageAccount: string;
  containerName: string;
  sasToken: string;
}

export class StorageService {
  private blobServiceClient: BlobServiceClient;
  private containerClient: ContainerClient;

  constructor(private config: StorageConfig) {
    // Single responsibility: Initialize storage clients
    this.initializeClients();
  }

  private initializeClients(): void {
    const sasUrl = `https://${this.config.storageAccount}.blob.core.windows.net?${this.config.sasToken}`;
    this.blobServiceClient = new BlobServiceClient(sasUrl);
    this.containerClient = this.blobServiceClient.getContainerClient(this.config.containerName);
  }

  async getReservation(reservationId: string): Promise<Reservation> {
    // Single responsibility: Fetch reservation data
    try {
      const blobClient = this.containerClient.getBlobClient(`reservations/${reservationId}.json`);
      const downloadResponse = await blobClient.download();
      const content = await this.streamToString(downloadResponse.readableStreamBody!);
      return JSON.parse(content) as Reservation;
    } catch (error) {
      throw new StorageError(`Failed to fetch reservation ${reservationId}`, error);
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
```
```