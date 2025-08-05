# 🏛️ Tourist Tax Payment System - Implementation Plan

## 📋 Project Overview
**Project**: Opłata Miejscowa Online (Tourist Tax Payment System)
**Domain**: Polish cities tourist tax collection with cost-optimal architecture
**Tech Stack**: React + TypeScript + Vite + Bootstrap + imoje Payment Gateway + Azure Storage
**Target**: Mobile-first tourist payment application with city-based URL routing

## 🚨 CRITICAL DEVELOPMENT RULES

### 🔧 Development Workflow
- **Start server**: `make dev` (uses Makefile exclusively for npm/node operations)
- **Install packages**: `make install` (never use npm directly)
- **Run tests**: Use Makefile targets only
- **TypeScript migration**: Stop `make dev` and restart after .js → .ts conversion (clears Vite cache)

### 🏗️ Architecture Principles
- **Single Source of Truth**: Blob storage as authoritative data source, Table storage as index only
- **Mobile-First**: Primary mobile target with desktop as secondary
- **TypeScript-first**: Migrate any modified .js files to .ts/.tsx during changes
- **Cost-Optimal**: Minimize Azure operations through smart caching and direct blob access
- **City-Based Routing**: URLs like `/p/gdansk/2025/uuid` for optimal storage hierarchy
- **EventBus-Driven**: Coordinated updates via EventBus pattern with simple polling

### 🔍 Code Quality Standards
- **Line-by-line analysis**: Review all logs/code comprehensively, find warnings, errors, hidden issues
- **No console.log**: Use logger exclusively
- **No production assumptions**: Never assume completion without user-tested application logs
- **No data duplication**: Single source of truth with derived index data only
- **Fail-fast validation**: Strict validation with immediate error throwing

---

## 🏗️ Architecture Levels

### Level 0: Cost-Optimal System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Tourist Mobile  │───▶│ Static React    │───▶│ Azure Functions │
│ /p/city/year/id │    │ (GitHub Pages)  │    │ (NestJS API)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ localStorage    │    │ Table Storage   │
                       │ Cache (1h TTL)  │    │ (Index O(1))    │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Direct Blob     │◀───│ SAS Token       │
                       │ Access (24h)    │    │ Generation      │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                ▼                       ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Blob Storage    │    │ City Hierarchy  │
                       │ (Source Truth)  │    │ gdansk/2025/    │
                       └─────────────────┘    └─────────────────┘
```

**Core Principles:**
- **Cost-Optimal**: 75% reduction in operations through smart caching and O(1) lookups
- **Single Source of Truth**: Blob storage contains all business data, Table storage only indexes
- **City-Based Hierarchy**: Storage organized by city/year for optimal partitioning
- **Mobile-First**: Touch-friendly UI optimized for mobile devices (44px touch targets)
- **Direct Access**: Frontend downloads blobs directly after SAS token acquisition

### Level 1: Storage Architecture

#### 1.1 Blob Storage Layout (Source of Truth)
**Container**: `reservations`
```
reservations/
├── gdansk/
│   ├── 2025/
│   │   ├── 3282e664-ed1b-4e30-af04-cb176ac06d5f.json
│   │   ├── 4393f775-f90c-23e4-b567-537725285001.json
│   │   └── 5504g886-g01d-34f5-c678-648836396002.json
│   └── 2024/
├── krakow/
│   ├── 2025/
│   │   ├── 1171a553-a78a-01b2-9345-426614174000.json
│   │   └── 2282b664-b89b-12c3-a456-537725285001.json
│   └── 2024/
└── warsaw/
    └── 2025/
        ├── 7777c997-c12c-45d6-e789-759947507003.json
        └── 8888d008-d23d-56e7-f890-860058618004.json
```

**Container**: `reservations-archived`
```
reservations-archived/
├── gdansk/2024/...
├── krakow/2024/...
└── warsaw/2024/...
```

#### 1.2 Table Storage Layout (Index Only)
**Table**: `reservations_metadata`
```typescript
interface ReservationIndex {
  partitionKey: string;           // "gdansk_2025"
  rowKey: string;                 // UUID
  
  // ONLY indexing/routing data
  blobPath: string;               // "gdansk/2025/uuid.json"
  blobContainer: string;          // "reservations" or "reservations-archived"
  
  // ONLY data needed for access control (derived, not duplicated)
  status: 'pending' | 'paid' | 'expired' | 'archived';
  expiresAt: string;              // For cleanup automation
  
  // ONLY caching optimization data
  sasTokenHash?: string;          // Cached SAS token (hashed for security)
  sasTokenExpiresAt?: string;     // SAS token expiry
  
  // ONLY metadata timestamps (not business timestamps)
  indexCreatedAt: string;         // When index was created
  indexUpdatedAt: string;         // When index was last updated
  lastAccessedAt?: string;        // For usage analytics
}
```

### Level 2: Tourist Flow Implementation

#### 2.1 Optimal Tourist Flow
```typescript
interface OptimalTouristFlow {
  step1: 'Frontend checks localStorage cache';
  step2: 'If cache miss, request blob metadata only';
  step3: 'API returns blob existence + basic info (no SAS)';
  step4: 'If exists, API returns cached SAS token';
  step5: 'Frontend downloads blob directly';
  step6: 'Cache blob data locally with TTL';
}
```

#### 2.2 URL Structure
```typescript
// Frontend Routes
const routes = {
  payment: '/p/:city/:year/:uuid',
  examples: [
    '/p/gdansk/2025/3282e664-ed1b-4e30-af04-cb176ac06d5f',
    '/p/krakow/2025/1171a553-a78a-01b2-9345-426614174000',
    '/p/warsaw/2025/7777c997-c12c-45d6-e789-759947507003'
  ]
};

