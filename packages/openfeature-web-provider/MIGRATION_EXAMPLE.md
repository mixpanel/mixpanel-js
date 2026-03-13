# Migration Example: Old API → New API

This document shows side-by-side examples of migrating from the old API to the new API.

## The Change

The provider now accepts **only** the FlagsManager interface instead of the entire Mixpanel instance. This reduces coupling and makes the provider depend only on what it actually needs.

---

## Example 1: Basic Setup

### Before ❌
```typescript
import mixpanel from 'mixpanel-browser';
import { OpenFeature } from '@openfeature/web-sdk';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

// Initialize Mixpanel
mixpanel.init('YOUR_TOKEN', { flags: true });

// OLD API: Pass entire mixpanel instance
const provider = new MixpanelProvider(mixpanel);
await OpenFeature.setProviderAndWait(provider);

// Use flags
const client = OpenFeature.getClient();
const enabled = client.getBooleanValue('feature-flag', false);
```

### After ✅
```typescript
import mixpanel from 'mixpanel-browser';
import { OpenFeature } from '@openfeature/web-sdk';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

// Initialize Mixpanel
mixpanel.init('YOUR_TOKEN', { flags: true });

// NEW API: Pass only flags manager
const provider = new MixpanelProvider(mixpanel.flags);
await OpenFeature.setProviderAndWait(provider);

// Use flags (no change)
const client = OpenFeature.getClient();
const enabled = client.getBooleanValue('feature-flag', false);
```

**Change:** `mixpanel` → `mixpanel.flags`

---

## Example 2: React Integration

### Before ❌
```tsx
import React, { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import { OpenFeature } from '@openfeature/web-sdk';
import { OpenFeatureProvider, useBooleanFlagValue } from '@openfeature/react-sdk';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

function App() {
  useEffect(() => {
    // Initialize
    mixpanel.init('YOUR_TOKEN', { flags: true });

    // OLD API
    const provider = new MixpanelProvider(mixpanel);
    OpenFeature.setProvider(provider);
  }, []);

  return (
    <OpenFeatureProvider>
      <MyFeature />
    </OpenFeatureProvider>
  );
}

function MyFeature() {
  const showBanner = useBooleanFlagValue('show-banner', false);
  return showBanner ? <Banner /> : null;
}
```

### After ✅
```tsx
import React, { useEffect } from 'react';
import mixpanel from 'mixpanel-browser';
import { OpenFeature } from '@openfeature/web-sdk';
import { OpenFeatureProvider, useBooleanFlagValue } from '@openfeature/react-sdk';
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';

function App() {
  useEffect(() => {
    // Initialize
    mixpanel.init('YOUR_TOKEN', { flags: true });

    // NEW API: Pass mixpanel.flags
    const provider = new MixpanelProvider(mixpanel.flags);
    OpenFeature.setProvider(provider);
  }, []);

  return (
    <OpenFeatureProvider>
      <MyFeature />
    </OpenFeatureProvider>
  );
}

function MyFeature() {
  const showBanner = useBooleanFlagValue('show-banner', false);
  return showBanner ? <Banner /> : null;
}
```

**Change:** `new MixpanelProvider(mixpanel)` → `new MixpanelProvider(mixpanel.flags)`

---

## Example 3: TypeScript with Explicit Types

### Before ❌
```typescript
import mixpanel from 'mixpanel-browser';
import type { Provider } from '@openfeature/web-sdk';
import { MixpanelProvider, MixpanelInstance } from '@mixpanel/openfeature-web-provider';

function createProvider(mp: MixpanelInstance): Provider {
  return new MixpanelProvider(mp);
}

// Usage
mixpanel.init('TOKEN', { flags: true });
const provider = createProvider(mixpanel);
```

### After ✅
```typescript
import mixpanel from 'mixpanel-browser';
import type { Provider } from '@openfeature/web-sdk';
import { MixpanelProvider, FlagsManager } from '@mixpanel/openfeature-web-provider';

function createProvider(flags: FlagsManager): Provider {
  return new MixpanelProvider(flags);
}

// Usage
mixpanel.init('TOKEN', { flags: true });
const provider = createProvider(mixpanel.flags);
```

**Changes:**
- Import: `MixpanelInstance` → `FlagsManager`
- Parameter type: `mp: MixpanelInstance` → `flags: FlagsManager`
- Argument: `mixpanel` → `mixpanel.flags`

