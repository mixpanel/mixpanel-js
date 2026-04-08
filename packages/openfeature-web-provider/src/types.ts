import type {
  ResolutionDetails,
  ErrorCode,
} from '@openfeature/web-sdk';
import type { FlagsManager as MixpanelFlagsManager } from 'mixpanel-browser';

/**
 * Extended FlagsManager interface that includes when_ready().
 * TODO: Remove this once mixpanel-browser exports when_ready() in its type definitions,
 * and re-export FlagsManager directly from mixpanel-browser.
 */
export interface FlagsManager extends MixpanelFlagsManager {
  when_ready(): Promise<void>;
}

/**
 * Type guard to check if a value is a boolean
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if a value is a string
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if a value is a number
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

/**
 * Type guard to check if a value is an object (non-null)
 */
export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Helper to create a successful ResolutionDetails
 */
export function createResolutionDetails<T>(
  value: T,
  variant?: string
): ResolutionDetails<T> {
  return {
    value,
    variant,
    reason: 'TARGETING_MATCH',
  };
}

/**
 * Helper to create an error ResolutionDetails
 */
export function createErrorResolutionDetails<T>(
  defaultValue: T,
  errorCode: ErrorCode,
  errorMessage?: string
): ResolutionDetails<T> {
  return {
    value: defaultValue,
    errorCode,
    errorMessage,
    reason: 'ERROR',
  };
}
