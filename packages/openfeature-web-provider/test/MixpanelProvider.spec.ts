import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MixpanelProvider } from '../src/MixpanelProvider';
import { FlagsManager } from '../src/types';
import { ErrorCode } from '@openfeature/web-sdk';

chai.use(sinonChai);

describe('MixpanelProvider', () => {
  let mockFlagsManager: FlagsManager;
  let mockFlags: Map<string, any>;
  let mockLogger: any;

  beforeEach(() => {
    mockFlags = new Map();
    mockFlagsManager = {
      are_flags_ready: sinon.stub().returns(true),
      get_variant_sync: sinon.stub().callsFake((key: string, fallback: any) => {
        return mockFlags.get(key) || fallback;
      }),
      update_context: sinon.stub().resolves(),
      when_ready: sinon.stub().resolves(),
    };
    mockLogger = {
      debug: sinon.stub(),
      info: sinon.stub(),
      warn: sinon.stub(),
      error: sinon.stub(),
    };
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('metadata', () => {
    it('should have correct provider name', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      expect(provider.metadata.name).to.equal('mixpanel-provider');
    });

    it('should run on client', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      expect(provider.runsOn).to.equal('client');
    });
  });

  describe('initialize', () => {
    it('should wait for when_ready to resolve', async () => {
      let readyResolved = false;
      (mockFlagsManager.when_ready as sinon.SinonStub).returns(
        new Promise<void>((resolve) => {
          setTimeout(() => {
            readyResolved = true;
            resolve();
          }, 10);
        })
      );

      const provider = new MixpanelProvider(mockFlagsManager);

      expect(readyResolved).to.be.false;
      await provider.initialize();
      expect(readyResolved).to.be.true;
    });

    it('should call update_context when context is provided', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const context = { userId: 'test-user', email: 'test@example.com' };

      await provider.initialize(context);

      expect(mockFlagsManager.update_context).to.have.been.calledOnce;
      expect(mockFlagsManager.update_context).to.have.been.calledWith(context, { replace: true });
    });

    it('should not call update_context when context is empty', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);

      await provider.initialize({});

      expect(mockFlagsManager.update_context).not.to.have.been.called;
    });

    it('should not call update_context when context is undefined', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);

      await provider.initialize();

      expect(mockFlagsManager.update_context).not.to.have.been.called;
    });

    it('should call when_ready during initialize', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);

      await provider.initialize();

      expect(mockFlagsManager.when_ready).to.have.been.calledOnce;
    });
  });

  describe('onContextChange', () => {
    it('should call update_context with new context and replace: true', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const oldContext = { userId: 'old-user' };
      const newContext = { userId: 'new-user', plan: 'premium' };

      await provider.onContextChange(oldContext, newContext);

      expect(mockFlagsManager.update_context).to.have.been.calledOnce;
      expect(mockFlagsManager.update_context).to.have.been.calledWith(newContext, { replace: true });
    });

    it('should handle empty new context', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);

      await provider.onContextChange({ userId: 'old' }, {});

      expect(mockFlagsManager.update_context).to.have.been.calledWith({}, { replace: true });
    });
  });

  describe('onClose', () => {
    it('should resolve without error', async () => {
      const provider = new MixpanelProvider(mockFlagsManager);

      // Should not throw
      await provider.onClose();
    });

    it('should return a promise', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.onClose();

      expect(result).to.be.instanceOf(Promise);
    });
  });

  describe('resolveBooleanEvaluation', () => {
    it('should return correct value when flag exists with boolean value', () => {
      mockFlags.set('feature-enabled', {
        key: 'enabled',
        value: true,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('feature-enabled', false, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.variant).to.equal('enabled');
      expect(result.reason).to.equal('STATIC');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return false boolean value correctly', () => {
      mockFlags.set('feature-disabled', {
        key: 'disabled',
        value: false,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('feature-disabled', true, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.variant).to.equal('disabled');
    });

    it('should return TYPE_MISMATCH error when value is not boolean (string)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: 'not-a-boolean',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('string-flag', false, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
      expect(result.errorMessage).to.include('not a boolean');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return TYPE_MISMATCH error when value is not boolean (number)', () => {
      mockFlags.set('number-flag', {
        key: 'variant-a',
        value: 42,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('number-flag', true, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not boolean (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { some: 'object' },
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('object-flag', false, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('non-existent-flag', true, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      expect(result.errorMessage).to.include('not found');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockFlagsManager.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('any-flag', false, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
      expect(result.errorMessage).to.include('not been loaded');
      expect(result.reason).to.equal('ERROR');
    });
  });

  describe('resolveStringEvaluation', () => {
    it('should return correct value when flag exists with string value', () => {
      mockFlags.set('theme-flag', {
        key: 'dark',
        value: 'dark-mode',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('theme-flag', 'light-mode', {}, mockLogger);

      expect(result.value).to.equal('dark-mode');
      expect(result.variant).to.equal('dark');
      expect(result.reason).to.equal('STATIC');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return empty string value correctly', () => {
      mockFlags.set('empty-string-flag', {
        key: 'empty',
        value: '',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('empty-string-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('');
      expect(result.variant).to.equal('empty');
    });

    it('should return TYPE_MISMATCH error when value is not string (boolean)', () => {
      mockFlags.set('bool-flag', {
        key: 'variant-a',
        value: true,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('bool-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
      expect(result.errorMessage).to.include('not a string');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return TYPE_MISMATCH error when value is not string (number)', () => {
      mockFlags.set('number-flag', {
        key: 'variant-a',
        value: 123,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('number-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not string (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { key: 'value' },
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('object-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('non-existent-flag', 'fallback', {}, mockLogger);

      expect(result.value).to.equal('fallback');
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      expect(result.errorMessage).to.include('not found');
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockFlagsManager.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('any-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
    });
  });

  describe('resolveNumberEvaluation', () => {
    it('should return correct value when flag exists with number value', () => {
      mockFlags.set('percentage-flag', {
        key: 'variant-50',
        value: 50,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('percentage-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(50);
      expect(result.variant).to.equal('variant-50');
      expect(result.reason).to.equal('STATIC');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return zero value correctly', () => {
      mockFlags.set('zero-flag', {
        key: 'zero',
        value: 0,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('zero-flag', 100, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.variant).to.equal('zero');
    });

    it('should return negative number correctly', () => {
      mockFlags.set('negative-flag', {
        key: 'negative',
        value: -42,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('negative-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(-42);
    });

    it('should return float value correctly', () => {
      mockFlags.set('float-flag', {
        key: 'float',
        value: 3.14159,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('float-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(3.14159);
    });

    it('should return TYPE_MISMATCH error when value is not number (string)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: '42',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('string-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
      expect(result.errorMessage).to.include('not a number');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return TYPE_MISMATCH error when value is not number (boolean)', () => {
      mockFlags.set('bool-flag', {
        key: 'variant-a',
        value: true,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('bool-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not number (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { num: 42 },
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('object-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('non-existent-flag', 99, {}, mockLogger);

      expect(result.value).to.equal(99);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockFlagsManager.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('any-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
    });
  });

  describe('resolveObjectEvaluation', () => {
    it('should return correct value when flag exists with object value', () => {
      const objectValue = { feature: 'enabled', level: 2, options: ['a', 'b'] };
      mockFlags.set('config-flag', {
        key: 'variant-full',
        value: objectValue,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('config-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal(objectValue);
      expect(result.variant).to.equal('variant-full');
      expect(result.reason).to.equal('STATIC');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return empty object value correctly', () => {
      mockFlags.set('empty-object-flag', {
        key: 'empty',
        value: {},
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('empty-object-flag', { default: true }, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.variant).to.equal('empty');
    });

    it('should return array value correctly (object accepts any type)', () => {
      const arrayValue = [1, 2, 3, 'four'];
      mockFlags.set('array-flag', {
        key: 'array-variant',
        value: arrayValue,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('array-flag', [], {}, mockLogger);

      expect(result.value).to.deep.equal(arrayValue);
      expect(result.variant).to.equal('array-variant');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return nested object value correctly', () => {
      const nestedValue = {
        level1: {
          level2: {
            level3: 'deep',
          },
        },
      };
      mockFlags.set('nested-flag', {
        key: 'nested',
        value: nestedValue,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('nested-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal(nestedValue);
    });

    it('should return string value via object evaluation (object accepts any type)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: 'not-an-object',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('string-flag', {}, {}, mockLogger);

      expect(result.value).to.equal('not-an-object');
      expect(result.variant).to.equal('variant-a');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return number value via object evaluation (object accepts any type)', () => {
      mockFlags.set('number-flag', {
        key: 'variant-a',
        value: 42,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('number-flag', {}, {}, mockLogger);

      expect(result.value).to.equal(42);
      expect(result.variant).to.equal('variant-a');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return boolean value via object evaluation (object accepts any type)', () => {
      mockFlags.set('bool-flag', {
        key: 'variant-a',
        value: true,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('bool-flag', {}, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.variant).to.equal('variant-a');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return null value via object evaluation (object accepts any type)', () => {
      mockFlags.set('null-flag', {
        key: 'variant-a',
        value: null,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('null-flag', { default: true }, {}, mockLogger);

      expect(result.value).to.be.null;
      expect(result.variant).to.equal('variant-a');
      expect(result.errorCode).to.be.undefined;
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const defaultValue = { fallback: true };
      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('non-existent-flag', defaultValue, {}, mockLogger);

      expect(result.value).to.deep.equal(defaultValue);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockFlagsManager.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveObjectEvaluation('any-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
    });
  });

  describe('edge cases', () => {
    it('should handle flag with experiment metadata', () => {
      mockFlags.set('experiment-flag', {
        key: 'treatment',
        value: true,
        experiment_id: 'exp-123',
        is_experiment_active: true,
        is_qa_tester: false,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveBooleanEvaluation('experiment-flag', false, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.variant).to.equal('treatment');
    });

    it('should handle special characters in flag key', () => {
      mockFlags.set('flag-with-special_chars.and/slashes', {
        key: 'variant',
        value: 'special',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation(
        'flag-with-special_chars.and/slashes',
        'default',
        {},
        mockLogger
      );

      expect(result.value).to.equal('special');
    });

    it('should handle unicode in flag values', () => {
      mockFlags.set('unicode-flag', {
        key: 'unicode',
        value: 'Hello World',
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveStringEvaluation('unicode-flag', '', {}, mockLogger);

      expect(result.value).to.equal('Hello World');
    });

    it('should handle very large numbers', () => {
      mockFlags.set('large-number-flag', {
        key: 'large',
        value: Number.MAX_SAFE_INTEGER,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('large-number-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it('should handle NaN as valid number (typeof NaN === number)', () => {
      mockFlags.set('nan-flag', {
        key: 'nan',
        value: NaN,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('nan-flag', 0, {}, mockLogger);

      // NaN is typeof number, so it passes the type check
      expect(result.value).to.be.NaN;
      expect(result.errorCode).to.be.undefined;
    });

    it('should handle Infinity as valid number', () => {
      mockFlags.set('infinity-flag', {
        key: 'infinity',
        value: Infinity,
      });

      const provider = new MixpanelProvider(mockFlagsManager);
      const result = provider.resolveNumberEvaluation('infinity-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(Infinity);
    });

    it('should handle evaluation context passed to methods', () => {
      mockFlags.set('context-flag', {
        key: 'variant',
        value: true,
      });

      const context = { userId: 'user-123', plan: 'premium' };
      const provider = new MixpanelProvider(mockFlagsManager);

      // Context is passed but not used in resolution (already set via initialize/onContextChange)
      const result = provider.resolveBooleanEvaluation('context-flag', false, context, mockLogger);

      expect(result.value).to.equal(true);
    });

    it('should create new provider instances independently', () => {
      const provider1 = new MixpanelProvider(mockFlagsManager);
      const provider2 = new MixpanelProvider(mockFlagsManager);

      mockFlags.set('test-flag', { key: 'v', value: 'test' });

      provider1.resolveStringEvaluation('test-flag', '', {}, mockLogger);
      expect(mockFlagsManager.get_variant_sync).to.have.been.calledOnce;

      provider2.resolveStringEvaluation('test-flag', '', {}, mockLogger);
      expect(mockFlagsManager.get_variant_sync).to.have.been.calledTwice;
    });
  });
});
