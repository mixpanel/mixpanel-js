import { expect } from 'chai';

import jsdomSetup from './jsdom-setup';
import targetUrlVectors from './test-data/visual-url-target-vectors.json';

describe(`urlTargetMatches`, function () {
  let urlTargetMatches;

  jsdomSetup({
    url: `http://localhost/`,
    reImportModules: [
      `../../src/window`,
      `../../src/url-matching`,
    ],
    beforeCallback: (modules) => {
      urlTargetMatches = modules[1].urlTargetMatches;
    },
  });

  // An anchor exposes the same protocol/host/pathname/search/hash fields as
  // window.location.
  const pageLocation = (pageUrl) => {
    const anchor = global.window.document.createElement(`a`);
    anchor.href = pageUrl;
    return anchor;
  };

  describe(`shared vectors`, function () {
    it(`has vectors to run`, function () {
      expect(targetUrlVectors.cases.length).to.be.greaterThan(0);
    });

    targetUrlVectors.cases.forEach((vector) => {
      it(vector.why, function () {
        expect(urlTargetMatches(vector.target, pageLocation(vector.page))).to.equal(vector.match);
      });
    });
  });

  describe(`malformed input`, function () {
    const validTarget = {
      version: 1,
      url: { type: `pattern`, value: `https://shop.com/cart` },
      query: null,
      hash: null,
      ignoredParamKeys: [],
    };

    it(`matches the valid baseline`, function () {
      expect(urlTargetMatches(validTarget, pageLocation(`https://shop.com/cart`))).to.equal(true);
    });

    [
      [`a null target`, null],
      [`a string target`, `https://shop.com/cart`],
      [`an unknown url type`, Object.assign({}, validTarget, { url: { type: `glob`, value: `https://shop.com/cart` } })],
      [`a relative pattern`, Object.assign({}, validTarget, { url: { type: `pattern`, value: `/cart` } })],
      [`a missing ignoredParamKeys`, Object.assign({}, validTarget, { ignoredParamKeys: undefined })],
      [`a malformed query`, Object.assign({}, validTarget, { query: { params: [{ key: `a` }] } })],
      [`a malformed hash`, Object.assign({}, validTarget, { hash: { route: 1, params: null } })],
    ].forEach(([description, target]) => {
      it(`never matches ${description}`, function () {
        expect(urlTargetMatches(target, pageLocation(`https://shop.com/cart`))).to.equal(false);
      });
    });

    it(`never matches a rule that repeats a query key`, function () {
      const target = Object.assign({}, validTarget, {
        query: { params: [{ key: `a`, value: `1` }, { key: `a`, value: `1` }] },
      });
      expect(urlTargetMatches(target, pageLocation(`https://shop.com/cart?a=1`))).to.equal(false);
    });

    it(`treats __proto__ as an ordinary query key`, function () {
      const emptyQueryTarget = Object.assign({}, validTarget, { query: { params: [] } });
      expect(urlTargetMatches(emptyQueryTarget, pageLocation(`https://shop.com/cart?__proto__=1`))).to.equal(false);
      const protoKeyTarget = Object.assign({}, validTarget, { query: { params: [{ key: `__proto__`, value: `1` }] } });
      expect(urlTargetMatches(protoKeyTarget, pageLocation(`https://shop.com/cart?__proto__=1`))).to.equal(true);
    });

    it(`never matches a non-http page`, function () {
      expect(urlTargetMatches(validTarget, pageLocation(`file:///cart`))).to.equal(false);
    });
  });
});

describe(`urlMatchesRegexList`, function() {
  let urlMatchesRegexList;

  jsdomSetup({
    url: `http://localhost/`,
    reImportModules: [
      `../../src/window`,
      `../../src/url-matching`,
    ],
    beforeCallback: (modules) => {
      urlMatchesRegexList = modules[1].urlMatchesRegexList;
    },
  });

  it(`returns false when url matches no regex in empty list`, function() {
    const url = `https://example.com/api/test`;
    const regexList = [];
    expect(urlMatchesRegexList(url, regexList)).to.be.false;
  });

  it(`returns true when url matches single regex in list`, function() {
    const url = `https://example.com/api/test`;
    const regexList = [/\/api\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`returns false when url matches none of the regexes in list`, function() {
    const url = `https://example.com/public/page`;
    const regexList = [/\/api\//, /\/admin\//, /\/private\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.false;
  });

  it(`returns true when url matches first regex in list`, function() {
    const url = `https://example.com/api/endpoint`;
    const regexList = [/\/api\//, /\/admin\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`returns true when url matches last regex in list`, function() {
    const url = `https://example.com/admin/users`;
    const regexList = [/\/api\//, /\/public\//, /\/admin\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`returns true when url matches middle regex in list`, function() {
    const url = `https://example.com/public/page.html`;
    const regexList = [/\/api\//, /\/public\//, /\/admin\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`works with string-based regex patterns`, function() {
    const url = `https://example.com/test/path`;
    const regexList = [`test`];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`handles complex regex patterns`, function() {
    const url = `https://api.example.com/v1/users/123/profile`;
    const regexList = [/^https:\/\/api\.example\.com\/v[0-9]+\/users\/[0-9]+/];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`handles wildcard regex patterns`, function() {
    const url = `https://example.com/api/anything/here`;
    const regexList = [/\/api\/.*/];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`is case-sensitive by default`, function() {
    const url = `https://example.com/API/test`;
    const regexList = [/\/api\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.false;
  });

  it(`supports case-insensitive regex patterns`, function() {
    const url = `https://example.com/API/test`;
    const regexList = [/\/api\//i];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });

  it(`matches partial URLs`, function() {
    const url = `/api/endpoint`;
    const regexList = [/^\/api\//];
    expect(urlMatchesRegexList(url, regexList)).to.be.true;
  });
});
