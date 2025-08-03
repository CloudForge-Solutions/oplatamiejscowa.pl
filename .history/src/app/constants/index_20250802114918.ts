/**
 * Constants Barrel Export - Tourist Tax Payment System
 *
 * ARCHITECTURE PRINCIPLE: Single Entry Point for All Constants
 *
 * This file serves as the main entry point for all constants in the application.
 * All components, services, and other modules MUST import constants through this
 * barrel export to maintain clean architecture and prevent direct domain imports.
 *
 * ✅ CORRECT USAGE:
 * import { STORAGE_KEYS, PAYMENT_STATUS, UI_STATES } from '@constants';
 * import { EVENT_NAMES, API_ENDPOINTS } from '../../../constants';
 *
 * ❌ FORBIDDEN USAGE:
 * import { PAYMENT_STATUS } from '../apps/payment/constants/PaymentConstants';
 * import { STORAGE_KEYS } from '../platform/storage/StorageConstants';
 */

// ===== DEVELOPMENT PHASE BARREL EXPORTS =====
// During development, all constants are exported from this single hub
// no other file should be in src/app/constants aside index.ts, and all exports should be `export * from ...`