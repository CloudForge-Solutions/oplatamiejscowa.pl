/**
 * React Hook for EventBus with automatic subscription cleanup
 * ARCHITECTURE COMPLIANCE: Memory leak prevention for React components
 */

import { useEffect, useRef } from 'react';
import { useServices } from '@/shell/context/ServiceContext';
import { SubscriptionTracker } from '@/platform/EventBus';
import type { EventBusInstance, EventHandler } from '@/platform/types/core';

/**
 * Hook for managing EventBus subscriptions with automatic cleanup
 * Prevents memory leaks by automatically unsubscribing when component unmounts
 */
export function useEventBus() {
    const { getService } = useServices();
    const trackerRef = useRef<SubscriptionTracker | null>(null);
    const eventBusRef = useRef<EventBusInstance | null>(null);

    // Initialize EventBus and tracker
    useEffect(() => {
        const eventBus = getService('EventBus');
        if (eventBus) {
            eventBusRef.current = eventBus;
            trackerRef.current = eventBus.createSubscriptionTracker();
        }

        // Cleanup on unmount
        return () => {
            if (trackerRef.current) {
                trackerRef.current.cleanup();
            }
        };
    }, [getService]);

    /**
     * Subscribe to an event with automatic cleanup
     */
    const subscribe = <T = any>(eventName: string, callback: EventHandler<T>): string | null => {
        if (!eventBusRef.current || !trackerRef.current) {
            console.warn('EventBus not available for subscription');
            return null;
        }

        return eventBusRef.current.subscribeWithTracker(eventName, callback, trackerRef.current);
    };

    /**
     * Subscribe to an event that fires only once
     */
    const subscribeOnce = <T = any>(eventName: string, callback: EventHandler<T>): (() => void) | null => {
        if (!eventBusRef.current) {
            console.warn('EventBus not available for subscription');
            return null;
        }

        return eventBusRef.current.once(eventName, callback);
    };

    /**
     * Emit an event
     */
    const emit = <T = any>(eventName: string, data?: T): void => {
        if (!eventBusRef.current) {
            console.warn('EventBus not available for emission');
            return;
        }

        eventBusRef.current.emit(eventName, data);
    };

    /**
     * Manually unsubscribe from an event
     */
    const unsubscribe = (eventName: string, subscriptionId: string): void => {
        if (!eventBusRef.current) {
            console.warn('EventBus not available for unsubscription');
            return;
        }

        eventBusRef.current.off(eventName, subscriptionId);
    };

    /**
     * Get subscription count for debugging
     */
    const getSubscriptionCount = (): number => {
        return trackerRef.current?.getCount() || 0;
    };

    return {
        subscribe,
        subscribeOnce,
        emit,
        unsubscribe,
        getSubscriptionCount,
        eventBus: eventBusRef.current
    };
}

/**
 * Hook for subscribing to a specific event with automatic cleanup
 */
export function useEventSubscription<T = any>(
    eventName: string,
    callback: EventHandler<T>,
    dependencies: any[] = []
) {
    const { subscribe } = useEventBus();

    useEffect(() => {
        if (!eventName || !callback) return;

        const subscriptionId = subscribe(eventName, callback);

        // Return cleanup function (though useEventBus already handles cleanup)
        return () => {
            // Cleanup is handled automatically by useEventBus
        };
    }, [eventName, subscribe, ...dependencies]);
}

/**
 * Hook for emitting events
 */
export function useEventEmitter() {
    const { emit } = useEventBus();
    return emit;
}
