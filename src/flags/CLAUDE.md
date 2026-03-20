# Flags Module

## Testing
- Test runner is **mocha** (not jest): `BABEL_ENV=test npx mocha --require babel-core/register tests/unit/flags.js`
- Unit tests live in `tests/unit/flags.js`

## Code style
- ES5 prototypal classes — no arrow functions, no ES6 classes
- Use `.bind(this)` for `this` context in promise `.then()` / `.catch()` callbacks
- Flat promise chains preferred over nested `.then()` inside `.then()`

## Public API pattern
- Snake-case aliases are registered at the bottom of `index.js` (e.g., `prototype['load_flags'] = prototype.loadFlags`)
- New public methods need both the camelCase implementation and a snake_case alias

## Error handling convention
- `fetchFlags()` always rejects on error (single `.catch` that logs and re-throws)
- Fire-and-forget callers (`init`, `updateContext`, `mixpanel-core.js` identify call) swallow errors at the call site with `.catch(function() {})`
- User-facing methods like `loadFlags` propagate rejections so the caller can handle them

## Key files
- `src/flags/index.js` — `FeatureFlagManager` class (fetch, load, variants, first-time events)
- `src/mixpanel-core.js` — calls `fetchFlags()` on distinct_id change (~line 1764)
- `tests/unit/flags.js` — all flag unit tests
