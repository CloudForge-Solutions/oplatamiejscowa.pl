// src/platform/core/EventBus.ts
// TypeScript implementation of EventBus with proper type safety
// ARCHITECTURE COMPLIANCE: Single purpose component communication events

import {logger} from '@/platform/CentralizedLogger';
import { EVENT_SCHEMAS, GLOBAL_EVENTS, LEGACY_EVENT_MAPPINGS, PLATFORM_EVENTS } from '@/constants';
import type {EventBusInstance, EventHandler} from '@/platform/types/core';

/**
 * Event subscription options
 */
interface SubscriptionOptions {
    once?: boolean;
    priority?: number;
}

/**
 * Internal subscription object
 */
interface Subscription<T = any> {
    callback: EventHandler<T>;
    once: boolean;
    priority: number;
    id: string;
}

/**
 * Event validation result
 */
interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Event history entry
 */
interface EventHistoryEntry {
    eventName: string;
    data: any;
    timestamp: number;
    subscribers: number;
}

/**
 * Subscription tracker for automatic cleanup
 */
export class SubscriptionTracker {
    private subscriptions: Array<{ eventName: string; subscriptionId: string; eventBus: EventBus }> = [];

    /**
     * Track a subscription for automatic cleanup
     */
    track(eventName: string, subscriptionId: string, eventBus: EventBus): void {
        this.subscriptions.push({ eventName, subscriptionId, eventBus });
    }

    /**
     * Clean up all tracked subscriptions
     */
    cleanup(): void {
        for (const { eventName, subscriptionId, eventBus } of this.subscriptions) {
            eventBus.off(eventName, subscriptionId);
        }
        this.subscriptions = [];
    }

    /**
     * Get count of tracked subscriptions
     */
    getCount(): number {
        return this.subscriptions.length;
    }
}

/**
 * EventBus - Type-safe event communication system
 *
 * ARCHITECTURE PRINCIPLE: Single purpose component communication
 * - Type-safe event emission and subscription
 * - Event validation with schemas
 * - Priority-based subscription ordering
 * - Event history tracking for debugging
 * - Singleton pattern for global access
 * - Memory leak detection and prevention
 */
export class EventBus implements EventBusInstance {
    private events: Map<string, Subscription[]> = new Map();
    private debugMode: boolean = true;
    private validationSchemas: Map<string, any> = new Map();
    private eventHistory: EventHistoryEntry[] = [];
    private readonly maxHistory: number = 100;

    constructor() {
        // Initialize default validation schemas
        this.initializeDefaultSchemas();
        logger.platform('📡 EventBus initialized with validation');
    }

    /**
     * Subscribe to an event with type safety
     */
    subscribe<T = any>(eventName: string, callback: EventHandler<T>): string {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const subscription: Subscription<T> = {
            callback,
            once: false,
            priority: 0,
            id: this.generateId()
        };

        const subscribers = this.events.get(eventName)!;
        subscribers.push(subscription);

        // Sort by priority (higher priority first)
        subscribers.sort((a, b) => b.priority - a.priority);

        if (this.debugMode) {
            logger.info(`📡 Subscribed to "${eventName}" (ID: ${subscription.id})`);
        }

        return subscription.id;
    }

    /**
     * Subscribe to an event (alias for subscribe)
     */
    on<T = any>(eventName: string, callback: EventHandler<T>, options: SubscriptionOptions = {}): () => void {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }

        const subscription: Subscription<T> = {
            callback,
            once: options.once || false,
            priority: options.priority || 0,
            id: this.generateId()
        };

        const subscribers = this.events.get(eventName)!;
        subscribers.push(subscription);

        // Sort by priority (higher priority first)
        subscribers.sort((a, b) => b.priority - a.priority);

        if (this.debugMode) {
            logger.info(`📡 Subscribed to "${eventName}" (ID: ${subscription.id})`);
        }

