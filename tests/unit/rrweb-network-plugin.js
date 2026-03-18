import { expect } from 'chai';
import { findLast, truncateBody, shouldRecordHeader, shouldRecordBody, patch } from '../../src/recorder/rrweb-network-plugin';

describe(`rrweb-network-plugin utils`, function() {
  describe(`findLast`, function() {
    it(`returns undefined for empty array`, function() {
      const result = findLast([], () => true);
      expect(result).to.be.undefined;
    });

    it(`returns last matching element`, function() {
      const array = [1, 2, 3, 4, 5];
      const result = findLast(array, (x) => x > 2);
      expect(result).to.equal(5);
    });

    it(`returns first element when searching from end`, function() {
      const array = [1, 2, 3, 4, 5];
      const result = findLast(array, (x) => x === 1);
      expect(result).to.equal(1);
    });

    it(`returns undefined when no match found`, function() {
      const array = [1, 2, 3];
      const result = findLast(array, (x) => x > 10);
      expect(result).to.be.undefined;
    });

    it(`returns last matching element from multiple matches`, function() {
      const array = [1, 2, 3, 2, 1];
      const result = findLast(array, (x) => x === 2);
      expect(result).to.equal(2);
    });
  });

  describe(`truncateBody`, function() {
    const MAX_BODY_SIZE = 1024 * 1024;

    it(`returns original string when below max size`, function() {
      const str = `short string`;
      expect(truncateBody(str)).to.equal(str);
    });

    it(`returns non-string values as-is`, function() {
      expect(truncateBody(null)).to.be.null;
      expect(truncateBody(undefined)).to.be.undefined;
      expect(truncateBody(123)).to.equal(123);
    });

    it(`truncates string when exceeds max size`, function() {
      const str = `a`.repeat(MAX_BODY_SIZE + 100);
      const result = truncateBody(str);
      expect(result.length).to.equal(MAX_BODY_SIZE + `... [truncated]`.length);
      expect(result).to.include(`... [truncated]`);
    });

    it(`returns empty string as-is`, function() {
      expect(truncateBody(``)).to.equal(``);
    });
  });

  describe(`shouldRecordHeader`, function() {
    it(`returns false when recordHeaders type is empty`, function() {
      const recordHeaders = { request: [], response: [] };
      expect(shouldRecordHeader(`request`, recordHeaders, `Content-Type`)).to.be.false;
    });

    it(`returns false when recordHeaders type is undefined`, function() {
      const recordHeaders = { request: undefined, response: [] };
      expect(shouldRecordHeader(`request`, recordHeaders, `Content-Type`)).to.be.false;
    });

    it(`returns true when header is in allowlist`, function() {
      const recordHeaders = { request: [`content-type`, `authorization`], response: [] };
      expect(shouldRecordHeader(`request`, recordHeaders, `Content-Type`)).to.be.true;
    });

    it(`returns false when header is not in allowlist`, function() {
      const recordHeaders = { request: [`content-type`], response: [] };
      expect(shouldRecordHeader(`request`, recordHeaders, `Authorization`)).to.be.false;
    });

    it(`is case-insensitive for header names`, function() {
      const recordHeaders = { request: [`content-type`], response: [] };
      expect(shouldRecordHeader(`request`, recordHeaders, `CONTENT-TYPE`)).to.be.true;
      expect(shouldRecordHeader(`request`, recordHeaders, `Content-Type`)).to.be.true;
    });

    it(`works for response headers`, function() {
      const recordHeaders = { request: [], response: [`query-ids`] };
      expect(shouldRecordHeader(`response`, recordHeaders, `query-ids`)).to.be.true;
    });
  });

  describe(`shouldRecordBody`, function() {
    it(`returns false when recordBody type is empty`, function() {
      const recordBody = { request: [], response: [] };
      expect(shouldRecordBody(`request`, recordBody, `https://example.com/api`)).to.be.false;
    });

    it(`returns false when recordBody type is undefined`, function() {
      const recordBody = { request: undefined, response: [] };
      expect(shouldRecordBody(`request`, recordBody, `https://example.com/api`)).to.be.false;
    });

    it(`returns true when URL matches regex in allowlist`, function() {
      const recordBody = { request: [/\/api\//], response: [] };
      expect(shouldRecordBody(`request`, recordBody, `https://example.com/api/test`)).to.be.true;
    });

    it(`returns false when URL does not match any regex`, function() {
      const recordBody = { request: [/\/api\//], response: [] };
      expect(shouldRecordBody(`request`, recordBody, `https://example.com/public`)).to.be.false;
    });

    it(`works with multiple regex patterns`, function() {
      const recordBody = { request: [/\/api\//, /\/insights/], response: [] };
      expect(shouldRecordBody(`request`, recordBody, `https://example.com/insights`)).to.be.true;
    });

    it(`works for response body URLs`, function() {
      const recordBody = { request: [], response: [/\/metadata/] };
      expect(shouldRecordBody(`response`, recordBody, `https://example.com/metadata`)).to.be.true;
    });
  });

  describe(`patch`, function() {
    it(`replaces the method on the source object`, function() {
      const obj = { greet: () => `hello` };
      patch(obj, `greet`, (original) => () => original() + ` world`);
      expect(obj.greet()).to.equal(`hello world`);
    });

    it(`passes the original function to the replacement factory`, function() {
      const original = function() { return 42; };
      const obj = { fn: original };
      let received;
      patch(obj, `fn`, (orig) => {
        received = orig;
        return orig;
      });
      expect(received).to.equal(original);
    });

    it(`returns a function that restores the original method`, function() {
      const original = () => `original`;
      const obj = { fn: original };
      const restore = patch(obj, `fn`, () => () => `patched`);
      expect(obj.fn()).to.equal(`patched`);
      restore();
      expect(obj.fn()).to.equal(`original`);
      expect(obj.fn).to.equal(original);
    });

    it(`returns a no-op function if the property does not exist`, function() {
      const obj = {};
      const restore = patch(obj, `missing`, () => () => {});
      expect(restore).to.be.a(`function`);
      restore(); // should not throw
      expect(obj.missing).to.be.undefined;
    });

    it(`returns a no-op function if the property is not a function`, function() {
      const obj = { val: 123 };
      const restore = patch(obj, `val`, () => () => {});
      expect(restore).to.be.a(`function`);
      expect(obj.val).to.equal(123);
    });
  });
});
