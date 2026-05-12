import chai, { expect } from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";

import { setupFakeIDB } from "./test-utils/indexed-db";
import {
  FeatureFlagPersistence,
  PERSISTED_VARIANTS_KEY_PREFIX,
  VariantLookupPolicy,
} from "../../src/flags/flags-persistence";

chai.use(sinonChai);

describe(`FeatureFlagPersistence`, function () {
  const TEST_TOKEN = `test-token`;
  const PERSISTED_KEY = PERSISTED_VARIANTS_KEY_PREFIX + TEST_TOKEN;
  const context = { distinct_id: `user-1`, device_id: `device-1` };

  setupFakeIDB();

  function makePersistence(opts) {
    opts = opts || {};
    return new FeatureFlagPersistence({
      variantLookupPolicy: opts.variantLookupPolicy || VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
      persistenceTtlMs: opts.persistenceTtlMs,
    }, TEST_TOKEN);
  }

  describe(`getPolicy`, function () {
    it(`returns 'networkOnly' when no config`, function () {
      const persistence = new FeatureFlagPersistence();
      expect(persistence.getPolicy()).to.equal(VariantLookupPolicy.NETWORK_ONLY);
    });

    it(`returns 'networkOnly' when policy is invalid`, function () {
      const persistence = new FeatureFlagPersistence({ variantLookupPolicy: `invalidPolicy` });
      expect(persistence.getPolicy()).to.equal(VariantLookupPolicy.NETWORK_ONLY);
    });

    it(`returns 'networkOnly' when persistenceTtlMs is non-positive`, function () {
      const persistence = new FeatureFlagPersistence({
        variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
        persistenceTtlMs: 0,
      });
      expect(persistence.getPolicy()).to.equal(VariantLookupPolicy.NETWORK_ONLY);
    });

    it(`returns the configured policy for each enum value`, function () {
      [
        VariantLookupPolicy.NETWORK_ONLY,
        VariantLookupPolicy.NETWORK_FIRST,
        VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
      ].forEach(function (policy) {
        const persistence = makePersistence({ variantLookupPolicy: policy });
        expect(persistence.getPolicy(), policy).to.equal(policy);
      });
    });
  });

  describe(`loadFlagsFromStorage`, function () {
    it(`returns null when no data stored`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded).to.be.null;
    });

    it(`retrieves persisted flags from storage`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const flags = new Map([
        [
          `flagA`,
          {
            key: `varA`,
            value: `1`,
            experiment_id: `e1`,
            is_experiment_active: true,
            is_qa_tester: false,
          },
        ],
      ]);
      await persistence.save(context, flags);

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded.flags.size).to.equal(1);
      const variant = loaded.flags.get(`flagA`);
      expect(variant.persisted_at_in_ms).to.be.at.most(Date.now());
      expect(variant.ttl_in_ms).to.equal(60000);
      expect(variant).to.deep.include({
        key: `varA`,
        value: `1`,
        experiment_id: `e1`,
        is_experiment_active: true,
        is_qa_tester: false,
        variant_source: `persistence`,
      });
    });

    it(`clears persisted variants on distinct_id mismatch`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const flags = new Map([[`flagA`, { key: `varA`, value: `1` }]]);
      await persistence.save(context, flags);

      const loaded = await persistence.loadFlagsFromStorage({ distinct_id: `someone-else` });
      expect(loaded).to.be.null;

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`returns null but does NOT clear when TTL has expired (eviction is lazy)`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const timespanLongerThanTtl = 120000;
      await persistence.idb.init();
      const expiredRecord = {
        persistedAt: Date.now() - timespanLongerThanTtl,
        distinctId: `user-1`,
        context: context,
        flagVariants: { flagA: { variant_key: `varA`, variant_value: `1` } },
      };
      await persistence.idb.setItem(PERSISTED_KEY, expiredRecord);

      const loaded = await persistence.loadFlagsFromStorage(context);
      expect(loaded).to.be.null;

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.deep.equal(expiredRecord);
    });

    it(`applies default 24-hour TTL when persistenceTtlMs is undefined and does NOT clear on expiry`, async function () {
      const persistence = makePersistence();
      const longerThanDefaultTtl = 25 * 60 * 60 * 1000;
      await persistence.idb.init();
      const expiredRecord = {
        persistedAt: Date.now() - longerThanDefaultTtl,
        distinctId: `user-1`,
        context: context,
        flagVariants: { flagA: { variant_key: `varA`, variant_value: `1` } },
      };
      await persistence.idb.setItem(PERSISTED_KEY, expiredRecord);

      const loaded = await persistence.loadFlagsFromStorage(context);
      expect(loaded).to.be.null;

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.deep.equal(expiredRecord);
    });

    it(`clears storage and returns null when the load fails (self-healing)`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      await persistence.save(context, new Map([[`flagA`, { key: `varA`, value: `1` }]]));

      sinon.stub(persistence.idb, `getItem`).rejects(new Error(`boom`));
      const clearSpy = sinon.spy(persistence, `clear`);

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded).to.be.null;
      expect(clearSpy).to.have.been.calledOnce;

      sinon.restore();
    });

    it(`restores pendingFirstTimeEvents`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const pending = { 'flagA:hash1': { flag_key: `flagA`, event_name: `Viewed` } };
      await persistence.save(
        context,
        new Map([[`flagA`, { key: `varA`, value: `1` }]]),
        pending
      );

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded.pendingFirstTimeEvents).to.deep.equal(pending);
      expect(loaded.activatedFirstTimeEvents).to.be.undefined;
    });

    it(`defaults pendingFirstTimeEvents to empty for legacy records`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      await persistence.idb.init();
      await persistence.idb.setItem(PERSISTED_KEY, {
        persistedAt: Date.now(),
        distinctId: `user-1`,
        context: context,
        flagVariants: { flagA: { variant_key: `varA`, variant_value: `1` } },
      });

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded.pendingFirstTimeEvents).to.deep.equal({});
    });

    it(`clears any pre-existing data on load when policy is NETWORK_ONLY`, async function () {
      const persistence = makePersistence({ variantLookupPolicy: VariantLookupPolicy.NETWORK_ONLY });
      await persistence.idb.init();
      await persistence.idb.setItem(PERSISTED_KEY, {
        persistedAt: Date.now(),
        distinctId: `user-1`,
        context: context,
        flagVariants: { flagA: { variant_key: `varA`, variant_value: `1` } },
      });

      const loaded = await persistence.loadFlagsFromStorage(context);
      expect(loaded).to.be.null;

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`returns null and runs cleanup when no config provided (treated as networkOnly)`, async function () {
      // Seed a stale entry under the no-config key, then confirm load clears it.
      const persistence = new FeatureFlagPersistence(undefined, TEST_TOKEN);
      await persistence.idb.init();
      await persistence.idb.setItem(PERSISTED_KEY, { persistedAt: Date.now(), distinctId: `user-1` });

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded).to.be.null;
      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`returns null without touching storage when disable_persistence is true`, async function () {
      const persistence = new FeatureFlagPersistence({
        variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
      }, TEST_TOKEN, function() { return true; });
      const initSpy = sinon.spy(persistence.idb, `init`);

      const loaded = await persistence.loadFlagsFromStorage(context);

      expect(loaded).to.be.null;
      expect(initSpy).to.not.have.been.called;
      sinon.restore();
    });
  });

  describe(`save`, function () {
    it(`writes the expected data to persistence`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const flags = new Map([
        [
          `flagA`,
          {
            key: `varA`,
            value: `1`,
            experiment_id: `e1`,
            is_experiment_active: true,
            is_qa_tester: false,
          },
        ],
      ]);

      await persistence.save(context, flags);

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored.persistedAt).to.be.a(`number`);
      expect(stored).to.deep.include({
        distinctId: `user-1`,
        context: context,
        flagVariants: {
          flagA: {
            variant_key: `varA`,
            variant_value: `1`,
            experiment_id: `e1`,
            is_experiment_active: true,
            is_qa_tester: false,
          },
        },
        pendingFirstTimeEvents: {},
      });
      expect(stored).to.not.have.property(`activatedFirstTimeEvents`);
    });

    it(`persists pendingFirstTimeEvents`, async function () {
      const persistence = makePersistence({ persistenceTtlMs: 60000 });
      const flags = new Map([[`flagA`, { key: `varA`, value: `1` }]]);
      const pending = { 'flagA:hash1': { flag_key: `flagA`, event_name: `Viewed` } };

      await persistence.save(context, flags, pending);

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored.pendingFirstTimeEvents).to.deep.equal(pending);
      expect(stored).to.not.have.property(`activatedFirstTimeEvents`);
    });

    it(`is a no-op when persistence is not enabled`, async function () {
      const persistence = makePersistence({ variantLookupPolicy: VariantLookupPolicy.NETWORK_ONLY });
      const flags = new Map([[`flagA`, { key: `varA`, value: `1` }]]);

      await persistence.save(context, flags);

      await persistence.idb.init();
      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });
  });

  describe(`clear`, function () {
    it(`removes the persisted variants key`, async function () {
      const persistence = makePersistence({ variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST });
      await persistence.save(context, new Map([[`flagA`, { key: `varA`, value: `1` }]]));

      await persistence.clear();

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`removes data even when policy is NETWORK_ONLY (toggle-back cleanup)`, async function () {
      // Prime the cache as a caching policy would have done.
      const cachingInstance = makePersistence({ variantLookupPolicy: VariantLookupPolicy.NETWORK_FIRST });
      await cachingInstance.save(context, new Map([[`flagA`, { key: `varA`, value: `1` }]]));

      const networkOnlyInstance = makePersistence({ variantLookupPolicy: VariantLookupPolicy.NETWORK_ONLY });
      await networkOnlyInstance.clear();

      await networkOnlyInstance.idb.init();
      const stored = await networkOnlyInstance.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`clears the storage key even when persistence is not configured (defensive cleanup)`, async function () {
      // Seed a stale entry, then verify clear() removes it even with no config.
      const persistence = new FeatureFlagPersistence(undefined, TEST_TOKEN);
      await persistence.idb.init();
      await persistence.idb.setItem(PERSISTED_KEY, { persistedAt: Date.now() });

      await persistence.clear();

      const stored = await persistence.idb.getItem(PERSISTED_KEY);
      expect(stored).to.be.undefined;
    });

    it(`is a no-op when disable_persistence is true`, async function () {
      const persistence = new FeatureFlagPersistence({
        variantLookupPolicy: VariantLookupPolicy.PERSISTENCE_UNTIL_NETWORK_SUCCESS,
      }, TEST_TOKEN, function() { return true; });
      const initSpy = sinon.spy(persistence.idb, `init`);

      await persistence.clear();

      expect(initSpy).to.not.have.been.called;
      sinon.restore();
    });
  });
});
