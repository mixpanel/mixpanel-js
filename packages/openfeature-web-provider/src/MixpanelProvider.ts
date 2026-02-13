import type {
  EvaluationContext,
  Provider,
  ResolutionDetails,
  Logger,
  ProviderMetadata,
  JsonValue,
} from '@openfeature/web-sdk';
import { ErrorCode } from '@openfeature/web-sdk';
import {
  MixpanelInstance,
  FlagsVariant,
  isBoolean,
  isString,
  isNumber,
  isObject,
  createResolutionDetails,
  createErrorResolutionDetails,
} from './types';

/**
 * OpenFeature Web Provider for Mixpanel feature flags.
 *
 * This provider wraps the Mixpanel SDK's feature flags, allowing users
 * to use the standardized OpenFeature API with Mixpanel as the backend.
 *
 * @example
 * ```typescript
 * import mixpanel from 'mixpanel-browser';
 * import { OpenFeature } from '@openfeature/web-sdk';
 * import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';
 *
 * // Initialize Mixpanel with flags
 * mixpanel.init('TOKEN', { flags: true });
 *
 * // Register provider
 * await OpenFeature.setProviderAndWait(new MixpanelProvider(mixpanel));
 *
 * // Use flags
 * const client = OpenFeature.getClient();
 * const showNewUI = client.getBooleanValue('new-ui', false);
 * ```
 */
export class MixpanelProvider implements Provider {
  readonly metadata: ProviderMetadata = {
    name: 'mixpanel-provider',
  };

  readonly runsOn = 'client' as const;

  private readonly mixpanel: MixpanelInstance;

  /**
   * Creates a new MixpanelProvider instance.
   *
   * @param mixpanel - The Mixpanel instance (must have flags enabled)
   */
  constructor(mixpanel: MixpanelInstance) {
    if (!mixpanel?.flags) {
      throw new Error('Invalid mixpanel instance: flags property is required');
    }
    this.mixpanel = mixpanel;
  }

  /**
   * Initialize the provider by waiting for Mixpanel's flags to be fetched.
   */
  async initialize(context?: EvaluationContext): Promise<void> {
    // If context is provided, update Mixpanel's flag context
    if (context && Object.keys(context).length > 0) {
      await this.mixpanel.flags.update_context(context, { replace: true });
    }

    // Wait for the initial fetch to complete
    if (this.mixpanel.flags.fetchPromise) {
      await this.mixpanel.flags.fetchPromise;
    }
  }

  /**
   * Handle context changes by updating Mixpanel's flag context.
   */
  async onContextChange(
    oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    // Pass the new context directly to Mixpanel (replace mode)
    await this.mixpanel.flags.update_context(newContext, { replace: true });
  }

  /**
   * Clean up when the provider is closed.
   */
  async onClose(): Promise<void> {
    // No cleanup needed - Mixpanel SDK manages its own lifecycle
  }

  /**
   * Resolve a boolean flag value.
   */
  resolveBooleanEvaluation(
    flagKey: string,
    defaultValue: boolean,
    _context: EvaluationContext,
    _logger: Logger
  ): ResolutionDetails<boolean> {
    const result = this.resolveFlag(flagKey, defaultValue);
    if (result.errorCode) {
      return result as ResolutionDetails<boolean>;
    }

    const value = result.value;
    if (!isBoolean(value)) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.TYPE_MISMATCH,
        `Flag "${flagKey}" value is not a boolean: ${typeof value}`
      );
    }

    return createResolutionDetails(value, result.variant);
  }

  /**
   * Resolve a string flag value.
   */
  resolveStringEvaluation(
    flagKey: string,
    defaultValue: string,
    _context: EvaluationContext,
    _logger: Logger
  ): ResolutionDetails<string> {
    const result = this.resolveFlag(flagKey, defaultValue);
    if (result.errorCode) {
      return result as ResolutionDetails<string>;
    }

    const value = result.value;
    if (!isString(value)) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.TYPE_MISMATCH,
        `Flag "${flagKey}" value is not a string: ${typeof value}`
      );
    }

    return createResolutionDetails(value, result.variant);
  }

  /**
   * Resolve a number flag value.
   */
  resolveNumberEvaluation(
    flagKey: string,
    defaultValue: number,
    _context: EvaluationContext,
    _logger: Logger
  ): ResolutionDetails<number> {
    const result = this.resolveFlag(flagKey, defaultValue);
    if (result.errorCode) {
      return result as ResolutionDetails<number>;
    }

    const value = result.value;
    if (!isNumber(value)) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.TYPE_MISMATCH,
        `Flag "${flagKey}" value is not a number: ${typeof value}`
      );
    }

    return createResolutionDetails(value, result.variant);
  }

  /**
   * Resolve an object flag value.
   */
  resolveObjectEvaluation<T extends JsonValue>(
    flagKey: string,
    defaultValue: T,
    _context: EvaluationContext,
    _logger: Logger
  ): ResolutionDetails<T> {
    const result = this.resolveFlag(flagKey, defaultValue);
    if (result.errorCode) {
      return result as ResolutionDetails<T>;
    }

    const value = result.value;
    if (!isObject(value)) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.TYPE_MISMATCH,
        `Flag "${flagKey}" value is not an object: ${typeof value}`
      );
    }

    return createResolutionDetails(value as T, result.variant);
  }

  /**
   * Internal method to resolve a flag value from Mixpanel.
   */
  private resolveFlag<T>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<any> & { variant?: string } {
    // Check if flags are ready
    if (!this.mixpanel.flags.are_flags_ready()) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.PROVIDER_NOT_READY,
        'Mixpanel flags have not been loaded yet'
      );
    }

    // Create a fallback variant to detect if flag wasn't found
    const fallbackVariant: FlagsVariant = {
      key: flagKey,
      value: defaultValue,
    };

    // Use get_variant_sync which triggers exposure tracking
    const variant = this.mixpanel.flags.get_variant_sync(flagKey, fallbackVariant);

    // Check if we got our fallback back (flag not found)
    if (variant === fallbackVariant) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.FLAG_NOT_FOUND,
        `Flag "${flagKey}" not found`
      );
    }

    return {
      value: variant.value,
      variant: variant.key,
      reason: 'STATIC',
    };
  }
}
