// src/utils/performance.js
// Performance measurement utilities for entity switching

import {logger} from '@/platform/CentralizedLogger';

/**
 * Performance measurement utility for entity switching
 * Helps track if entity switching meets the "near-instantaneous (milliseconds)" requirement
 */
export class EntitySwitchPerformanceTracker {
	constructor() {
		this.measurements = new Map();
		this.thresholds = {
			excellent: 5,    // < 5ms - excellent performance
			good: 15,        // < 15ms - good performance
			acceptable: 50,  // < 50ms - acceptable performance
			poor: 100        // > 100ms - poor performance
		};
	}

	/**
	 * Start measuring entity switch performance
	 */
	startMeasurement(entityId, operation = 'switch') {
		const measurementId = `${operation}-${entityId}-${Date.now()}`;
		const startTime = performance.now();

		this.measurements.set(measurementId, {
			entityId,
			operation,
			startTime,
			endTime: null,
			duration: null,
			performance: null
		});

		logger.info('⏱️ Started entity switch measurement', {
			measurementId,
			entityId: entityId,
			operation
		});

		return measurementId;
	}

	/**
	 * End measurement and log performance
	 */
	endMeasurement(measurementId) {
		const measurement = this.measurements.get(measurementId);
		if (!measurement) {
			logger.warn('⚠️ Measurement not found', {measurementId});
			return null;
		}

		const endTime = performance.now();
		const duration = endTime - measurement.startTime;

		// Determine performance level
		let performanceLevel;
		if (duration < this.thresholds.excellent) {
			performanceLevel = 'EXCELLENT';
		} else if (duration < this.thresholds.good) {
			performanceLevel = 'GOOD';
		} else if (duration < this.thresholds.acceptable) {
			performanceLevel = 'ACCEPTABLE';
		} else {
			performanceLevel = 'POOR';
		}

		measurement.endTime = endTime;
		measurement.duration = duration;
		measurement.performance = performanceLevel;

		// Log performance result
		const logLevel = performanceLevel === 'POOR' ? 'warn' : 'info';
		logger.info(`⏱️ Entity switch completed - ${performanceLevel}`, {
			measurementId,
			entityId: measurement.entityId?.slice(0, 8),
			operation: measurement.operation,
			duration: `${duration.toFixed(2)}ms`,
			performance: performanceLevel,
			meetsRequirement: duration < this.thresholds.good
		}, logLevel);

		return measurement;
	}

	/**
	 * Get performance statistics
	 */
	getStatistics() {
		const measurements = Array.from(this.measurements.values())
			.filter(m => m.duration !== null);

		if (measurements.length === 0) {
			return null;
		}

		const durations = measurements.map(m => m.duration);
		const performanceLevels = measurements.reduce((acc, m) => {
			acc[m.performance] = (acc[m.performance] || 0) + 1;
			return acc;
		}, {});

		return {
			totalMeasurements: measurements.length,
			averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
			minDuration: Math.min(...durations),
			maxDuration: Math.max(...durations),
			performanceLevels,
			meetsRequirement: durations.every(d => d < this.thresholds.good)
		};
	}

	/**
	 * Clear old measurements to prevent memory leaks
	 */
	cleanup(maxAge = 300000) { // 5 minutes
		const now = Date.now();
		for (const [id, measurement] of this.measurements.entries()) {
			if (now - measurement.startTime > maxAge) {
				this.measurements.delete(id);
			}
		}
	}
}

// Global instance for easy access
export const entitySwitchTracker = new EntitySwitchPerformanceTracker();

/**
 * Decorator function to measure entity switch performance
 */
export function measureEntitySwitch(target, propertyKey, descriptor) {
	const originalMethod = descriptor.value;

	descriptor.value = async function (...args) {
		const entityId = args[0]; // Assume first argument is entity ID
		const measurementId = entitySwitchTracker.startMeasurement(entityId, propertyKey);

		try {
			const result = await originalMethod.apply(this, args);
			entitySwitchTracker.endMeasurement(measurementId);
			return result;
		} catch (error) {
			entitySwitchTracker.endMeasurement(measurementId);
			throw error;
		}
	};

	return descriptor;
}

/**
 * Simple performance measurement wrapper
 */
export async function measurePerformance(operation, asyncFunction) {
	const startTime = performance.now();

	try {
		const result = await asyncFunction();
		const endTime = performance.now();
		const duration = endTime - startTime;

		logger.info(`⏱️ ${operation} completed`, {
			duration: `${duration.toFixed(2)}ms`,
			operation
		});

		return result;
	} catch (error) {
		const endTime = performance.now();
		const duration = endTime - startTime;

		logger.info(`⏱️ ${operation} failed`, {
			duration: `${duration.toFixed(2)}ms`,
			operation,
			error: error.message
		});

		throw error;
	}
}
