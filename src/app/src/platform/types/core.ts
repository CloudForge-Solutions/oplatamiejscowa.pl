// src/types/core.ts - Core TypeScript type definitions
// GRADUAL MIGRATION: Start with essential types for storage and entity management

/**
 * CORE ENTITY TYPES
 */
export interface Entity {
  id: string;
  name: string;
  displayName?: string;
  type?: string;
  nip?: string;
  regon?: string;
  krs?: string;
  address?: EntityAddress;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface EntityAddress {
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

/**
 * STORAGE TYPES
 */
export type StorageKey = string;
export type EntityId = string;
export type StorageValue = any; // Will be refined in later phases

export interface StorageContainer {
  [key: string]: StorageValue;
}

export interface EntityStorageContainer {
  [entityId: string]: StorageContainer;
}

/**
 * STORAGE OPERATIONS
 */
export interface StorageOperationResult {
  success: boolean;
  error?: string;
  data?: StorageValue;
}

export interface MigrationResult {
  malformedKeysRemoved: number;
  validKeysPreserved: number;
  malformedKeys: string[];
}

/**
 * CONTEXT TYPES
 */
export interface EntityContextValue {
  currentEntity: Entity | null;
  entityData: EntityData;
  loading: boolean;
  error: string | null;
  initialized: boolean;
  switchEntity: (entityId: string) => Promise<void>;
  getEntityData: (key: string) => any;
  isEntityLoaded: () => boolean;
  hasEntityData: (key: string) => boolean;
  invalidateEntitiesCache: () => void;
  getEntityDisplayName: () => string;
  getEntityName: () => string;
  getEntityId: () => string | undefined;
  refreshEntityData: () => void;
  clearEntity: () => Promise<void>;
}

export interface EntityData {
  jpkConfig?: any;
  bankAccounts?: any[];
  recordsCache?: Record<string, any>;
  [key: string]: any;
}

/**
 * EVENT SYSTEM TYPES
 */
export interface EventBusEvent {
  type: string;
  data?: any;
  timestamp?: string;
  source?: string;
}

export interface EventHandler<T = any> {
  (data: T): void;
}

export interface EventBusInterface {
  emit<T>(event: string, data?: T): void;
  on<T>(event: string, handler: EventHandler<T>): () => void;
  off(event: string, handler: EventHandler): void;
}

/**
 * LOGGER TYPES
 */
export interface LoggerInterface {
  info(message: string, data?: any): void;
  warn(message: string, data?: any): void;
  error(message: string, data?: any): void;
  platform(message: string, data?: any): void;
  jpk(message: string, data?: any): void;
}

/**
 * UTILITY TYPES
 */
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncResult<T> = Promise<T>;

/**
 * VALIDATION TYPES
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

/**
 * CACHE TYPES
 */
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface EntityCache {
  entities: Entity[];
  timestamp: number;
}

export interface CacheManager<T> {
  get(key: string): T | null;
  set(key: string, value: T, ttl?: number): void;
  invalidate(key: string): void;
  clear(): void;
  isValid(key: string): boolean;
}

/**
 * EVENT BUS INSTANCE TYPES
 */
export interface EventBusInstance {
  subscribe(eventName: string, callback: (data?: any) => void): string;
  unsubscribe(eventName: string, subscriptionId: string): void;
  emit(eventName: string, data?: any): void;
}

/**
 * LANGUAGE CONTEXT TYPES
 */
export interface LanguageContextValue {
  currentLanguage: string;
  availableLanguages: string[];
  switchLanguage: (language: string) => Promise<void>;
  t: (key: string, options?: any) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string, format?: string) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatPercent: (value: number, decimals?: number) => string;
  getLanguageName: (langCode?: string) => string;
  getLanguageFlag: (langCode?: string) => string;
}

/**
 * SERVICE CONTEXT TYPES
 */
export interface ServiceContextValue {
  servicesManager: any; // ServicesManager instance
  getService: (serviceName: string) => any;
  isServiceAvailable: (serviceName: string) => boolean;
  getServices: (serviceNames: string[]) => Record<string, any>;
}

/**
 * REACT COMPONENT TYPES
 */
export interface ProviderProps {
  children: React.ReactNode;
}