        // Return unsubscribe function
        return () => this.off(eventName, subscription.id);
    }

    /**
     * Subscribe to an event that fires only once
     */
    once<T = any>(eventName: string, callback: EventHandler<T>, options: SubscriptionOptions = {}): () => void {
        return this.on(eventName, callback, {...options, once: true});
    }

    /**
     * Unsubscribe from an event by subscription ID
     */
    unsubscribe(eventName: string, subscriptionId: string): void {
        this.off(eventName, subscriptionId);
    }

    /**
     * Unsubscribe from an event (alias for unsubscribe)
     */
    off(eventName: string, subscriptionId: string): void {
        if (!this.events.has(eventName)) {
            return;
        }

        const subscribers = this.events.get(eventName)!;
        const index = subscribers.findIndex(sub => sub.id === subscriptionId);

        if (index !== -1) {
            subscribers.splice(index, 1);
            if (this.debugMode) {
                logger.info(`📡 Unsubscribed from "${eventName}" (ID: ${subscriptionId})`);
            }
        }

        // Clean up empty event arrays
        if (subscribers.length === 0) {
            this.events.delete(eventName);
        }
    }

    /**
     * Emit an event with type safety
     */
    emit<T = any>(eventName: string, data?: T): void {
        // Validate event data
        const validation = this.validateEventData(eventName, data);
        if (!validation.valid) {
            logger.error(`📡 Event validation failed for "${eventName}": ${validation.error}`);
            return;
        }

        const subscribers = this.events.get(eventName);
        if (!subscribers || subscribers.length === 0) {
            if (this.debugMode && this.shouldLogNoSubscribers(eventName)) {
                logger.info(`📡 No subscribers for "${eventName}"`);
            }
            return;
        }

        // Add to history
        this.addToHistory(eventName, data, subscribers.length);

        if (this.debugMode) {
            logger.info(`📡 Emitting "${eventName}" to ${subscribers.length} subscriber(s)`, data);
        }

        // Execute callbacks (copy array to avoid issues with modifications during iteration)
        const subscribersCopy = [...subscribers];
        for (const subscription of subscribersCopy) {
            try {
                subscription.callback(data);

                // Remove one-time subscriptions
                if (subscription.once) {
                    this.off(eventName, subscription.id);
                }
            } catch (error) {
                logger.error(`📡 Error in event callback for "${eventName}":`, error);
            }
        }
    }

    /**
     * Register event validation schema
     */
    registerSchema(eventName: string, schema: any): void {
        this.validationSchemas.set(eventName, schema);
        if (this.debugMode) {
            logger.platform(`Event schema registered: ${eventName}`);
        }
    }

    /**
     * Get event history for debugging
     */
    getEventHistory(): EventHistoryEntry[] {
        return [...this.eventHistory];
    }

    /**
     * PERFORMANCE OPTIMIZATION: Determine if we should log "No subscribers" for an event
     * Reduces log noise by only logging for events that are expected to have subscribers
     */
    private shouldLogNoSubscribers(eventName: string): boolean {
        // Events that are expected to have no subscribers (informational/optional events)
        const optionalEvents = [
            'platform:service:ready',        // Service initialization events
            'jpk:data-updated',              // JPK data cleanup events
            'jpk:generation:started',        // JPK generation lifecycle events
            'jpk:generation:completed',      // JPK generation lifecycle events
            'jpk:auto-generation:processing', // JPK processing events
            'records:loaded',                // Record loading events
            'jpk:data:refreshed',            // JPK data refresh events
            'jpk:data-updated',              // JPK data update events
        ];

        // Don't log "No subscribers" for optional events
        if (optionalEvents.includes(eventName)) {
            return false;
        }

        // Log "No subscribers" for all other events (these might indicate missing subscriptions)
        return true;
    }

    /**
     * Clear event history
     */
    clearHistory(): void {
        this.eventHistory = [];
    }

    /**
     * Get current subscribers count for an event
     */
    getSubscriberCount(eventName: string): number {
        const subscribers = this.events.get(eventName);
        return subscribers ? subscribers.length : 0;
    }

    /**
     * Get all active event names
     */
    getActiveEvents(): string[] {
        return Array.from(this.events.keys());
    }

    /**
     * Wait for an event to be emitted (Promise-based)
     */
    waitFor<T = any>(eventName: string, timeout?: number): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            let timeoutId: NodeJS.Timeout | null = null;

            const unsubscribe = this.once(eventName, (data: T) => {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                resolve(data);
            });

            if (timeout) {
                timeoutId = setTimeout(() => {
                    unsubscribe();
                    reject(new Error(`Timeout waiting for event "${eventName}"`));
                }, timeout);
            }
        });
    }

    /**
     * Remove all subscribers for a specific event
     */
    removeAllListeners(eventName?: string): void {
        if (eventName) {
            this.events.delete(eventName);
            if (this.debugMode) {
                logger.info(`📡 Removed all listeners for "${eventName}"`);
            }
        } else {
            this.events.clear();
            if (this.debugMode) {
                logger.info('📡 Removed all event listeners');
            }
        }
    }

    /**
     * Check if an event has any subscribers
     */
    hasListeners(eventName: string): boolean {
        const subscribers = this.events.get(eventName);
        return subscribers ? subscribers.length > 0 : false;
    }

    /**
     * Get debug information about the EventBus
     */
    getDebugInfo(): {
        totalEvents: number;
        totalSubscribers: number;
        events: { [eventName: string]: number };
        historySize: number;
    } {
        const events: { [eventName: string]: number } = {};
        let totalSubscribers = 0;

        for (const [eventName, subscribers] of this.events.entries()) {
            events[eventName] = subscribers.length;
            totalSubscribers += subscribers.length;
        }

        return {
            totalEvents: this.events.size,
            totalSubscribers,
            events,
            historySize: this.eventHistory.length
        };
    }

    /**
     * Get subscription information for debugging and memory leak detection
     */
    getSubscriptionInfo(): { [eventName: string]: { count: number; subscriptions: Array<{ id: string; once: boolean; priority: number }> } } {
        const info: { [eventName: string]: { count: number; subscriptions: Array<{ id: string; once: boolean; priority: number }> } } = {};

        for (const [eventName, subscribers] of this.events.entries()) {
            info[eventName] = {
                count: subscribers.length,
                subscriptions: subscribers.map(sub => ({
                    id: sub.id,
                    once: sub.once,
                    priority: sub.priority
                }))
            };
        }

        return info;
    }

    /**
     * Get total subscription count across all events
     */
    getTotalSubscriptionCount(): number {
        let total = 0;
        for (const subscribers of this.events.values()) {
            total += subscribers.length;
        }
        return total;
    }

    /**
     * Detect potential memory leaks by finding events with excessive subscriptions
     */
    detectMemoryLeaks(threshold: number = 10): Array<{ eventName: string; count: number }> {
        const leaks: Array<{ eventName: string; count: number }> = [];

        for (const [eventName, subscribers] of this.events.entries()) {
            if (subscribers.length > threshold) {
                leaks.push({ eventName, count: subscribers.length });
            }
        }

        return leaks;
    }

    /**
     * Clean up orphaned subscriptions (subscriptions that might be leaked)
     */
    cleanupOrphanedSubscriptions(): number {
        let cleanedCount = 0;

        // Remove events with no subscribers
        for (const [eventName, subscribers] of this.events.entries()) {
            if (subscribers.length === 0) {
                this.events.delete(eventName);
                cleanedCount++;
            }
        }

        if (cleanedCount > 0) {
            logger.info(`📡 Cleaned up ${cleanedCount} orphaned event subscriptions`);
        }

        return cleanedCount;
    }

    /**
     * Create a subscription tracker for automatic cleanup
     */
    createSubscriptionTracker(): SubscriptionTracker {
        return new SubscriptionTracker();
    }

    /**
     * Subscribe with automatic tracking for cleanup
     */
    subscribeWithTracker<T = any>(eventName: string, callback: EventHandler<T>, tracker: SubscriptionTracker): string {
        const subscriptionId = this.subscribe(eventName, callback);
        tracker.track(eventName, subscriptionId, this);
        return subscriptionId;
    }

    /**
     * Destroy the EventBus and clean up all listeners
     */
    destroy(): void {
        const totalSubscriptions = this.getTotalSubscriptionCount();
        this.events.clear();
        this.validationSchemas.clear();
        this.eventHistory = [];
        logger.platform(`📡 EventBus destroyed (cleaned up ${totalSubscriptions} subscriptions)`);
    }

    /**
     * Validate event data against schema
     */
    private validateEventData(eventName: string, data: any): ValidationResult {
        const schema = this.validationSchemas.get(eventName);
        if (!schema) {
            return {valid: true}; // No schema = no validation
        }

        try {
            // Use constants instead of magic strings (Type Safety compliance)
            const entityEvents = [
                PLATFORM_EVENTS.ENTITY_CREATED,
                PLATFORM_EVENTS.ENTITY_UPDATED,
                PLATFORM_EVENTS.ENTITY_DELETED,
                PLATFORM_EVENTS.ENTITY_SELECTED
            ];

            // Entity validation
            if (entityEvents.includes(eventName)) {
                if (!data || typeof data !== 'object') {
                    return {valid: false, error: 'Entity data must be an object'};
                }

                if (
                    eventName === PLATFORM_EVENTS.ENTITY_CREATED ||
                    eventName === PLATFORM_EVENTS.ENTITY_UPDATED
                ) {
                    if (!data.id || !data.name) {
                        return {valid: false, error: 'Entity must have id and name'};
                    }
                }

                if (eventName === PLATFORM_EVENTS.ENTITY_DELETED) {
                    if (!data || (!data.id && typeof data !== 'string')) {
                        return {valid: false, error: 'Entity deletion requires id'};
                    }
                }

                if (eventName === PLATFORM_EVENTS.ENTITY_SELECTED) {
                    // ENTITY_SELECTED can have null data (entity cleared) or entity data
                    if (data && typeof data === 'object') {
                        // If data is provided, it should have the expected structure
                        if (data.entity && (!data.entity.id || !data.entity.name)) {
                            return {valid: false, error: 'Entity selection data must include entity with id and name'};
                        }
                    }
                    // Allow null/undefined data for entity clearing
                }
            }

            return {valid: true};
        } catch (error) {
            return {valid: false, error: `Validation error: ${error.message}`};
        }
    }

    /**
     * Generate unique subscription ID
     */
    private generateId(): string {
        return `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Add event to history for debugging
     */
    private addToHistory(eventName: string, data: any, subscribers: number): void {
        this.eventHistory.push({
            eventName,
            data,
            timestamp: Date.now(),
            subscribers
        });

        // Maintain history size limit
        if (this.eventHistory.length > this.maxHistory) {
            this.eventHistory.shift();
        }
    }

    /**
     * Initialize default validation schemas using constants
     */
    private initializeDefaultSchemas(): void {
        // Register schemas using constants (no magic strings)
        Object.entries(EVENT_SCHEMAS).forEach(([eventName, schema]) => {
            this.registerSchema(eventName, schema);
        });

        logger.platform('Default event validation schemas initialized with constants');
    }
}

// Create a singleton instance
export const eventBus = new EventBus();

// Export platform events for cross-micro-app communication (Single Source of Truth)
export const EVENTS = {
    // Platform events (cross-micro-app communication)
    ...PLATFORM_EVENTS,

    // Global infrastructure events
    ...GLOBAL_EVENTS,

    // Legacy mappings for backward compatibility (TODO: Remove after migration)
    ...LEGACY_EVENT_MAPPINGS
};

// Re-export platform event constants for convenience (Single Source of Truth)
export {PLATFORM_EVENTS, GLOBAL_EVENTS};
