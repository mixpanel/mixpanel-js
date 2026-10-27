import { expect } from 'chai';
import sinon from 'sinon';

import jsdomSetup from './jsdom-setup';

describe(`consent gate`, function() {
  // re-required before each test so they reference the correct jsdom document
  let gates;

  jsdomSetup({
    reImportModules: [`../../src/window`, `../../src/utils`, `../../src/consent-gate`],
    beforeCallback: modules => {
      gates = modules[2];
    },
  });

  describe(`buildConsentGate`, function() {
    it(`asks each capability by name`, function() {
      const allows = sinon.spy(capability => capability !== `api_calls` && capability !== `fetch`);
      const gate = gates.buildConsentGate(allows, () => false);

      expect(gate.allowsApiCalls()).to.be.false;
      expect(gate.allowsSending()).to.be.true;
      expect(gate.allowsFetching()).to.be.false;
      expect(gate.allowsStoring()).to.be.true;
      expect(allows.args.map(args => args[0])).to.deep.equal([`api_calls`, `send`, `fetch`, `store`]);
    });

    it(`lets the calls run if asking throws`, function() {
      const gate = gates.buildConsentGate(() => {
        throw new Error(`Unexpected error!`);
      }, () => false);

      expect(gate.allowsApiCalls()).to.be.true;
    });

    it(`allows persistence when consent allows storing and disable_persistence is off`, function() {
      expect(gates.buildConsentGate(() => true, () => false).allowsPersistence()).to.be.true;
    });

    it(`doesn't allow persistence with disable_persistence`, function() {
      const gate = gates.buildConsentGate(() => true, key => key === `disable_persistence`);
      expect(gate.allowsPersistence()).to.be.false;
    });

    it(`doesn't allow persistence without consent to store`, function() {
      const gate = gates.buildConsentGate(capability => capability !== `store`, () => false);
      expect(gate.allowsPersistence()).to.be.false;
    });
  });

  describe(`consentGateFor`, function() {
    function makeInstance(config, consentAllows, hasOptedOut = false) {
      return {
        get_config: key => config[key],
        has_opted_out_tracking: () => hasOptedOut,
        _consent_allows: consentAllows,
      };
    }

    it(`asks the core's _consent_allows`, function() {
      const gate = gates.consentGateFor(makeInstance({}, capability => capability !== `api_calls`));

      expect(gate.allowsApiCalls()).to.be.false;
      expect(gate.allowsSending()).to.be.true;
    });

    it(`stops only the calls after an opt-out, for a core without _consent_allows`, function() {
      const gate = gates.consentGateFor(makeInstance({}, undefined, true));

      expect(gate.allowsApiCalls()).to.be.false;
      expect(gate.allowsStoring()).to.be.true;
      expect(gates.consentGateFor(makeInstance({})).allowsApiCalls()).to.be.true;
    });

    it(`reads disable_persistence from the core's config`, function() {
      expect(gates.consentGateFor(makeInstance({}, () => true)).allowsPersistence()).to.be.true;
      expect(gates.consentGateFor(makeInstance({disable_persistence: true}, () => true)).allowsPersistence()).to.be.false;
      expect(gates.consentGateFor(makeInstance({disable_persistence: true})).allowsPersistence()).to.be.false;
    });
  });
});