---

## Example 4: Testing

### Before ❌
```typescript
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';
import sinon from 'sinon';

describe('My tests', () => {
  it('should work', async () => {
    // Mock the entire Mixpanel instance
    const mockMixpanel = {
      flags: {
        are_flags_ready: sinon.stub().returns(true),
        get_variant_sync: sinon.stub(),
        update_context: sinon.stub().resolves(),
      },
      // ... other mixpanel methods we don't need
    };

    const provider = new MixpanelProvider(mockMixpanel);
    // ... rest of test
  });
});
```

### After ✅
```typescript
import { MixpanelProvider } from '@mixpanel/openfeature-web-provider';
import sinon from 'sinon';

describe('My tests', () => {
  it('should work', async () => {
    // Mock only the FlagsManager interface
    const mockFlags = {
      are_flags_ready: sinon.stub().returns(true),
      get_variant_sync: sinon.stub(),
      update_context: sinon.stub().resolves(),
      fetchPromise: Promise.resolve(),
    };

    const provider = new MixpanelProvider(mockFlags);
    // ... rest of test
  });
});
```

**Benefits:**
- Simpler mocks (fewer properties to mock)
- Clearer what the provider actually depends on
- Faster tests (smaller mock objects)

---

## Example 5: Error Handling

### What Fails Now (Expected)

```typescript
// ❌ Will throw: "FlagsManager is required"
const provider = new MixpanelProvider(null);

// ❌ Will throw: "FlagsManager is required"
const provider = new MixpanelProvider(undefined);

// ❌ Will throw: "Invalid FlagsManager: missing required methods"
const provider = new MixpanelProvider({});

// ❌ Will throw: "Invalid FlagsManager: missing required methods"
const provider = new MixpanelProvider(mixpanel); // full instance

// ❌ Will throw: "Invalid FlagsManager: missing required methods"
const provider = new MixpanelProvider({
  are_flags_ready: () => true,
  // missing get_variant_sync and update_context
});
```

### What Works (Expected)

```typescript
// ✅ Works
mixpanel.init('TOKEN', { flags: true });
const provider = new MixpanelProvider(mixpanel.flags);

// ✅ Works with custom implementation
const customFlags = {
  are_flags_ready: () => true,
  get_variant_sync: (key, fallback) => fallback,
  update_context: async (ctx) => { /* ... */ },
  fetchPromise: Promise.resolve(),
};
const provider = new MixpanelProvider(customFlags);
```

---

## Migration Checklist

When updating your code:

1. **Find all provider instantiations**
   ```bash
   grep -r "new MixpanelProvider" .
   ```

2. **Update each one:**
   - Change `mixpanel)` → `mixpanel.flags)`

3. **Update type imports** (if using TypeScript)
   - Remove: `import { MixpanelInstance }`
   - Keep/Add: `import { FlagsManager }`

4. **Update function signatures**
   - Change parameter types from `MixpanelInstance` to `FlagsManager`
   - Update argument passing from `mixpanel` to `mixpanel.flags`

5. **Update tests**
   - Simplify mocks to only include FlagsManager interface
   - Remove unnecessary properties

6. **Verify:**
   ```bash
   npm run build  # Should compile
   npm test       # Should pass
   npx tsc --noEmit  # Should have no type errors
   ```

---

## Why This Change?

### Benefits

1. **Reduced Coupling**
   - Provider only depends on what it needs
   - Easier to maintain and test

2. **Clearer API**
   - Explicit about dependencies
   - Self-documenting code

3. **Better Testing**
   - Smaller, simpler mocks
   - Faster test execution

4. **Future-Proof**
   - If Mixpanel SDK changes, provider is isolated
   - Easier to create alternative implementations

### Example: Before/After Dependency Graph

**Before:**
```
MixpanelProvider
  └─> MixpanelInstance
        ├─> flags (FlagsManager) ← actually used
        ├─> track()              ← not used
        ├─> identify()           ← not used
        ├─> get_distinct_id()    ← not used
        └─> ... 50+ other methods ← not used
```

**After:**
```
MixpanelProvider
  └─> FlagsManager
        ├─> are_flags_ready()
        ├─> get_variant_sync()
        ├─> update_context()
        └─> fetchPromise
```

Much cleaner! 🎉
