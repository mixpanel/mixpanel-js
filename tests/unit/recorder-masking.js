import { expect } from 'chai';

import { getPrivacyConfig, shouldMaskInput, shouldMaskText } from '../../src/recorder/masking';
import jsdomSetup from './jsdom-setup';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';

describe(`Recorder utility functions`, function() {
  jsdomSetup();

  describe(`getPrivacyConfig`, function() {
    it(`should return default privacy config when no config is set`, function() {
      const mockMixpanel = new MockMixpanelLib();

      const config = getPrivacyConfig(mockMixpanel);

      expect(config).to.deep.equal({
        input: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        },
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        }
      });
    });

    it(`migrating from previous config: maskAllText should be false if only record_mask_text_selector is specified`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_selector: [`.mask-me`]
      });

      const config = getPrivacyConfig(mockMixpanel);
      expect(config.text.maskAll).to.be.false;
    });

    it(`should use config options when provided`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_input_selector: [`.mask-me`],
        record_unmask_input_selector: [`.unmask-me`],
        record_mask_text_selector: [`.hide-text`],
        record_unmask_text_selector: [`.show-text`]
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.input.maskingSelector).to.equal(`.mask-me`);
      expect(config.input.unmaskingSelector).to.equal(`.unmask-me`);
      expect(config.text.maskingSelector).to.equal(`.hide-text`);
      expect(config.text.unmaskingSelector).to.equal(`.show-text`);
    });

    it(`should support string selector`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_selector: `.legacy-mask`
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text.maskingSelector).to.equal(`.legacy-mask`);
    });

    it(`should support array of selectors and join them`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_selector: [`.mask-1`, `.mask-2`],
        record_unmask_text_selector: [`.unmask-1`, `.unmask-2`]
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text.maskingSelector).to.equal(`.mask-1,.mask-2`);
      expect(config.text.unmaskingSelector).to.equal(`.unmask-1,.unmask-2`);
    });

    it(`should migrate legacy record_mask_text_class config (string)`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_class: `mp-mask`
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text.maskingSelector).to.equal(`.mp-mask`);
    });

    it(`should migrate legacy record_mask_text_class config (RegExp)`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_class: /^mp-mask$/
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text._legacyClassRegex).to.be.instanceof(RegExp);
      expect(config.text._legacyClassRegex.test(`mp-mask`)).to.be.true;
    });

    it(`should merge mask class with selectors`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_text_selector: `.new-mask`,
        record_mask_text_class: `legacy-class`
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text.maskingSelector).to.equal(`.new-mask,.legacy-class`);
      expect(config.text._legacyClassRegex).to.be.undefined;
    });

    it(`should respect mask_all_inputs config`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_all_inputs: false
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.input.maskAll).to.be.false;
    });

    it(`should respect mask_all_text config`, function() {
      const mockMixpanel = new MockMixpanelLib({
        record_mask_all_text: false
      });

      const config = getPrivacyConfig(mockMixpanel);

      expect(config.text.maskAll).to.be.false;
    });
  });

  describe(`shouldMaskInput`, function() {
    [`password`, `email`, `tel`, `hidden`].forEach((inputType) => {
      it(`should always mask ${inputType} inputs`, function() {
        const input = document.createElement(`input`);
        input.type = inputType;

        const config = {
          input: {
            maskingSelector: `.some-selector`,
            unmaskingSelector: ``,
            maskAll: true
          }
        };

        expect(shouldMaskInput(input, config)).to.be.true;
      });
    });

    it(`should mask inputs with autocomplete attribute`, function() {
      const input = document.createElement(`input`);
      input.type = `text`;
      input.setAttribute(`autocomplete`, `name`);

      const config = {
        input: {
          maskingSelector: `.some-selector`,
          unmaskingSelector: ``,
          maskAll: true
        }
      };

      expect(shouldMaskInput(input, config)).to.be.true;
    });

    it(`should mask inputs with data-rr-is-password attribute`, function() {
      const input = document.createElement(`input`);
      input.type = `text`;
      input.setAttribute(`data-rr-is-password`, `true`);

      const config = {
        input: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        }
      };

      expect(shouldMaskInput(input, config)).to.be.true;
    });

    it(`should mask all inputs by default when maskAll is true`, function() {
      const input = document.createElement(`input`);
      input.type = `text`;

      const config = {
        input: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        }
      };

      expect(shouldMaskInput(input, config)).to.be.true;
    });

    it(`should unmask inputs matching unmaskingSelector when maskAll is true`, function() {
      const container = document.createElement(`div`);
      container.className = `public-form`;
      const input = document.createElement(`input`);
      input.type = `text`;
      container.appendChild(input);
      document.body.appendChild(container);

      const config = {
        input: {
          maskingSelector: ``,
          unmaskingSelector: `.public-form input`,
          maskAll: true
        }
      };

      expect(shouldMaskInput(input, config)).to.be.false;

      document.body.removeChild(container);
    });

    it(`should not mask inputs by default when maskAll is false`, function() {
      const input = document.createElement(`input`);
      input.type = `text`;

      const config = {
        input: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: false
        }
      };

      expect(shouldMaskInput(input, config)).to.be.false;
    });

    it(`should mask inputs matching maskingSelector when maskAll is false`, function() {
      const container = document.createElement(`div`);
      container.className = `sensitive-form`;
      const input = document.createElement(`input`);
      input.type = `text`;
      container.appendChild(input);
      document.body.appendChild(container);

      const config = {
        input: {
          maskingSelector: `.sensitive-form input`,
          unmaskingSelector: ``,
          maskAll: false
        }
      };

      expect(shouldMaskInput(input, config)).to.be.true;

      document.body.removeChild(container);
    });

    it(`should ignore unmaskingSelector for unmaskable input types`, function() {
      const input = document.createElement(`input`);
      input.type = `hidden`;
      input.id = `safe-input`;

      const config = {
        input: {
          maskingSelector: ``,
          unmaskingSelector: `#safe-input`,
          maskAll: true
        }
      };

      expect(shouldMaskInput(input, config)).to.be.true;
    });
  });

  describe(`shouldMaskText`, function() {
    it(`should mask all text by default when maskAll is true`, function() {
      const div = document.createElement(`div`);
      div.textContent = `Hello world`;

      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        }
      };

      expect(shouldMaskText(div, config)).to.be.true;
    });

    it(`should not mask text by default when maskAll is false`, function() {
      const div = document.createElement(`div`);
      div.textContent = `Hello world`;

      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: false
        }
      };

      expect(shouldMaskText(div, config)).to.be.false;
    });

    it(`should return false for null element`, function() {
      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: true
        }
      };

      expect(shouldMaskText(null, config)).to.be.false;
    });

    it(`should unmask text matching unmaskingSelector when maskAll is true`, function() {
      const container = document.createElement(`div`);
      container.className = `public-content`;
      const span = document.createElement(`span`);
      span.textContent = `Public data`;
      container.appendChild(span);
      document.body.appendChild(container);

      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: `.public-content`,
          maskAll: true
        }
      };

      expect(shouldMaskText(container, config)).to.be.false;

      document.body.removeChild(container);
    });

    it(`should mask text matching maskingSelector when maskAll is false`, function() {
      const container = document.createElement(`div`);
      container.className = `sensitive-info`;
      const span = document.createElement(`span`);
      span.textContent = `Secret data`;
      container.appendChild(span);
      document.body.appendChild(container);

      const config = {
        text: {
          maskingSelector: `.sensitive-info`,
          unmaskingSelector: ``,
          maskAll: false
        }
      };

      expect(shouldMaskText(span, config)).to.be.true;

      document.body.removeChild(container);
    });

    it(`should mask text with legacy class regex`, function() {
      const div = document.createElement(`div`);
      div.className = `mp-mask`;
      div.textContent = `Masked content`;
      document.body.appendChild(div);

      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: false,
          _legacyClassRegex: /^mp-mask$/
        }
      };

      expect(shouldMaskText(div, config)).to.be.true;

      document.body.removeChild(div);
    });

    it(`should mask text with legacy class regex on parent`, function() {
      const parent = document.createElement(`div`);
      parent.className = `mp-mask`;
      const child = document.createElement(`span`);
      child.textContent = `Child content`;
      parent.appendChild(child);
      document.body.appendChild(parent);

      const config = {
        text: {
          maskingSelector: ``,
          unmaskingSelector: ``,
          maskAll: false,
          _legacyClassRegex: /^mp-mask$/
        }
      };

      expect(shouldMaskText(child, config)).to.be.true;

      document.body.removeChild(parent);
    });

    [`mp-mask`, `fs-mask`, `amp-mask`, `rr-mask`, `ph-mask`].forEach((className) => {
      it(`should mask text with common mask class ${className} when maskAll is false`, function() {
        const div = document.createElement(`div`);
        div.className = className;
        div.textContent = `Masked content`;
        document.body.appendChild(div);

        const config = {
          text: {
            maskingSelector: ``,
            unmaskingSelector: ``,
            maskAll: false
          }
        };

        expect(shouldMaskText(div, config)).to.be.true;

        document.body.removeChild(div);
      });
    });

    [`mp-mask`, `fs-mask`, `amp-mask`, `rr-mask`, `ph-mask`].forEach((className) => {
      it(`should mask input with common mask class ${className} when maskAll is false`, function() {
        const input = document.createElement(`input`);
        input.type = `text`;
        input.className = className;
        document.body.appendChild(input);

        const config = {
          input: {
            maskingSelector: ``,
            unmaskingSelector: ``,
            maskAll: false
          }
        };

        expect(shouldMaskInput(input, config)).to.be.true;

        document.body.removeChild(input);
      });
    });
  });
});
