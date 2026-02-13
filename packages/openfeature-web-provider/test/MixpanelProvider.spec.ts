import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { MixpanelProvider } from '../src/MixpanelProvider';
import { MixpanelInstance, FlagsVariant } from '../src/types';
import { ErrorCode } from '@openfeature/web-sdk';

chai.use(sinonChai);

describe('MixpanelProvider', () => {
  let mockMixpanel: MixpanelInstance;
  let mockFlags: Map<string, FlagsVariant>;
  let mockLogger: any;

  beforeEach(() => {
    mockFlags = new Map();
    mockMixpanel = {
      flags: {
        are_flags_ready: sinon.stub().returns(true),
        get_variant_sync: sinon.stub().callsFake((key: string, fallback: FlagsVariant) => {
          return mockFlags.get(key) || fallback;
        }),
        update_context: sinon.stub().resolves(),
        fetchPromise: Promise.resolve(),
        flags: mockFlags,
      },
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
      const provider = new MixpanelProvider(mockMixpanel);
      expect(provider.metadata.name).to.equal('mixpanel-provider');
    });

    it('should run on client', () => {
      const provider = new MixpanelProvider(mockMixpanel);
      expect(provider.runsOn).to.equal('client');
    });
  });

  describe('initialize', () => {
    it('should wait for fetchPromise to resolve', async () => {
      let fetchResolved = false;
      const delayedFetchPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          fetchResolved = true;
          resolve();
        }, 10);
      });
      mockMixpanel.flags.fetchPromise = delayedFetchPromise;

      const provider = new MixpanelProvider(mockMixpanel);

      expect(fetchResolved).to.be.false;
      await provider.initialize();
      expect(fetchResolved).to.be.true;
    });

    it('should call update_context when context is provided', async () => {
      const provider = new MixpanelProvider(mockMixpanel);
      const context = { userId: 'test-user', email: 'test@example.com' };

      await provider.initialize(context);

      expect(mockMixpanel.flags.update_context).to.have.been.calledOnce;
      expect(mockMixpanel.flags.update_context).to.have.been.calledWith(context, { replace: true });
    });

    it('should not call update_context when context is empty', async () => {
      const provider = new MixpanelProvider(mockMixpanel);

      await provider.initialize({});

      expect(mockMixpanel.flags.update_context).not.to.have.been.called;
    });

    it('should not call update_context when context is undefined', async () => {
      const provider = new MixpanelProvider(mockMixpanel);

      await provider.initialize();

      expect(mockMixpanel.flags.update_context).not.to.have.been.called;
    });

    it('should handle missing fetchPromise gracefully', async () => {
      mockMixpanel.flags.fetchPromise = undefined;
      const provider = new MixpanelProvider(mockMixpanel);

      // Should not throw
      await provider.initialize();
    });
  });

  describe('onContextChange', () => {
    it('should call update_context with new context and replace: true', async () => {
      const provider = new MixpanelProvider(mockMixpanel);
      const oldContext = { userId: 'old-user' };
      const newContext = { userId: 'new-user', plan: 'premium' };

      await provider.onContextChange(oldContext, newContext);

      expect(mockMixpanel.flags.update_context).to.have.been.calledOnce;
      expect(mockMixpanel.flags.update_context).to.have.been.calledWith(newContext, { replace: true });
    });

    it('should handle empty new context', async () => {
      const provider = new MixpanelProvider(mockMixpanel);

      await provider.onContextChange({ userId: 'old' }, {});

      expect(mockMixpanel.flags.update_context).to.have.been.calledWith({}, { replace: true });
    });
  });

  describe('onClose', () => {
    it('should resolve without error', async () => {
      const provider = new MixpanelProvider(mockMixpanel);

      // Should not throw
      await provider.onClose();
    });

    it('should return a promise', () => {
      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveBooleanEvaluation('feature-disabled', true, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.variant).to.equal('disabled');
    });

    it('should return TYPE_MISMATCH error when value is not boolean (string)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: 'not-a-boolean',
      });

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveBooleanEvaluation('number-flag', true, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not boolean (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { some: 'object' },
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveBooleanEvaluation('object-flag', false, {}, mockLogger);

      expect(result.value).to.equal(false);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveBooleanEvaluation('non-existent-flag', true, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      expect(result.errorMessage).to.include('not found');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockMixpanel.flags.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveStringEvaluation('empty-string-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('');
      expect(result.variant).to.equal('empty');
    });

    it('should return TYPE_MISMATCH error when value is not string (boolean)', () => {
      mockFlags.set('bool-flag', {
        key: 'variant-a',
        value: true,
      });

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveStringEvaluation('number-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not string (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { key: 'value' },
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveStringEvaluation('object-flag', 'default', {}, mockLogger);

      expect(result.value).to.equal('default');
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveStringEvaluation('non-existent-flag', 'fallback', {}, mockLogger);

      expect(result.value).to.equal('fallback');
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      expect(result.errorMessage).to.include('not found');
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockMixpanel.flags.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('zero-flag', 100, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.variant).to.equal('zero');
    });

    it('should return negative number correctly', () => {
      mockFlags.set('negative-flag', {
        key: 'negative',
        value: -42,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('negative-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(-42);
    });

    it('should return float value correctly', () => {
      mockFlags.set('float-flag', {
        key: 'float',
        value: 3.14159,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('float-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(3.14159);
    });

    it('should return TYPE_MISMATCH error when value is not number (string)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: '42',
      });

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('bool-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not number (object)', () => {
      mockFlags.set('object-flag', {
        key: 'variant-a',
        value: { num: 42 },
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('object-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(0);
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('non-existent-flag', 99, {}, mockLogger);

      expect(result.value).to.equal(99);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockMixpanel.flags.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('empty-object-flag', { default: true }, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.variant).to.equal('empty');
    });

    it('should return TYPE_MISMATCH error when value is an array', () => {
      const arrayValue = [1, 2, 3, 'four'];
      mockFlags.set('array-flag', {
        key: 'array-variant',
        value: arrayValue,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('array-flag', [], {}, mockLogger);

      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
      expect(result.value).to.deep.equal([]);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('nested-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal(nestedValue);
    });

    it('should return TYPE_MISMATCH error when value is not object (string)', () => {
      mockFlags.set('string-flag', {
        key: 'variant-a',
        value: 'not-an-object',
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('string-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
      expect(result.errorMessage).to.include('not an object');
      expect(result.reason).to.equal('ERROR');
    });

    it('should return TYPE_MISMATCH error when value is not object (number)', () => {
      mockFlags.set('number-flag', {
        key: 'variant-a',
        value: 42,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('number-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is not object (boolean)', () => {
      mockFlags.set('bool-flag', {
        key: 'variant-a',
        value: true,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('bool-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return TYPE_MISMATCH error when value is null', () => {
      mockFlags.set('null-flag', {
        key: 'variant-a',
        value: null,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('null-flag', { default: true }, {}, mockLogger);

      expect(result.value).to.deep.equal({ default: true });
      expect(result.errorCode).to.equal(ErrorCode.TYPE_MISMATCH);
    });

    it('should return FLAG_NOT_FOUND error when flag does not exist', () => {
      const defaultValue = { fallback: true };
      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('non-existent-flag', defaultValue, {}, mockLogger);

      expect(result.value).to.deep.equal(defaultValue);
      expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
    });

    it('should return PROVIDER_NOT_READY error when flags not loaded', () => {
      (mockMixpanel.flags.are_flags_ready as sinon.SinonStub).returns(false);

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveObjectEvaluation('any-flag', {}, {}, mockLogger);

      expect(result.value).to.deep.equal({});
      expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
    });
  });

  describe('trackExposures option', () => {
    describe('when trackExposures is true (default)', () => {
      it('should use get_variant_sync for flag resolution', () => {
        mockFlags.set('test-flag', {
          key: 'variant-a',
          value: 'test-value',
        });

        const provider = new MixpanelProvider(mockMixpanel);
        provider.resolveStringEvaluation('test-flag', 'default', {}, mockLogger);

        expect(mockMixpanel.flags.get_variant_sync).to.have.been.calledOnce;
        expect(mockMixpanel.flags.get_variant_sync).to.have.been.calledWith(
          'test-flag',
          sinon.match.object
        );
      });

      it('should use get_variant_sync when trackExposures explicitly set to true', () => {
        mockFlags.set('test-flag', {
          key: 'variant-a',
          value: true,
        });

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: true });
        provider.resolveBooleanEvaluation('test-flag', false, {}, mockLogger);

        expect(mockMixpanel.flags.get_variant_sync).to.have.been.calledOnce;
      });

      it('should pass fallback variant to get_variant_sync', () => {
        const provider = new MixpanelProvider(mockMixpanel);
        provider.resolveStringEvaluation('non-existent', 'default-value', {}, mockLogger);

        const call = (mockMixpanel.flags.get_variant_sync as sinon.SinonStub).getCall(0);
        const fallback = call.args[1];
        expect(fallback.key).to.equal('__mixpanel_openfeature_fallback__');
        expect(fallback.value).to.equal('default-value');
      });
    });

    describe('when trackExposures is false', () => {
      it('should read directly from flags Map instead of get_variant_sync', () => {
        mockFlags.set('test-flag', {
          key: 'variant-a',
          value: 'test-value',
        });

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });
        const result = provider.resolveStringEvaluation('test-flag', 'default', {}, mockLogger);

        expect(mockMixpanel.flags.get_variant_sync).not.to.have.been.called;
        expect(result.value).to.equal('test-value');
        expect(result.variant).to.equal('variant-a');
      });

      it('should return FLAG_NOT_FOUND when flag not in Map', () => {
        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });
        const result = provider.resolveStringEvaluation('non-existent', 'default', {}, mockLogger);

        expect(mockMixpanel.flags.get_variant_sync).not.to.have.been.called;
        expect(result.value).to.equal('default');
        expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      });

      it('should handle null flags Map gracefully', () => {
        mockMixpanel.flags.flags = null;

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });
        const result = provider.resolveStringEvaluation('test-flag', 'default', {}, mockLogger);

        expect(result.value).to.equal('default');
        expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      });

      it('should handle undefined flags Map gracefully', () => {
        mockMixpanel.flags.flags = undefined;

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });
        const result = provider.resolveBooleanEvaluation('test-flag', false, {}, mockLogger);

        expect(result.value).to.equal(false);
        expect(result.errorCode).to.equal(ErrorCode.FLAG_NOT_FOUND);
      });

      it('should still check are_flags_ready even when not tracking', () => {
        (mockMixpanel.flags.are_flags_ready as sinon.SinonStub).returns(false);

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });
        const result = provider.resolveStringEvaluation('test-flag', 'default', {}, mockLogger);

        expect(mockMixpanel.flags.are_flags_ready).to.have.been.calledOnce;
        expect(result.errorCode).to.equal(ErrorCode.PROVIDER_NOT_READY);
      });

      it('should work correctly for all evaluation types', () => {
        mockFlags.set('bool-flag', { key: 'v1', value: true });
        mockFlags.set('string-flag', { key: 'v2', value: 'hello' });
        mockFlags.set('number-flag', { key: 'v3', value: 42 });
        mockFlags.set('object-flag', { key: 'v4', value: { a: 1 } });

        const provider = new MixpanelProvider(mockMixpanel, { trackExposures: false });

        const boolResult = provider.resolveBooleanEvaluation('bool-flag', false, {}, mockLogger);
        expect(boolResult.value).to.equal(true);
        expect(boolResult.variant).to.equal('v1');

        const stringResult = provider.resolveStringEvaluation('string-flag', '', {}, mockLogger);
        expect(stringResult.value).to.equal('hello');
        expect(stringResult.variant).to.equal('v2');

        const numberResult = provider.resolveNumberEvaluation('number-flag', 0, {}, mockLogger);
        expect(numberResult.value).to.equal(42);
        expect(numberResult.variant).to.equal('v3');

        const objectResult = provider.resolveObjectEvaluation('object-flag', {}, {}, mockLogger);
        expect(objectResult.value).to.deep.equal({ a: 1 });
        expect(objectResult.variant).to.equal('v4');

        expect(mockMixpanel.flags.get_variant_sync).not.to.have.been.called;
      });
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveBooleanEvaluation('experiment-flag', false, {}, mockLogger);

      expect(result.value).to.equal(true);
      expect(result.variant).to.equal('treatment');
    });

    it('should handle special characters in flag key', () => {
      mockFlags.set('flag-with-special_chars.and/slashes', {
        key: 'variant',
        value: 'special',
      });

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveStringEvaluation('unicode-flag', '', {}, mockLogger);

      expect(result.value).to.equal('Hello World');
    });

    it('should handle very large numbers', () => {
      mockFlags.set('large-number-flag', {
        key: 'large',
        value: Number.MAX_SAFE_INTEGER,
      });

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('large-number-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(Number.MAX_SAFE_INTEGER);
    });

    it('should handle NaN as valid number (typeof NaN === number)', () => {
      mockFlags.set('nan-flag', {
        key: 'nan',
        value: NaN,
      });

      const provider = new MixpanelProvider(mockMixpanel);
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

      const provider = new MixpanelProvider(mockMixpanel);
      const result = provider.resolveNumberEvaluation('infinity-flag', 0, {}, mockLogger);

      expect(result.value).to.equal(Infinity);
    });

    it('should handle evaluation context passed to methods', () => {
      mockFlags.set('context-flag', {
        key: 'variant',
        value: true,
      });

      const context = { userId: 'user-123', plan: 'premium' };
      const provider = new MixpanelProvider(mockMixpanel);

      // Context is passed but not used in resolution (already set via initialize/onContextChange)
      const result = provider.resolveBooleanEvaluation('context-flag', false, context, mockLogger);

      expect(result.value).to.equal(true);
    });

    it('should create new provider instances independently', () => {
      const provider1 = new MixpanelProvider(mockMixpanel, { trackExposures: true });
      const provider2 = new MixpanelProvider(mockMixpanel, { trackExposures: false });

      mockFlags.set('test-flag', { key: 'v', value: 'test' });

      provider1.resolveStringEvaluation('test-flag', '', {}, mockLogger);
      expect(mockMixpanel.flags.get_variant_sync).to.have.been.calledOnce;

      (mockMixpanel.flags.get_variant_sync as sinon.SinonStub).resetHistory();

      provider2.resolveStringEvaluation('test-flag', '', {}, mockLogger);
      expect(mockMixpanel.flags.get_variant_sync).not.to.have.been.called;
    });
  });
});
