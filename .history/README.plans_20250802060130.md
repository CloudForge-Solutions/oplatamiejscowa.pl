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
```