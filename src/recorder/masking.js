/**
 * @typedef {Object} MaskingConfig
 * @property {string} maskingSelector - Combined CSS selector string to mask
 * @property {string} unmaskingSelector - Combined CSS selector string to unmask
 * @property {boolean} maskAll - Whether to mask all by default
 * @property {RegExp} [_legacyClassRegex] - Legacy class regex for backwards compatibility
 */

/**
 * @typedef {Object} PrivacyConfig
 * @property {MaskingConfig} input - Input masking configuration
 * @property {MaskingConfig} text - Text masking configuration
 */

import { classMatchesRegex } from './rrweb-entrypoint';
import { elementLooksSensitive } from '../autocapture/utils';

var COMMON_MASK_CLASSES_SELECTOR = '.mp-mask, .fs-mask, .amp-mask, .rr-mask, .ph-mask';
var RRWEB_PASSWORD_ATTRIBUTE = 'data-rr-is-password';
var ALWAYS_MASKED_INPUT_TYPES = ['password', 'email', 'tel', 'hidden'];

/**
 * Normalizes a selector value to an array of selectors
 * @param {string|string[]|undefined} selector
 * @returns {string[]}
 */
function normalizeSelectors(selector) {
    if (!selector) {
        return [];
    }
    if (Array.isArray(selector)) {
        return selector;
    }
    return [selector];
}

/**
 * Reads flat config options and normalizes them into internal privacy config structure
 * @param {Object} mixpanelInstance
 * @returns {PrivacyConfig} privacyConfig
 */
function getPrivacyConfig(mixpanelInstance) {
    var privacyConfig = {
        input: {
            maskingSelector: '',
            unmaskingSelector: '',
            maskAll: true
        },
        text: {
            maskingSelector: '',
            unmaskingSelector: '',
            maskAll: true
        }
    };

    // Input related config
    var maskInputSelector = mixpanelInstance.get_config('record_mask_input_selector');
    var unmaskInputSelector = mixpanelInstance.get_config('record_unmask_input_selector');
    var maskAllInputs = mixpanelInstance.get_config('record_mask_all_inputs');

    privacyConfig.input.maskingSelector = normalizeSelectors(maskInputSelector).join(',');
    privacyConfig.input.unmaskingSelector = normalizeSelectors(unmaskInputSelector).join(',');
    if (maskAllInputs !== undefined) {
        privacyConfig.input.maskAll = maskAllInputs;
    }

    // Text related config
    var maskTextSelector = mixpanelInstance.get_config('record_mask_text_selector');
    var unmaskTextSelector = mixpanelInstance.get_config('record_unmask_text_selector');
    var maskAllText = mixpanelInstance.get_config('record_mask_all_text');
    var legacyMaskTextClass = mixpanelInstance.get_config('record_mask_text_class');

    var textMaskingSelectors = normalizeSelectors(maskTextSelector);

    // Handle legacy record_mask_text_class
    if (legacyMaskTextClass) {
        if (legacyMaskTextClass instanceof RegExp) {
            // For RegExp classes, we'll need to handle this differently in the shouldMaskText function
            privacyConfig.text._legacyClassRegex = legacyMaskTextClass;
        } else {
            // String class name - convert to selector
            var classSelector = '.' + legacyMaskTextClass;
            if (textMaskingSelectors.indexOf(classSelector) === -1) {
                textMaskingSelectors.push(classSelector);
            }
        }
    }

    privacyConfig.text.maskingSelector = textMaskingSelectors.join(',');
    privacyConfig.text.unmaskingSelector = normalizeSelectors(unmaskTextSelector).join(',');

    // Migrate old config: if only record_mask_text_selector is specified, set maskAll to false
    // preserves behavior where the masking selector defaulted to "*"
    if (maskAllText === undefined && maskTextSelector !== undefined) {
        privacyConfig.text.maskAll = false;
    } else if (maskAllText !== undefined) {
        privacyConfig.text.maskAll = maskAllText;
    }

    return privacyConfig;
}

/**
 * Checks if element matches a combined CSS selector
 * @param {HTMLElement} element
 * @param {string} selector - Combined CSS selector (comma-separated)
 * @returns {boolean}
 */
function elementMatchesSelector(element, selector) {
    if (!selector) {
        return false;
    }
    return !!element.closest(selector);
}

/**
 * Determines if an input should be masked based on privacy config
 * @param {HTMLElement} element
 * @param {PrivacyConfig} privacyConfig
 * @returns {boolean}
 */
function shouldMaskInput(element, privacyConfig) {
    var inputType = (element.getAttribute('type') || '').toLowerCase();
    if (ALWAYS_MASKED_INPUT_TYPES.indexOf(inputType) !== -1) {
        return true;
    }

    var autocomplete = (element.getAttribute('autocomplete') || '').toLowerCase();
    if (autocomplete && autocomplete !== '' && autocomplete !== 'off') {
        return true;
    }

    if (element.hasAttribute(RRWEB_PASSWORD_ATTRIBUTE)) {
        return true;
    }

    if (elementLooksSensitive(element)) {
        return true;
    }

    if (privacyConfig.input.maskAll) {
        if (elementMatchesSelector(element, privacyConfig.input.unmaskingSelector)) {
            return false;
        }

        return true;
    } else {
        if (elementMatchesSelector(element, privacyConfig.input.maskingSelector)) {
            return true;
        }
        if (elementMatchesSelector(element, COMMON_MASK_CLASSES_SELECTOR)) {
            return true;
        }
        return false;
    }
}

/**
 * Determines if text should be masked based on privacy config
 * @param {HTMLElement|null} element
 * @param {PrivacyConfig} privacyConfig
 * @returns {boolean}
 */
function shouldMaskText(element, privacyConfig) {
    if (!element) {
        return false;
    }

    // Check legacy class regex if present (for backwards compatibility)
    if (privacyConfig.text._legacyClassRegex) {
        if (classMatchesRegex(element, privacyConfig.text._legacyClassRegex, true)) {
            return true;
        }
    }

    if (privacyConfig.text.maskAll) {
        if (elementMatchesSelector(element, privacyConfig.text.unmaskingSelector)) {
            return false;
        }
        return true;
    } else {
        if (elementMatchesSelector(element, privacyConfig.text.maskingSelector)) {
            return true;
        }
        if (elementMatchesSelector(element, COMMON_MASK_CLASSES_SELECTOR)) {
            return true;
        }
        return false;
    }
}

export {
    COMMON_MASK_CLASSES_SELECTOR,
    getPrivacyConfig,
    shouldMaskInput,
    shouldMaskText
};
