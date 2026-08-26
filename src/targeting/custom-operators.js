// Strict RFC3339 guard for datetime strings. The date and hour fields are captured so the calendar
// can be validated separately; the regex only constrains their shape.
var RFC3339_REGEX = /^(\d{4})-(\d{2})-(\d{2})[Tt](\d{2}):\d{2}:\d{2}(\.\d+)?([Zz]|[+-]\d{2}:\d{2})$/;

// SemVer 2.0.0 requires major.minor.patch; partial versions are zero-padded to this.
var SEMVER_PARTS = 3;

// Longest operand the semver regex is allowed to see. A real version never approaches this; the
// bound matches MAX_LENGTH in node-semver, and keeps an arbitrarily long property value off the
// regex regardless of how the engine schedules backtracking.
var MAX_SEMVER_LENGTH = 256;

// Epoch milliseconds are compared as int64 elsewhere, so anything at or beyond this is out of range.
var MAX_EPOCH_MS = 9223372036854775808;

// Using the official semantic versioning 2.0.0 regular expression to handle cross-platform validation
// differences on other SDK's. For example, some platforms allow leading zeros even though it is not valid
// as part of the Semver 2.0.0 spec. See https://semver.org/
var SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

// Registers custom operators into the JSONLogic engine.
// 1. Semantic Versioning 2.0.0 comparison
// 2. RFC3339 datetime comparison
function registerCustomOperators(jsonLogic) {
    jsonLogic.add_operation('semver_compare', semverCompare);
    jsonLogic.add_operation('datetime_compare', datetimeCompare);
}

// Implements a custom operation for semantic versioning comparison that conforms to the semver 2.0.0 standard.
// Prior to comparison, any leading version prefix is stripped.
function semverCompare() {
    var ops = operands(arguments);
    if (!ops) {
        return false;
    }
    if (typeof ops.actual !== 'string' || typeof ops.target !== 'string') {
        return false;
    }
    if (ops.actual.length > MAX_SEMVER_LENGTH || ops.target.length > MAX_SEMVER_LENGTH) {
        return false;
    }
    var actual = normalizeSemver(ops.actual);
    var target = normalizeSemver(ops.target);
    if (!SEMVER_REGEX.test(actual) || !SEMVER_REGEX.test(target)) {
        return false;
    }
    var cmp = compareSemver(actual, target);
    return comparatorMatches(cmp, ops.symbol);
}

// Strip optional build metadata and separate the core version from pre-release identifiers
function splitSemver(version) {
    var plus = version.indexOf('+');
    if (plus !== -1) {
        version = version.slice(0, plus);
    }
    var dash = version.indexOf('-');
    if (dash === -1) {
        return {core: version.split('.'), prerelease: []};
    }
    return {core: version.slice(0, dash).split('.'), prerelease: version.slice(dash + 1).split('.')};
}

function isNumericIdentifier(identifier) {
    return /^[0-9]+$/.test(identifier);
}

// Numeric identifiers carry no leading zeros, so the longer run of digits is the larger number.
// Comparing them as digits rather than as numbers keeps versions past Number.MAX_SAFE_INTEGER ordered
// correctly.
function compareNumeric(a, b) {
    if (a.length !== b.length) {
        return a.length < b.length ? -1 : 1;
    }
    return a < b ? -1 : (a > b ? 1 : 0);
}

// SemVer 2.0.0 section 11.4: digits compare numerically, a numeric identifier ranks below an
// alphanumeric one, and anything else compares by ASCII order.
function comparePrereleaseIdentifier(a, b) {
    var aNumeric = isNumericIdentifier(a);
    var bNumeric = isNumericIdentifier(b);
    if (aNumeric && bNumeric) {
        return compareNumeric(a, b);
    }
    if (aNumeric) {
        return -1;
    }
    if (bNumeric) {
        return 1;
    }
    return a < b ? -1 : (a > b ? 1 : 0);
}

