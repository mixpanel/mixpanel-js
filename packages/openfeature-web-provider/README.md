# @mixpanel/openfeature-web-provider

[![npm version](https://img.shields.io/npm/v/@mixpanel/openfeature-web-provider.svg)](https://www.npmjs.com/package/@mixpanel/openfeature-web-provider)
[![OpenFeature](https://img.shields.io/badge/OpenFeature-compatible-green)](https://openfeature.dev/)
[![License](https://img.shields.io/npm/l/@mixpanel/openfeature-web-provider.svg)](https://github.com/mixpanel/mixpanel-js/blob/master/LICENSE)

An [OpenFeature](https://openfeature.dev/) provider that wraps Mixpanel's feature flags for use with the OpenFeature Web SDK. This allows you to use Mixpanel's feature flagging capabilities through OpenFeature's standardized, vendor-agnostic API.

## Overview

This package provides a bridge between Mixpanel's native feature flags implementation and the OpenFeature specification. By using this provider, you can:

- Leverage Mixpanel's powerful feature flag and experimentation platform
- Use OpenFeature's standardized API for flag evaluation
- Easily switch between feature flag providers without changing your application code
- Integrate with OpenFeature's ecosystem of tools and frameworks

## Installation

```bash
npm install @mixpanel/openfeature-web-provider @openfeature/web-sdk mixpanel-browser
```

Or with yarn:

```bash
yarn add @mixpanel/openfeature-web-provider @openfeature/web-sdk mixpanel-browser
```

## Quick Start

```typescript
import mixpanel from 'mixpanel-browser';
import { OpenFeature } from '@openfeature/web-sdk';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

// 1. Initialize Mixpanel with feature flags and context
mixpanel.init('YOUR_PROJECT_TOKEN', {
  flags: {
    context: { plan: 'premium' }
  }
});

// 2. Create and register the Mixpanel provider
const provider = new MixpanelProvider(mixpanel.flags);
await OpenFeature.setProviderAndWait(provider);

// 3. Get a client and evaluate flags
const client = OpenFeature.getClient();
const showNewFeature = client.getBooleanValue('new-feature-flag', false);

if (showNewFeature) {
  console.log('New feature is enabled!');
}
```

## Usage Examples

### Basic Boolean Flag

```typescript
const client = OpenFeature.getClient();

// Get a boolean flag with a default value
const isFeatureEnabled = client.getBooleanValue('my-feature', false);

if (isFeatureEnabled) {
  // Show the new feature
}
```

### Mixpanel Flag Types and OpenFeature Evaluation Methods

Mixpanel feature flags support three flag types. Use the corresponding OpenFeature evaluation method based on your flag's variant values:

| Mixpanel Flag Type | Variant Values | OpenFeature Method |
|---|---|---|
| Feature Gate | `true` / `false` | `getBooleanValue()` |
| Experiment | boolean, string, number, or JSON object | `getBooleanValue()`, `getStringValue()`, `getNumberValue()`, or `getObjectValue()` |
| Dynamic Config | JSON object | `getObjectValue()` |

```typescript
const client = OpenFeature.getClient();

// Feature Gate — boolean variants
const isFeatureOn = client.getBooleanValue('new-checkout', false);

// Experiment with string variants
const buttonColor = client.getStringValue('button-color-test', 'blue');

// Experiment with number variants
const maxItems = client.getNumberValue('max-items', 10);

// Dynamic Config — JSON object variants
const featureConfig = client.getObjectValue('homepage-layout', {
  layout: 'grid',
  itemsPerRow: 3
});
```

### Getting Full Resolution Details

If you need additional metadata about the flag evaluation:

```typescript
const client = OpenFeature.getClient();

const details = client.getBooleanDetails('my-feature', false);

console.log(details.value);       // The resolved value
console.log(details.variant);     // The variant key from Mixpanel
console.log(details.reason);      // Why this value was returned
console.log(details.errorCode);   // Error code if evaluation failed
```

### Setting Context

You can pass evaluation context that will be sent to Mixpanel for flag evaluation using `OpenFeature.setContext()`:

```typescript
await OpenFeature.setContext({
  email: 'user@example.com',
  plan: 'premium'
});
```

> **Note:** Per-evaluation context (the optional third argument to `getBooleanValue`, `getStringValue`, etc.) is **not supported** by this provider. Context must be set globally via `OpenFeature.setContext()`, which triggers a re-fetch of flag values from Mixpanel.

### Using custom_properties for Runtime Properties

You can pass `custom_properties` in the evaluation context for use with Mixpanel's [Runtime Properties](https://docs.mixpanel.com/docs/feature-flags/runtime-properties) targeting rules. Values must be flat key-value pairs (no nested objects):

```typescript
await OpenFeature.setContext({
  custom_properties: {
    tier: 'enterprise',
    seats: 50,
    industry: 'technology'
  }
});
```

### React Integration

Using OpenFeature with React via the `@openfeature/react-sdk`:

```tsx
import { OpenFeatureProvider, useBooleanFlagValue } from '@openfeature/react-sdk';
import { OpenFeature } from '@openfeature/web-sdk';
import mixpanel from 'mixpanel-browser';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

// Initialize outside of component
mixpanel.init('YOUR_PROJECT_TOKEN', {
  flags: {
    context: { plan: 'premium' }
  }
});
const provider = new MixpanelProvider(mixpanel.flags);
OpenFeature.setProvider(provider);

function App() {
  return (
    <OpenFeatureProvider>
      <MyComponent />
    </OpenFeatureProvider>
  );
}

function MyComponent() {
  // Use the hook to get flag values reactively
  const showBanner = useBooleanFlagValue('show-banner', false);

  return (
    <div>
      {showBanner && <Banner message="Welcome to our new feature!" />}
    </div>
  );
}
```

## Context Mapping

Understanding how OpenFeature context maps to Mixpanel:

### All Properties Passed Directly

All properties in the OpenFeature `EvaluationContext` are passed directly to Mixpanel's feature flag evaluation. There is no transformation or filtering of properties.

```typescript
// This OpenFeature context...
await OpenFeature.setContext({
  targetingKey: 'user-123',
  email: 'user@example.com',
  plan: 'premium',
  beta_tester: true
});

// ...is passed to Mixpanel as-is for flag evaluation
```

### targetingKey is Not Special

Unlike some feature flag providers, `targetingKey` is **not** used as a special bucketing key in Mixpanel. It is simply passed as another context property. Mixpanel's server-side configuration determines which properties are used for:

- **Targeting rules**: Which users see which variants
- **Bucketing**: How users are consistently assigned to variants

### User Identity is Managed Separately

**Important**: This provider does **not** call `mixpanel.identify()`. User identity should be managed separately through your normal Mixpanel integration:

```typescript
// Manage identity through Mixpanel directly
mixpanel.identify('user-123');

// The provider will use Mixpanel's current distinct_id automatically
const client = OpenFeature.getClient();
const value = client.getBooleanValue('my-flag', false);
```

## API Reference

### MixpanelProvider

The main provider class that implements the OpenFeature `Provider` interface.

#### Constructor

```typescript
constructor(flagsManager: FlagsManager)
```

**Parameters:**

- `flagsManager`: The Mixpanel FlagsManager instance (accessed via `mixpanel.flags`)

**Note:** Pass `mixpanel.flags` (the FlagsManager) to the provider, not the entire mixpanel instance. This reduces coupling and makes the provider only depend on the flags interface.

#### Properties

| Property | Type | Description |
|----------|------|-------------|
| `metadata` | `{ name: string }` | Provider metadata with the name "mixpanel-provider" |
| `runsOn` | `'client'` | Indicates this is a client-side provider |

#### Methods

| Method | Description |
|--------|-------------|
| `initialize(context?)` | Called when the provider is registered. Waits for Mixpanel flags to be ready. |
| `onClose()` | Called when the provider is shut down. |
| `resolveBooleanEvaluation(flagKey, defaultValue, context, logger)` | Evaluates a boolean flag |
| `resolveStringEvaluation(flagKey, defaultValue, context, logger)` | Evaluates a string flag |
| `resolveNumberEvaluation(flagKey, defaultValue, context, logger)` | Evaluates a number flag |
| `resolveObjectEvaluation(flagKey, defaultValue, context, logger)` | Evaluates an object flag |

## Error Handling

The provider uses OpenFeature's standard error codes to indicate issues during flag evaluation:

### PROVIDER_NOT_READY

Returned when flags are evaluated before the provider has finished initializing.

```typescript
// To avoid this error, use setProviderAndWait
await OpenFeature.setProviderAndWait(provider);

// Or listen for the READY event
OpenFeature.addHandler(ProviderEvents.Ready, () => {
  // Now safe to evaluate flags
});
```

### FLAG_NOT_FOUND

Returned when the requested flag does not exist in Mixpanel.

```typescript
const details = client.getBooleanDetails('nonexistent-flag', false);

if (details.errorCode === 'FLAG_NOT_FOUND') {
  console.log('Flag does not exist, using default value');
}
```

### TYPE_MISMATCH

Returned when the flag value type does not match the requested type.

```typescript
// If 'my-flag' is configured as a string in Mixpanel...
const details = client.getBooleanDetails('my-flag', false);

if (details.errorCode === 'TYPE_MISMATCH') {
  console.log('Flag is not a boolean, using default value');
}
```

## Troubleshooting

### Flags Always Return Default Values

**Possible causes:**

1. **Feature flags not enabled**: Ensure you initialized Mixpanel with `flags` enabled:
   ```typescript
   mixpanel.init('YOUR_TOKEN', { flags: { context: { plan: 'premium' } } });
   ```

2. **Provider not ready**: Make sure to wait for the provider to initialize:
   ```typescript
   await OpenFeature.setProviderAndWait(provider);
   ```

3. **Network issues**: Check the browser console for failed requests to Mixpanel's flags API.

4. **Flag not configured**: Verify the flag exists in your Mixpanel project and is enabled.

### Type Mismatch Errors

If you are getting `TYPE_MISMATCH` errors:

1. **Check flag configuration**: Verify the flag's value type in Mixpanel matches how you are evaluating it:
   ```typescript
   // If flag value is a string like "true", use getStringValue, not getBooleanValue
   const value = client.getStringValue('my-flag', 'default');
   ```

2. **Use getObjectValue for complex types**: For JSON objects or arrays, use `getObjectValue`.

### Exposure Events Not Tracking

If `$experiment_started` events are not appearing in Mixpanel:

1. **Verify Mixpanel tracking is working**: Test that other Mixpanel events are being tracked successfully.

2. **Check for duplicate evaluations**: Mixpanel only tracks the first exposure per flag per session to avoid duplicate events.

### Flags Not Updating After Context Change

When you update the OpenFeature context, the provider needs to fetch new flag values:

```typescript
// Update context and wait for new flags
await OpenFeature.setContext({ plan: 'premium' });

// Now evaluate with new context
const value = client.getBooleanValue('premium-feature', false);
```

If flags still are not updating, check that your targeting rules in Mixpanel are configured to use the context properties you are setting.

## License

Apache-2.0
