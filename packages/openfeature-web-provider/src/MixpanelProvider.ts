import type {
  EvaluationContext,
  Provider,
  ResolutionDetails,
  Logger,
  ProviderMetadata,
  JsonValue,
} from '@openfeature/web-sdk';
import { ErrorCode } from '@openfeature/web-sdk';
import mixpanel from 'mixpanel-browser';
import type { Config, Mixpanel } from 'mixpanel-browser';
import {
  FlagsManager,
  FlagsVariant,
  isBoolean,
  isString,
  isNumber,
  createResolutionDetails,
  createErrorResolutionDetails,
} from './types';

let _instanceCount = 0;

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
 * // Initialize Mixpanel with flags and context
 * mixpanel.init('TOKEN', {
 *   flags: {
 *     context: { plan: 'premium' }
 *   }
 * });
 *
 * // Register provider with flags manager
 * await OpenFeature.setProviderAndWait(new MixpanelProvider(mixpanel.flags));
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

  private readonly flags: FlagsManager;

  /**
   * The underlying Mixpanel instance, set when using the static `create` method.
   * Users need this to call `identify()` and `track()` on the underlying instance.
   */
  mixpanel?: Mixpanel;

  /**
   * Creates a MixpanelProvider by initializing a new Mixpanel instance internally.
   *
   * @param token - Your Mixpanel project token
   * @param config - Optional Mixpanel configuration options
   * @returns A MixpanelProvider with an initialized Mixpanel instance
   */
  static create(token: string, config?: Partial<Config>): MixpanelProvider {
    const instanceName = `openfeature_${_instanceCount++}`;
    const instance = mixpanel.init(token, config || {}, instanceName);
    const flagsManager = (instance as any).flags as FlagsManager;
    const provider = new MixpanelProvider(flagsManager);
    provider.mixpanel = instance;
    return provider;
  }

  /**
   * Creates a new MixpanelProvider instance.
   *
   * @param flagsManager - The Mixpanel FlagsManager instance
   */
  constructor(flagsManager: FlagsManager) {
    if (!flagsManager) {
      throw new Error('FlagsManager is required');
    }
    // Validate required methods
    if (typeof flagsManager.are_flags_ready !== 'function' ||
        typeof flagsManager.get_variant_sync !== 'function' ||
        typeof flagsManager.update_context !== 'function' ||
        typeof flagsManager.when_ready !== 'function') {
      throw new Error('Invalid FlagsManager: missing required methods');
    }
    this.flags = flagsManager;
  }

  /**
   * Initialize the provider by waiting for Mixpanel's flags to be fetched.
   */
  async initialize(context?: EvaluationContext): Promise<void> {
    // If context is provided, update Mixpanel's flag context
    if (context && Object.keys(context).length > 0) {
      await this.flags.update_context(context, { replace: true });
    }

    // Wait for the initial fetch to complete
    await this.flags.when_ready();
  }

  /**
   * Handle context changes by updating Mixpanel's flag context.
   */
  async onContextChange(
    oldContext: EvaluationContext,
    newContext: EvaluationContext
  ): Promise<void> {
    // Pass the new context directly to Mixpanel (replace mode)
    await this.flags.update_context(newContext, { replace: true });
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
    try {
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
    } catch (e) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.GENERAL,
        e instanceof Error ? e.message : String(e)
      );
    }
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
    try {
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
    } catch (e) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.GENERAL,
        e instanceof Error ? e.message : String(e)
      );
    }
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
    try {
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
    } catch (e) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.GENERAL,
        e instanceof Error ? e.message : String(e)
      );
    }
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
    try {
      const result = this.resolveFlag(flagKey, defaultValue);
      if (result.errorCode) {
        return result as ResolutionDetails<T>;
      }

      return createResolutionDetails(result.value as T, result.variant);
    } catch (e) {
      return createErrorResolutionDetails(
        defaultValue,
        ErrorCode.GENERAL,
        e instanceof Error ? e.message : String(e)
      );
    }
  }

  /**
   * Internal method to resolve a flag value from Mixpanel.
   */
  private resolveFlag<T>(
    flagKey: string,
    defaultValue: T
  ): ResolutionDetails<any> {
    // Check if flags are ready
    if (!this.flags.are_flags_ready()) {
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
    const variant = this.flags.get_variant_sync(flagKey, fallbackVariant);

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
