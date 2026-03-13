import type {
  EvaluationContext,
  ResolutionDetails,
  ErrorCode,
  Logger,
} from '@openfeature/web-sdk';

/**
 * Mixpanel FlagsVariant structure
 */
export interface FlagsVariant {
  key: string;
  value: any;
  experiment_id?: string;
  is_experiment_active?: boolean;
  is_qa_tester?: boolean;
}

/**
 * Minimal interface for Mixpanel's FlagsManager
 */
export interface FlagsManager {
  are_flags_ready(): boolean;
  get_variant_sync(featureName: string, fallback: FlagsVariant): FlagsVariant;
  update_context(context: Record<string, any>, options?: { replace?: boolean }): Promise<void>;
  fetchPromise?: Promise<void>;
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
    reason: 'STATIC',
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