// Ordering per SemVer 2.0.0 section 11. Both operands have already been normalized and matched against
// the official regex, so the core holds exactly three numeric identifiers and every prerelease field is
// well-formed; the split needs no error path.
function compareSemver(actualVersion, targetVersion) {
    var actual = splitSemver(actualVersion);
    var target = splitSemver(targetVersion);
    var i, result;

    for (i = 0; i < actual.core.length; i++) {
        result = compareNumeric(actual.core[i], target.core[i]);
        if (result !== 0) {
            return result;
        }
    }

    // A prerelease ranks below the release it belongs to (section 11.3).
    if (!actual.prerelease.length && !target.prerelease.length) {
        return 0;
    }
    if (!actual.prerelease.length) {
        return 1;
    }
    if (!target.prerelease.length) {
        return -1;
    }

    var shared = Math.min(actual.prerelease.length, target.prerelease.length);
    for (i = 0; i < shared; i++) {
        result = comparePrereleaseIdentifier(actual.prerelease[i], target.prerelease[i]);
        if (result !== 0) {
            return result;
        }
    }
    // Every field so far is equal, so the longer list wins (section 11.4.4).
    if (actual.prerelease.length !== target.prerelease.length) {
        return actual.prerelease.length < target.prerelease.length ? -1 : 1;
    }
    return 0;
}

// Implements a custom operation for datetime comparison.
// The target value stored on the feature flag is the millisecond epoch, whereas the actual value provided at evaluation time must be RFC-3339 formatted.
function datetimeCompare() {
    var ops = operands(arguments);
    if (!ops) {
        return false;
    }
    var actualSec = convertRfc3339ToUnixSeconds(ops.actual);
    var targetSec = convertUnixMillisecondsToSeconds(ops.target);
    if (actualSec === null || targetSec === null) {
        return false;
    }
    var cmp = actualSec - targetSec;
    return comparatorMatches(cmp, ops.symbol);
}

function operands(args) {
    if (args.length !== 3) {
        return null;
    }
    return { actual: args[0], symbol: args[1], target: args[2] };
}

function comparatorMatches(cmp, symbol) {
    switch (symbol) {
        case '===':
            return cmp === 0;
        case '!==':
            return cmp !== 0;
        case '<':
            return cmp < 0;
        case '<=':
            return cmp <= 0;
        case '>':
            return cmp > 0;
        case '>=':
            return cmp >= 0;
        default:
            return false;
    }
}

function normalizeSemver(version) {
    var stripped = version.trim().replace(/^[vV]/, '');

    var suffixStart = stripped.length;
    var separators = ['-', '+'];
    for (var i = 0; i < separators.length; i++) {
        var index = stripped.indexOf(separators[i]);
        if (index !== -1 && index < suffixStart) {
            suffixStart = index;
        }
    }

    var core = stripped.slice(0, suffixStart);
    var suffix = stripped.slice(suffixStart);

    var parts = core.split('.');
    while (parts.length < SEMVER_PARTS) {
        parts.push('0');
    }
    return parts.join('.') + suffix;
}

// The regex constrains each field to two digits, which still admits a date that cannot exist, such as
// 2026-02-30 or 29 February in a common year. Writing the fields into a Date and reading them back
// settles it: out-of-range fields are normalized into a real instant, so a date that does not exist
// comes back carrying different fields than it went in with. The three-argument setUTCFullYear sets
// all three at once, which judges 29 February against the year given rather than a placeholder, and
// leaves years 0 through 99 alone where Date.UTC would map them into the 1900s. The hour is checked
// separately because it is not part of the round trip; RFC 3339 section 5.6 allows hours 00 through 23.
function isRealCalendarDate(year, month, day, hour) {
    if (hour > 23) {
        return false;
    }
    var dt = new Date();
    dt.setUTCFullYear(year, month - 1, day);
    return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

function convertRfc3339ToUnixSeconds(v) {
    if (typeof v !== 'string') {
        return null;
    }
    var normalized = v.trim().toUpperCase();
    var fields = RFC3339_REGEX.exec(normalized);
    if (!fields) {
        return null;
    }
    if (!isRealCalendarDate(Number(fields[1]), Number(fields[2]), Number(fields[3]), Number(fields[4]))) {
        return null;
    }
    var parsed = new Date(normalized);
    var ms = parsed.getTime();
    if (isNaN(ms)) {
        return null;
    }
    return Math.floor(ms / 1000);
}

function convertUnixMillisecondsToSeconds(v) {
    if (typeof v !== 'number' || !isFinite(v)) {
        return null;
    }
    // A value int64 cannot represent is not a real timestamp; treating one as a bound would let a
    // nonsense target define a rollout window.
    if (v >= MAX_EPOCH_MS || v <= -MAX_EPOCH_MS) {
        return null;
    }
    return truncate(v / 1000);
}

function truncate(n) {
    return n < 0 ? Math.ceil(n) : Math.floor(n);
}

export {
    registerCustomOperators,
    semverCompare,
    datetimeCompare
};