// API Endpoints
const apiEndpoints = {
  metadata: '/api/reservations/metadata/:city/:year/:uuid',
  sasToken: '/api/reservations/sas/:city/:year/:uuid',
  create: '/api/reservations',
  payment: '/api/payments/:reservationId'
};
```

#### 2.3 Data Consistency Rules
```typescript
// WRITE OPERATIONS (Blob → Table)
const writeFlow = {
  step1: 'Write to blob (SOURCE OF TRUTH)',
  step2: 'Create/update index entry (DERIVED DATA ONLY)',
  rule: 'Blob is always authoritative, table is always derived'
};

// READ OPERATIONS (Index → Blob)
const readFlow = {
  step1: 'O(1) existence check via table index',
  step2: 'Generate/retrieve cached SAS token',
  step3: 'Frontend downloads blob directly',
  rule: 'Index for routing, blob for data'
};
```

### Level 3: Cost Optimization

#### 3.1 Operation Cost Analysis
```typescript
const costOptimization = {
  // Tourist access (per 1000 tourists)
  current: {
    tableReads: '500 × $0.0004/10K = $0.00002',
    sasGeneration: '500 × $0.00001 = $0.005',
    blobReads: '500 × $0.0004/10K = $0.00002',
    total: '$0.00504 per 1000 tourists'
  },
  
  // Storage (monthly per 10K reservations)
  storage: {
    tableIndex: '10MB × $45/GB = $0.45',
    blobData: '20MB × $18/GB = $0.36',
    total: '$0.81 per 10K reservations'
  },
  
  savings: {
    operations: '75% reduction vs multi-storage',
    storage: '32% reduction vs duplicated data',
    complexity: '60% reduction in failure modes'
  }
};
```

#### 3.2 Caching Strategy
```typescript
const cachingLayers = {
  // L1: Frontend localStorage
  frontend: {
    ttl: '1 hour',
    size: '50 reservations',
    hitRate: '50%',
    cost: 'Zero'
  },
  
  // L2: API SAS token cache
  api: {
    ttl: '24 hours',
    storage: 'Table metadata',
    hitRate: '80%',
    cost: 'Minimal table operations'
  },
  
  // L3: Blob storage
  blob: {
    ttl: 'Permanent with lifecycle',
    access: 'Direct via SAS token',
    cost: 'Only when cache miss'
  }
};
```

---

## 📁 Current Implementation Status

### ✅ COMPLETED
1. **NestJS API Backend** - Reservation creation with auto-calculation
2. **Azure Storage Integration** - Blob and Table services configured
3. **City-Based Tax Rates** - 30+ Polish cities with automatic lookup
4. **Auto-Calculation Logic** - Nights, rates, and totals computed automatically
5. **Development Environment** - Azurite emulator with proper CORS

### 🔄 IN PROGRESS
1. **Storage Architecture Migration** - Moving to single source of truth model
2. **Frontend Route Implementation** - City-based URL structure
3. **Optimal Tourist Flow** - Implementing the 6-step caching flow

### 🎯 NEXT STEPS
1. **Complete Storage Migration** - Implement blob-first, table-index architecture
2. **Frontend Integration** - Connect React app to new API endpoints
3. **Cost Monitoring** - Implement operation tracking and optimization
4. **Production Deployment** - Azure Functions and Storage account setup

---

## 🔧 Implementation Details

### API Service Architecture
```typescript
// Current NestJS structure
src/api/src/nest/
├── apps/payment/
│   ├── controllers/
│   │   ├── reservations.controller.ts
│   │   └── payments.controller.ts
│   ├── services/
│   │   ├── azure-storage.service.ts
│   │   ├── tax-rate.service.ts
│   │   └── reservation.service.ts
│   └── dto/
│       ├── create-reservation.dto.ts
│       └── payment.dto.ts
├── common/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
└── main.ts
```

### Frontend Architecture
```typescript
// Planned React structure
src/app/src/
├── apps/tourist-tax/
│   ├── components/
│   │   ├── PaymentPage.tsx
│   │   ├── ReservationDisplay.tsx
│   │   └── PaymentForm.tsx
│   ├── hooks/
│   │   ├── useReservationData.ts
│   │   └── usePaymentFlow.ts
│   └── services/
│       ├── TouristPaymentService.ts
│       └── CacheService.ts
├── platform/
│   ├── storage/
│   │   └── OptimalStorageService.ts
│   └── api/
│       └── ApiService.ts
└── shell/
    ├── App.tsx
    └── context/
        └── TouristTaxContext.tsx
```

This architecture provides **enterprise-grade reliability** at **startup-friendly costs** while maintaining **data engineering best practices** with a **single source of truth**.
