// Public API for targeting module
// Note: event-matcher functions are now only available through the targeting bundle,
// not as direct imports. This prevents json-logic-js from being bundled in the main build.

export {
    initTargetingPromise,
    getTargeting,
    resetTargeting
} from './loader';
