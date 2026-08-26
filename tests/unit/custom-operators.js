import fs from "fs";
import path from "path";

import { expect } from "chai";
import * as jsonLogic from "json-logic-js";

import { registerCustomOperators } from "../../src/targeting/custom-operators";
import { eventMatchesCriteria } from "../../src/targeting/event-matcher";

registerCustomOperators(jsonLogic);

// The golden vectors are the cross-SDK contract for the custom operators; the canonical copy and
// its README live in the analytics monorepo. Cases run through jsonLogic.apply so that operator
// registration is covered alongside the comparison itself.
var TEST_DATA = path.join(__dirname, `test-data`);

// 2026-07-16T00:00:00Z, as epoch milliseconds.
var JUL16_MS = 1784160000000;

// The property key the vectors are evaluated against. It is plumbing the test supplies, so any name
// works as long as the rule and the data agree on it.
var VECTOR_KEY = `value`;

function varNode(key) {
  return { var: key };
}

function semverRule(key, sym, target) {
  return { semver_compare: [varNode(key), sym, target] };
}

function datetimeRule(key, sym, target) {
  return { datetime_compare: [varNode(key), sym, target] };
}

// Build the event the rule reads from, omitting the key entirely for an unset property.
function dataFor(subject) {
  var data = {};
  if (subject !== null) {
    data[VECTOR_KEY] = subject;
  }
  return data;
}

// Read a golden-vector file. String entries are headings, array entries are cases.
function loadVectors(operator, buildRule) {
  var entries = JSON.parse(
    fs.readFileSync(path.join(TEST_DATA, operator + `_compare_tests.json`), `utf8`)
  );

  var section = ``;
  var cases = [];
  entries.forEach(function (entry, index) {
    if (typeof entry === `string`) {
      section = entry;
      return;
    }
    var subject = entry[0];
    var symbol = entry[1];
    var target = entry[2];
    cases.push({
      name:
        index +
        ` ` +
        section +
        `: ` +
        JSON.stringify(subject) +
        ` ` +
        symbol +
        ` ` +
        JSON.stringify(target),
      rule: buildRule(VECTOR_KEY, symbol, target),
      data: dataFor(subject),
      want: entry[3],
    });
  });
  return cases;
}

function runCases(cases) {
  cases.forEach(function (tc) {
    it(tc.name, function () {
      expect(jsonLogic.apply(tc.rule, tc.data)).to.equal(tc.want);
    });
  });
}

describe(`custom JsonLogic operators`, function () {
  describe(`semver_compare`, function () {
    runCases(loadVectors(`semver`, semverRule));
  });

  describe(`datetime_compare`, function () {
    runCases(loadVectors(`datetime`, datetimeRule));
  });

  // An unset property must produce an event with no key at all, rather than a key holding a null.
  // Both spellings fail closed, so the vectors alone cannot tell them apart.
  it(`omits the property for an unset subject`, function () {
    expect(dataFor(null)).to.deep.equal({});
    expect(dataFor(`1.2.3`)).to.deep.equal({ value: `1.2.3` });
  });

  describe(`eventMatchesCriteria integration`, function () {
    it(`matches a semver property filter`, function () {
      var criteria = {
        event_name: `Signup`,
        property_filters: semverRule(`app_version`, `>=`, `1.2.3`),
      };
      expect(eventMatchesCriteria(`Signup`, { app_version: `1.5.0` }, criteria).matches).to.equal(true);
      expect(eventMatchesCriteria(`Signup`, { app_version: `1.0.0` }, criteria).matches).to.equal(false);
    });

    it(`matches a datetime property filter with an RFC3339 subject`, function () {
      var criteria = {
        event_name: `Signup`,
        property_filters: datetimeRule(`signup`, `<`, JUL16_MS),
      };
      expect(eventMatchesCriteria(`Signup`, { signup: `2026-07-15T00:00:00Z` }, criteria).matches).to.equal(true);
      expect(eventMatchesCriteria(`Signup`, { signup: `2026-07-17T00:00:00Z` }, criteria).matches).to.equal(false);
    });

    it(`fails closed on an unparseable semver subject`, function () {
      var criteria = {
        event_name: `Signup`,
        property_filters: semverRule(`app_version`, `===`, `1.2.3`),
      };
      expect(eventMatchesCriteria(`Signup`, { app_version: `not-a-version` }, criteria).matches).to.equal(false);
    });
  });
});
