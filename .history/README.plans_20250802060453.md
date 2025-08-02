# Tourist Tax Payment System - Implementation Plan
## Blob-Specific SAS Token Architecture with Data Retention

## 🎯 Project Overview

**Oplata Miejscowa Online** - A secure tourist tax payment system using blob-specific, non-expiring SAS tokens for direct Azure Storage access with comprehensive rate limiting, real-time payment status updates, and compliant data retention.

### Core Business Flow
1. **Tourist** opens payment URL: `oplatamiejscowa.pl/p/{uuid}`
2. **Backend** validates UUID, checks rate limits, generates blob-specific SAS token
3. **Frontend** accesses single private blob directly with scoped SAS token
4. **Payment** processed via imoje with real-time status updates via Azure Queue polling
5. **Data Retention** automatic archiving after payment completion (1-5 years)
6. **Access Revocation** via blob relocation to secure archive location

### Technology Stack
- **Frontend**: React 18.3 + TypeScript 5.3 + Bootstrap 5.3 + Vite 5.1
- **Backend**: NestJS 10.3 + Azure Functions (local emulator)
- **Storage**: Azure Storage Emulator (Tables + Blobs + Queues)
- **Payments**: imoje Mock Server for development
- **Build**: Makefile for local operations
- **Security**: Blob-specific SAS tokens + rate limiting + data archiving

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
- **Security-First**: Blob-specific SAS tokens + rate limiting + data archiving
- **Performance**: Direct single blob access with intelligent caching
- **Cost-Effective**: Minimal backend calls after initial authentication
- **Compliance-Ready**: 1-5 year data retention with audit trails
- **Access-Revocable**: Blob relocation for immediate access revocation
- **Developer-Friendly**: Full local development with emulators
- **Production-Ready**: Clean architecture with single responsibility

### Level 1: Application Layers

#### 1.1 Frontend Layer (Static React App)
**Location**: `src/`
**Responsibility**: Tourist payment interface with blob-specific storage access

**Key Components:**
- **Payment Page Router** - URL-based reservation loading
- **Blob-Specific SAS Manager** - Secure single-blob token handling
- **Direct Blob Client** - Single blob Azure Storage access
- **Queue Poller** - Real-time payment status updates
- **Payment Interface** - imoje integration with status tracking

#### 1.2 Backend Layer (Azure Functions)
**Location**: `functions/`
**Responsibility**: Authentication, rate limiting, and data lifecycle management

**Key Components:**
- **Reservation Validator** - UUID validation and existence check
- **Rate Limiter** - Multi-level rate limiting with Azure Tables
- **Blob-Specific SAS Generator** - Single blob token creation
- **Payment Processor** - imoje integration and status management
- **Data Archiver** - Automated data retention and archiving
- **Queue Manager** - Payment status update distribution

#### 1.3 Storage Layer (Azure Storage Emulator)
**Location**: Local emulator
**Responsibility**: Data persistence, archiving, and real-time communication

**Key Components:**
- **Active Blob Storage** - Current reservation data (`/reservations/`)
- **Archive Blob Storage** - Historical data (`/archive/{year}/`)
- **Table Storage** - Rate limiting and audit trails
- **Queue Storage** - Payment status update distribution
- **Local Emulator** - Development environment simulation

#### 1.4 Mock Services Layer
**Location**: `mocks/`
**Responsibility**: Development and testing simulation

**Key Components:**
- **imoje Mock Server** - Payment gateway simulation
- **Payment Status Simulator** - Automated status changes
- **Data Lifecycle Simulator** - Archive and retention testing
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
│   ├── BlobStorageService.ts         # Single blob Azure Storage client
│   ├── QueuePollingService.ts        # Azure Queue polling service
│   ├── PaymentService.ts             # imoje payment integration
│   ├── SASTokenService.ts            # Blob-specific SAS token management
│   ├── DataRetentionService.ts       # Archive and retention logic
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
│   │   ├── BlobSASTokenService.ts    # Blob-specific SAS token generation
│   │   ├── PaymentService.ts         # imoje payment integration
│   │   ├── DataArchiveService.ts     # Data retention and archiving
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

#### QueueService Implementation
**Responsibility**: Azure Queue polling for real-time updates
**Single Responsibility**: Handle queue operations and status updates

```typescript
// src/services/QueueService.ts
interface QueueConfig {
  storageAccount: string;
  queueName: string;
  sasToken: string;
  pollInterval: number;
}

export class QueueService {
  private queueServiceClient: QueueServiceClient;
  private queueClient: QueueClient;
  private pollingInterval: NodeJS.Timeout | null = null;

  constructor(private config: QueueConfig) {
    this.initializeClients();
  }

  private initializeClients(): void {
    // Single responsibility: Initialize queue clients
    const sasUrl = `https://${this.config.storageAccount}.queue.core.windows.net?${this.config.sasToken}`;
    this.queueServiceClient = new QueueServiceClient(sasUrl);
    this.queueClient = this.queueServiceClient.getQueueClient(this.config.queueName);
  }

  startPolling(onUpdate: (message: PaymentStatusUpdate) => void): void {
    // Single responsibility: Start polling for updates
    this.pollingInterval = setInterval(async () => {
      try {
        await this.pollForUpdates(onUpdate);
      } catch (error) {
        console.error('Queue polling error:', error);
      }
    }, this.config.pollInterval);
  }

  stopPolling(): void {
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
      expiresAt: null // Non-expiring token
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