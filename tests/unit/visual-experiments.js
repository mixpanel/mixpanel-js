import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import jsdomSetup from './jsdom-setup';

chai.use(sinonChai);

const PAGE_URL = `http://localhost/pricing`;

const changes = [
  { type: `setAttribute`, selector: `.cta`, attribute: `data-variant`, value: `B` },
  { type: `setStyle`, selector: `.cta`, property: `color`, value: `red` },
];
const otherChanges = [{ type: `hide`, selector: `.banner` }];
const preview = [{ type: `setText`, selector: `h1`, value: `Preview headline` }];

const treatment = (experimentId, visualChanges = changes, url = PAGE_URL) => ({
  key: `B`,
  experiment_id: experimentId,
  value: { $mp: { url, visualChanges } },
});
const control = (experimentId, url = PAGE_URL) => ({
  key: `control`,
  experiment_id: experimentId,
  value: { $mp: { url, visualChanges: [] } },
});
// Both arms of one flag carry the same cross-variant $mp.exposureSelectors.
const withSelectors = (variant, exposureSelectors) => Object.assign({}, variant, {
  value: { $mp: Object.assign({}, variant.value.$mp, { exposureSelectors }) },
});
const variants = (entries) => new Map(Object.entries(entries));
// The variant as reported: a copy carrying the page url it matched on.
const reportedVariant = (variant, matchedUrl = PAGE_URL) => Object.assign({}, variant, { matched_url: matchedUrl });

const IGNORED_PARAM_KEYS = [`mp_preview_token`, `utm_*`, `gclid`, `fbclid`, `msclkid`];
const patternTarget = (value, overrides = {}) => Object.assign({
  version: 1,
  url: { type: `pattern`, value },
  query: null,
  hash: null,
  ignoredParamKeys: IGNORED_PARAM_KEYS,
}, overrides);
const targetedTreatment = (experimentId, target, url = PAGE_URL) => ({
  key: `B`,
  experiment_id: experimentId,
  value: { $mp: { url, target, visualChanges: changes } },
});

describe(`VisualExperimentsManager`, function () {
  let VisualExperimentsManager;
  let VisualChangeEngine;
  let manager;
  let config;
  let delivered;
  let apply;
  let revert;
  let settled;
  let track;

  const build = (overrides = {}) => new VisualExperimentsManager(Object.assign({
    getConfigFunc: (key) => config[key],
    getVariantsFunc: () => delivered,
    trackExposureFunc: track,
    applyVisualChangesFunc: apply,
    revertVisualChangesFunc: revert,
    onSettledFunc: settled,
  }, overrides));

  const navigate = (path) => global.window.history.pushState({}, ``, path);

  // Runs before jsdom teardown: clear the anti-flicker failsafe timer and the
  // navigation subscription of a manager that ran init().
  afterEach(function () {
    if (manager && manager._navTeardown) {
      manager._navTeardown();
    }
    if (manager && manager._antiFlicker) {
      manager._antiFlicker.reveal();
    }
  });

  jsdomSetup({
    url: PAGE_URL,
    // requestAnimationFrame is required by the engine.
    pretendToBeVisual: true,
    reImportModules: [
      `../../src/window`,
      `../../src/navigation`,
      `../../src/visual-experiments/engine`,
      `../../src/visual-experiments/anti-flicker`,
      `../../src/url-matching`,
      `../../src/visual-experiments/exposure-watcher`,
      `../../src/visual-experiments/index`,
    ],
    beforeCallback: (modules) => {
      VisualChangeEngine = modules[2].VisualChangeEngine;
      VisualExperimentsManager = modules[6].VisualExperimentsManager;
      config = { visual_experiments: true };
      delivered = new Map();
      apply = sinon.spy();
      revert = sinon.spy();
      settled = sinon.spy();
      track = sinon.spy();
      manager = build();
    },
    afterCallback: () => {
      sinon.restore();
    },
  });

  describe(`delivery`, function () {
    it(`forwards a matching variant's changes to the engine`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply).to.have.been.calledOnceWith(changes);
      expect(revert).to.not.have.been.called;
    });

    it(`concatenates changes across variants into a single apply`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: treatment(`exp2`, otherChanges) }));
      expect(apply).to.have.been.calledOnce;
      expect(apply.firstCall.args[0]).to.deep.equal(changes.concat(otherChanges));
    });

    it(`reverts instead of applying when no variant carries changes`, function () {
      manager.onFlagsDelivered(variants({ plain: { key: `A`, value: `plain-value`, experiment_id: `exp2` } }));
      expect(apply).to.not.have.been.called;
      expect(revert).to.have.been.calledOnce;
    });

    it(`ignores a delivery that is not a variant map`, function () {
      manager.onFlagsDelivered(null);
      manager.onFlagsDelivered({});
      expect(apply).to.not.have.been.called;
      expect(revert).to.not.have.been.called;
      expect(settled).to.not.have.been.called;
    });

    it(`stays a no-op without engine hooks`, function () {
      manager = build({ applyVisualChangesFunc: undefined, revertVisualChangesFunc: undefined, onSettledFunc: undefined });
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      manager.onFlagsDelivered(variants({}));
    });

    describe(`payload size cap`, function () {
      // One giant value pushes a variant's serialized changes past the 32K cap.
      const huge = [{ type: `setAttribute`, selector: `.cta`, attribute: `data-x`, value: new Array(40 * 1024).join(`a`) }];
      // Two variants that each fit under the cap but exceed it together.
      const half = () => [{ type: `setText`, selector: `.cta`, value: new Array(20 * 1024).join(`b`) }];

      it(`skips an oversized variant and still applies the others`, function () {
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`, huge), b: treatment(`exp2`, otherChanges) }));
        expect(apply).to.have.been.calledOnceWith(otherChanges);
      });

      it(`reverts when the only matching variant is oversized`, function () {
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`, huge) }));
        expect(apply).to.not.have.been.called;
        expect(revert).to.have.been.calledOnce;
      });

      it(`does not report an oversized variant`, function () {
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`, huge), b: treatment(`exp2`, otherChanges) }));
        expect(track).to.have.been.calledOnce;
        expect(track.firstCall.args[0]).to.equal(`b`);
      });

      it(`applies variants whose combined changes exceed the cap`, function () {
        const first = half();
        const second = half();
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`, first), b: treatment(`exp2`, second) }));
        expect(apply.firstCall.args[0]).to.deep.equal(first.concat(second));
      });

      it(`skips a variant whose changes cannot be serialized`, function () {
        const cyclic = [{ type: `setText`, selector: `.cta`, value: `x` }];
        cyclic[0].self = cyclic;
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`, cyclic), b: treatment(`exp2`, otherChanges) }));
        expect(apply).to.have.been.calledOnceWith(otherChanges);
      });

      it(`ignores an oversized editor preview and keeps the live changes`, function () {
        manager.onFlagsDelivered(variants({ b: treatment(`exp2`, otherChanges) }));
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(huge);
        expect(apply.lastCall.args[0]).to.deep.equal(otherChanges);
      });
    });
  });

  describe(`page scoping`, function () {
    it(`applies when origin and pathname match`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, changes, `http://localhost/pricing`) }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`applies ignoring query string and hash`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, changes, `http://localhost/pricing?utm=x#top`) }));
      expect(apply).to.have.been.calledOnce;
    });

    it(`applies ignoring a trailing slash difference`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, changes, `http://localhost/pricing/`) }));
      expect(apply).to.have.been.calledOnce;
    });

    it(`skips when the pathname differs`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, changes, `http://localhost/home`) }));
      expect(apply).to.not.have.been.called;
    });

    it(`skips when the origin differs`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, changes, `https://evil.test/pricing`) }));
      expect(apply).to.not.have.been.called;
    });

    it(`skips when no url is persisted`, function () {
      manager.onFlagsDelivered(variants({ a: { key: `B`, value: { $mp: { visualChanges: changes } } } }));
      expect(apply).to.not.have.been.called;
    });

    it(`aggregates only the variants whose url matches the current page`, function () {
      manager.onFlagsDelivered(variants({
        a: treatment(`exp1`),
        b: treatment(`exp2`, otherChanges, `http://localhost/other`),
      }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });
  });

  describe(`suppression`, function () {
    it(`skips a suppressed experiment and still applies the others`, function () {
      manager.suppressExperiment(`exp1`);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: treatment(`exp2`, otherChanges) }));
      expect(apply).to.have.been.calledOnceWith(otherChanges);
    });

    it(`reverts when the only matching experiment is suppressed`, function () {
      manager.suppressExperiment(`exp1`);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply).to.not.have.been.called;
      expect(revert).to.have.been.called;
    });

    it(`re-applies the delivered set at once when suppressing`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: treatment(`exp2`, otherChanges) }));
      delivered = variants({ a: treatment(`exp1`), b: treatment(`exp2`, otherChanges) });
      manager.suppressExperiment(`exp1`);
      expect(apply.lastCall.args[0]).to.deep.equal(otherChanges);

      apply.resetHistory();
      manager.suppressExperiment(`exp1`);
      expect(apply).to.not.have.been.called;
    });

    it(`treats a missing experiment id as a no-op`, function () {
      manager.suppressExperiment(null);
      manager.unsuppressExperiment(undefined);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply).to.have.been.calledOnce;
    });

    it(`applies again once the experiment is unsuppressed`, function () {
      manager.suppressExperiment(`exp1`);
      manager.unsuppressExperiment(`exp1`);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });
  });

  describe(`exposure reporting`, function () {
    // MutationObserver callbacks run as microtasks.
    const flushObservers = () => new Promise((resolve) => setTimeout(resolve, 0));
    const addElement = (className) => {
      const el = global.document.createElement(`div`);
      el.className = className;
      global.document.body.appendChild(el);
      return el;
    };
    const reportedKeys = () => track.getCalls().map((call) => call.args[0]);

    it(`reports the flag key and variant without waiting for the engine`, function () {
      const variant = treatment(`exp1`);
      manager.onFlagsDelivered(variants({ a: variant }));
      expect(track).to.have.been.calledOnceWith(`a`, reportedVariant(variant));
    });

    it(`reports the full matched page url, query string and hash included`, function () {
      navigate(`/pricing?plan=pro#faq`);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: control(`exp2`) }));
      const matchedUrls = track.getCalls().map((call) => call.args[1].matched_url);
      expect(matchedUrls).to.deep.equal([`${PAGE_URL}?plan=pro#faq`, `${PAGE_URL}?plan=pro#faq`]);
    });

    it(`reports the url the target matched on when the selector appears later`, async function () {
      navigate(`/pricing?plan=pro`);
      delivered = variants({ a: withSelectors(control(`exp1`), [`.hero`]) });
      manager.onFlagsDelivered(delivered);
      // A query-only change leaves the matched set unchanged, so nothing re-applies.
      navigate(`/pricing?plan=team`);
      manager.applyForCurrentPage();

      const el = global.document.createElement(`div`);
      el.className = `hero`;
      global.document.body.appendChild(el);
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(track).to.have.been.calledOnce;
      expect(track.firstCall.args[1].matched_url).to.equal(`${PAGE_URL}?plan=pro`);
    });

    it(`redacts the preview token from the matched page url`, function () {
      navigate(`/pricing?mp_preview_token=secret&plan=pro`);
      manager.onFlagsDelivered(variants({ a: control(`exp1`) }));
      expect(track.firstCall.args[1].matched_url).to.equal(`${PAGE_URL}?mp_preview_token=REDACTED&plan=pro`);
    });

    it(`does not modify the delivered variant`, function () {
      const variant = control(`exp1`);
      manager.onFlagsDelivered(variants({ a: variant }));
      expect(variant).to.not.have.property(`matched_url`);
    });

    it(`reports a treatment once however many of its mutations it carries`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply.firstCall.args[0]).to.have.length(2);
      expect(track).to.have.been.calledOnce;
    });

    it(`reports a flag whose key is an inherited object property name`, function () {
      manager.onFlagsDelivered(variants({ constructor: treatment(`exp1`), toString: treatment(`exp2`, otherChanges) }));
      expect(reportedKeys()).to.deep.equal([`constructor`, `toString`]);
    });

    it(`does not report variants without visual changes`, function () {
      manager.onFlagsDelivered(variants({ plain: { key: `A`, value: `plain-value`, experiment_id: `exp2` } }));
      expect(track).to.not.have.been.called;
    });

    it(`does not report a suppressed experiment`, function () {
      manager.suppressExperiment(`exp1`);
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: control(`exp2`) }));
      expect(track).to.have.been.calledOnceWith(`b`, sinon.match.object);
    });

    it(`does not report anything when visual experiments are disabled`, function () {
      config.visual_experiments = false;
      // The engine is never wired when disabled, so nothing is ever applied.
      manager = build({ applyVisualChangesFunc: undefined });
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: control(`exp2`) }));
      expect(track).to.not.have.been.called;
    });

    it(`keeps delivering when the tracker throws`, function () {
      manager = build({ trackExposureFunc: sinon.stub().throws(new Error(`before_track blew up`)) });
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: control(`exp2`) }));
      expect(apply).to.have.been.calledOnce;
      expect(settled).to.have.been.calledOnce;
    });

    describe(`controls (a url but no changes)`, function () {
      it(`reports once the page is matched, without an apply`, function () {
        const variant = control(`exp1`);
        manager.onFlagsDelivered(variants({ a: variant }));
        expect(apply).to.not.have.been.called;
        expect(track).to.have.been.calledOnceWith(`a`, reportedVariant(variant));
      });

      it(`still settles`, function () {
        manager.onFlagsDelivered(variants({ a: control(`exp1`) }));
        expect(settled).to.have.been.calledOnce;
      });

      it(`does not report when the pathname differs`, function () {
        manager.onFlagsDelivered(variants({ a: control(`exp1`, `http://localhost/home`) }));
        expect(track).to.not.have.been.called;
      });

      it(`does not report when no url is persisted`, function () {
        manager.onFlagsDelivered(variants({ a: { key: `control`, value: { $mp: { visualChanges: [] } } } }));
        expect(track).to.not.have.been.called;
      });

      it(`reports alongside a treatment applied on the same page`, function () {
        manager.onFlagsDelivered(variants({ a: treatment(`exp1`), b: control(`exp2`) }));
        expect(reportedKeys()).to.deep.equal([`a`, `b`]);
      });

      it(`does not report a suppressed control`, function () {
        manager.suppressExperiment(`exp1`);
        manager.onFlagsDelivered(variants({ a: control(`exp1`) }));
        expect(track).to.not.have.been.called;
      });
    });

    describe(`exposure selectors ($mp.exposureSelectors)`, function () {
      const arms = {
        treatment: (selectors) => withSelectors(treatment(`exp1`), selectors),
        control: (selectors) => withSelectors(control(`exp1`), selectors),
      };

      Object.keys(arms).forEach((arm) => {
        describe(`for the ${arm}`, function () {
          it(`reports at once when a selector is present`, function () {
            addElement(`hero`);
            manager.onFlagsDelivered(variants({ a: arms[arm]([`.missing`, `.hero`]) }));
            expect(reportedKeys()).to.deep.equal([`a`]);
          });

          it(`does not report while no selector is present`, async function () {
            manager.onFlagsDelivered(variants({ a: arms[arm]([`.hero`]) }));
            addElement(`unrelated`);
            await flushObservers();
            expect(track).to.not.have.been.called;
            expect(settled).to.have.been.calledOnce;
          });

          it(`reports once a selector appears later`, async function () {
            manager.onFlagsDelivered(variants({ a: arms[arm]([`.hero`]) }));
            expect(track).to.not.have.been.called;

            addElement(`hero`);
            await flushObservers();
            expect(reportedKeys()).to.deep.equal([`a`]);
          });

          it(`reports once an existing element starts matching a selector`, async function () {
            const el = addElement(`plain`);
            manager.onFlagsDelivered(variants({ a: arms[arm]([`.hero`]) }));
            el.className = `hero`;
            await flushObservers();
            expect(reportedKeys()).to.deep.equal([`a`]);
          });

          it(`reports on page match when the selector list is empty`, function () {
            manager.onFlagsDelivered(variants({ a: arms[arm]([]) }));
            expect(reportedKeys()).to.deep.equal([`a`]);
          });

          it(`reports once however often the selector re-renders`, async function () {
            manager.onFlagsDelivered(variants({ a: arms[arm]([`.hero`]) }));
            addElement(`hero`);
            await flushObservers();
            addElement(`hero`);
            await flushObservers();
            expect(track).to.have.been.calledOnce;
          });
        });
      });

      it(`counts both arms on the same pages`, async function () {
        // Two visitors' managers on the same page: one in each arm.
        const controlTrack = sinon.spy();
        const controlManager = build({ trackExposureFunc: controlTrack });
        manager.onFlagsDelivered(variants({ a: arms.treatment([`.hero`]) }));
        controlManager.onFlagsDelivered(variants({ a: arms.control([`.hero`]) }));
        expect(track).to.not.have.been.called;
        expect(controlTrack).to.not.have.been.called;

        addElement(`hero`);
        await flushObservers();
        expect(track).to.have.been.calledOnce;
        expect(controlTrack).to.have.been.calledOnce;
      });

      describe(`with the real engine`, function () {
        const removeHero = [{ type: `setClasses`, selector: `.hero`, add: [`hero-b`], remove: [`hero`] }];
        const nextFrame = () => new Promise((resolve) => global.window.requestAnimationFrame(() => resolve()));
        const buildWithEngine = (trackExposureFunc) => {
          const engine = new VisualChangeEngine();
          return build({
            trackExposureFunc,
            applyVisualChangesFunc: (mutations) => engine.applyVisualChanges(mutations),
            revertVisualChangesFunc: () => engine.revertVisualChanges(),
          });
        };
        const engineArms = {
          treatment: withSelectors(treatment(`exp1`, removeHero), [`.hero`]),
          control: withSelectors(control(`exp1`), [`.hero`]),
        };

        Object.keys(engineArms).forEach((arm) => {
          it(`reports the ${arm} when the treatment removes the selector's class from a present element`, function () {
            const el = addElement(`hero`);
            manager = buildWithEngine(track);
            manager.onFlagsDelivered(variants({ a: engineArms[arm] }));
            expect(reportedKeys()).to.deep.equal([`a`]);
            expect(el.classList.contains(`hero`)).to.equal(arm === `control`);
          });

          it(`reports the ${arm} when the treatment removes the selector's class from a late element`, async function () {
            manager = buildWithEngine(track);
            manager.onFlagsDelivered(variants({ a: engineArms[arm] }));
            expect(track).to.not.have.been.called;

            const el = addElement(`hero`);
            await flushObservers();
            await nextFrame();
            expect(reportedKeys()).to.deep.equal([`a`]);
            expect(el.classList.contains(`hero`)).to.equal(arm === `control`);
          });
        });

        it(`reports the treatment when the network re-delivers the treatment already applied from cache`, async function () {
          const el = addElement(`hero`);
          manager = buildWithEngine(track);
          manager.onFlagsDelivered(variants({ a: engineArms.treatment }));
          manager.onFlagsDelivered(variants({ a: engineArms.treatment }));
          await flushObservers();
          await nextFrame();
          expect(reportedKeys()).to.deep.equal([`a`, `a`]);
          expect(el.classList.contains(`hero`)).to.be.false;
        });

        it(`reports the control when it replaces a treatment that removed the selector's class`, async function () {
          const el = addElement(`hero`);
          manager = buildWithEngine(track);
          manager.onFlagsDelivered(variants({ a: engineArms.treatment }));
          manager.onFlagsDelivered(variants({ a: engineArms.control }));
          await flushObservers();
          await nextFrame();
          expect(reportedKeys()).to.deep.equal([`a`, `a`]);
          expect(track.secondCall.args[1].key).to.equal(`control`);
          expect(el.classList.contains(`hero`)).to.be.true;
        });
      });

      it(`waits per flag on that flag's own selectors`, async function () {
        manager.onFlagsDelivered(variants({
          a: withSelectors(treatment(`exp1`), [`.hero`]),
          b: withSelectors(control(`exp2`), [`.footer`]),
        }));
        addElement(`footer`);
        await flushObservers();
        expect(reportedKeys()).to.deep.equal([`b`]);
      });

      it(`reports a variant whose selector a tracking hook inserts while reporting an earlier one`, async function () {
        track = sinon.stub();
        track.onFirstCall().callsFake(() => addElement(`footer`));
        manager = build();
        addElement(`hero`);
        manager.onFlagsDelivered(variants({
          a: withSelectors(treatment(`exp1`), [`.hero`]),
          b: withSelectors(control(`exp2`), [`.footer`]),
        }));
        expect(reportedKeys()).to.deep.equal([`a`]);

        await flushObservers();
        expect(reportedKeys()).to.deep.equal([`a`, `b`]);
      });

      it(`ignores an invalid selector and still matches a valid one`, function () {
        addElement(`hero`);
        manager.onFlagsDelivered(variants({ a: arms.control([`[[invalid`, `.hero`]) }));
        expect(reportedKeys()).to.deep.equal([`a`]);
      });

      it(`stops waiting after navigating to a page the variant does not match`, async function () {
        delivered = variants({ a: arms.treatment([`.hero`]) });
        manager.applyForCurrentPage();
        navigate(`/home`);
        manager.applyForCurrentPage();

        addElement(`hero`);
        await flushObservers();
        expect(track).to.not.have.been.called;
      });

      it(`stops waiting when the set is replaced by one without the variant`, async function () {
        manager.onFlagsDelivered(variants({ a: arms.treatment([`.hero`]) }));
        manager.onFlagsDelivered(variants({}));

        addElement(`hero`);
        await flushObservers();
        expect(track).to.not.have.been.called;
      });

      it(`does not report a variant twice when the same set is re-applied while waiting`, async function () {
        const delivery = variants({ a: arms.treatment([`.hero`]) });
        manager.onFlagsDelivered(delivery);
        manager.onFlagsDelivered(delivery);

        addElement(`hero`);
        await flushObservers();
        expect(track).to.have.been.calledOnce;
      });
    });

    describe(`after onReset`, function () {
      it(`discards an exposure still waiting on a selector from the previous set`, async function () {
        manager.onFlagsDelivered(variants({ a: withSelectors(treatment(`exp1`), [`.hero`]) }));
        manager.onReset();

        // The selector renders after reset.
        addElement(`hero`);
        await flushObservers();
        expect(track).to.not.have.been.called;
      });

      [`treatment`, `control`].forEach((firstVariant) => {
        it(`skips the remaining variants when reporting a ${firstVariant} resets the visitor`, function () {
          track = sinon.stub();
          track.onFirstCall().callsFake(() => manager.onReset());
          manager = build();
          manager.onFlagsDelivered(variants({
            first: firstVariant === `treatment` ? treatment(`exp1`) : control(`exp1`),
            pendingControl: control(`exp2`),
          }));
          expect(reportedKeys()).to.deep.equal([`first`]);
          expect(settled).to.have.been.calledOnce;
        });
      });

      it(`skips the remaining selector-gated variants when reporting one resets the visitor`, async function () {
        track = sinon.stub();
        track.onFirstCall().callsFake(() => manager.onReset());
        manager = build();
        manager.onFlagsDelivered(variants({
          first: withSelectors(treatment(`exp1`), [`.hero`]),
          second: withSelectors(control(`exp2`), [`.hero`]),
        }));
        addElement(`hero`);
        await flushObservers();
        expect(reportedKeys()).to.deep.equal([`first`]);
      });

      it(`reports a newly delivered set`, function () {
        manager.onFlagsDelivered(variants({ a: control(`exp1`) }));
        manager.onReset();
        manager.onFlagsDelivered(variants({ a: control(`exp1`) }));
        expect(track).to.have.been.calledTwice;
      });

      it(`clears the previous identity's changes without waiting for a delivery`, function () {
        delivered = variants({ a: treatment(`exp1`) });
        manager.onFlagsDelivered(delivered);
        delivered = null;
        manager.onReset();
        expect(revert).to.have.been.calledOnce;
      });

      it(`keeps an editor preview while clearing the previous identity's changes`, function () {
        delivered = variants({ a: treatment(`exp1`) });
        manager.onFlagsDelivered(delivered);
        manager._startEditorSession(`exp-b`);
        manager._applyEditorPreview(preview);
        delivered = null;
        manager.onReset();
        expect(revert).to.not.have.been.called;
        expect(apply.lastCall.args[0]).to.deep.equal(preview);
      });
    });
  });

  describe(`settled signal`, function () {
    it(`fires once after a delivery carrying changes`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(settled).to.have.been.calledOnce;
    });

    it(`fires once even when no variant carries changes`, function () {
      manager.onFlagsDelivered(variants({ plain: { key: `A`, value: `plain-value` } }));
      expect(apply).to.not.have.been.called;
      expect(settled).to.have.been.calledOnce;
    });

    it(`fires at most once across repeated deliveries`, function () {
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`, otherChanges) }));
      manager.onDeliverySettled();
      expect(apply).to.have.been.calledTwice;
      expect(settled).to.have.been.calledOnce;
    });

    it(`fires when delivery ends without any variants`, function () {
      manager.onDeliverySettled();
      expect(settled).to.have.been.calledOnce;
    });
  });

  describe(`Target URL rule ($mp.target)`, function () {
    it(`applies when the target matches, whatever $mp.url says`, function () {
      manager.onFlagsDelivered(variants({
        a: targetedTreatment(`exp1`, patternTarget(`http://localhost/*`), `http://localhost/elsewhere`),
      }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`skips when the target does not match, even if $mp.url does`, function () {
      manager.onFlagsDelivered(variants({ a: targetedTreatment(`exp1`, patternTarget(`http://localhost/checkout`)) }));
      expect(apply).to.not.have.been.called;
      expect(revert).to.have.been.calledOnce;
    });

    it(`skips a target with an unknown version instead of falling back to $mp.url`, function () {
      const target = Object.assign(patternTarget(`http://localhost/pricing`), { version: 2 });
      manager.onFlagsDelivered(variants({ a: targetedTreatment(`exp1`, target) }));
      expect(apply).to.not.have.been.called;
    });

    it(`falls back to $mp.url when the target is null`, function () {
      manager.onFlagsDelivered(variants({ a: targetedTreatment(`exp1`, null) }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`matches the query rule against the current page`, function () {
      const target = patternTarget(`http://localhost/pricing`, { query: { params: [{ key: `plan`, value: `pro` }] } });
      navigate(`/pricing?plan=pro&utm_source=ad`);
      manager.onFlagsDelivered(variants({ a: targetedTreatment(`exp1`, target) }));
      expect(apply).to.have.been.calledOnce;

      navigate(`/pricing?plan=free`);
      manager.onFlagsDelivered(variants({ a: targetedTreatment(`exp1`, target) }));
      expect(apply).to.have.been.calledOnce;
      expect(revert).to.have.been.calledOnce;
    });

    it(`re-runs matching on SPA navigation that only changes the hash`, function () {
      delivered = variants({
        a: targetedTreatment(`exp1`, patternTarget(`http://localhost/pricing`, { hash: { route: `/annual`, params: null } })),
      });
      navigate(`/pricing#/monthly`);
      manager.applyForCurrentPage();
      expect(apply).to.not.have.been.called;

      navigate(`/pricing#/annual`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`uses the same matcher for a QA preview variant`, function () {
      const previewVariant = Object.assign(
        targetedTreatment(`exp1`, patternTarget(`http://localhost/pricing`, { query: { params: [] } })),
        { is_preview: true }
      );
      navigate(`/pricing?mp_preview_token=abc`);
      manager.onFlagsDelivered(variants({ a: previewVariant }));
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/pricing?mp_preview_token=abc&plan=pro`);
      manager.onFlagsDelivered(variants({ a: previewVariant }));
      expect(apply).to.have.been.calledOnce;
    });
  });

  describe(`applyForCurrentPage (SPA re-apply)`, function () {
    it(`applies delivered variants matching the current page`, function () {
      delivered = variants({ a: treatment(`exp1`) });
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`reverts after navigating to a page with no matching variant`, function () {
      delivered = variants({ a: treatment(`exp1`) });
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnce;

      navigate(`/home`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledOnce;
    });

    it(`is a no-op when the matched page has not changed`, function () {
      delivered = variants({ a: treatment(`exp1`) });
      manager.applyForCurrentPage();
      navigate(`/pricing?campaign=test#details`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnce;
    });

    it(`reports a control on navigation to its page`, function () {
      delivered = variants({ a: control(`exp1`) });
      navigate(`/home`);
      manager.applyForCurrentPage();
      expect(track).to.not.have.been.called;

      navigate(`/pricing`);
      manager.applyForCurrentPage();
      expect(track).to.have.been.calledOnce;
    });

    it(`skips the remaining variants when reporting one navigates and re-applies`, function () {
      track = sinon.stub();
      track.onFirstCall().callsFake(() => {
        navigate(`/home`);
        manager.applyForCurrentPage();
      });
      manager = build();
      delivered = variants({ first: treatment(`exp1`), second: treatment(`exp2`), third: control(`exp3`) });
      manager.applyForCurrentPage();
      expect(track.getCalls().map((call) => call.args[0])).to.deep.equal([`first`]);
    });

    it(`keeps the replay state of the set a reporting hook re-applied`, function () {
      track = sinon.stub();
      track.onFirstCall().callsFake(() => {
        delivered = variants({});
        navigate(`/home`);
        manager.applyForCurrentPage();
      });
      manager = build();
      delivered = variants({ first: targetedTreatment(`exp1`, patternTarget(`${PAGE_URL}`)) });
      manager.applyForCurrentPage();
      // The re-applied set carries no $mp.target, so a query-only change is a no-op.
      navigate(`/home?tab=2`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledOnce;
    });

    it(`treats missing variants as an empty delivery`, function () {
      manager = build({ getVariantsFunc: () => undefined });
      manager.applyForCurrentPage();
      expect(apply).to.not.have.been.called;
      expect(revert).to.have.been.calledOnce;
    });
  });

  describe(`navigation re-targeting (matched-set dedup)`, function () {
    const itemTarget = patternTarget(`http://localhost/item/*`);

    it(`re-evaluates a query-only navigation`, function () {
      delivered = variants({
        a: targetedTreatment(`exp1`, patternTarget(`http://localhost/pricing`, { query: { params: [{ key: `plan`, value: `pro` }] } })),
      });
      navigate(`/pricing?plan=free`);
      manager.applyForCurrentPage();
      expect(apply).to.not.have.been.called;

      navigate(`/pricing?plan=pro`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/pricing?plan=free`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledTwice;
    });

    it(`re-evaluates a hash-only navigation`, function () {
      delivered = variants({
        a: targetedTreatment(`exp1`, patternTarget(`http://localhost/pricing`, { hash: { route: `/annual`, params: null } })),
      });
      navigate(`/pricing#/annual`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/pricing#/monthly`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledOnce;
    });

    it(`keeps the matched set of a navigation made from an exposure hook`, function () {
      const controlPage = `http://localhost/home`;
      const treatmentPage = `http://localhost/item/1`;
      manager = build({
        trackExposureFunc: sinon.spy((flagKey) => {
          if (flagKey === `a`) {
            navigate(`/item/1`);
            manager.applyForCurrentPage();
          }
        }),
      });
      delivered = variants({
        a: control(`exp1`, controlPage),
        b: treatment(`exp2`, changes, treatmentPage),
      });
      navigate(`/home`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/home`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledTwice;
    });

    it(`does not revert and reapply on a path change under the same pattern`, function () {
      delivered = variants({ a: targetedTreatment(`exp1`, itemTarget) });
      navigate(`/item/123`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnce;

      navigate(`/item/456`);
      manager.applyForCurrentPage();
      navigate(`/item/456?ref=home#reviews`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnce;
      expect(revert).to.not.have.been.called;
    });

    it(`releases replaced elements while navigating under the same pattern with the real engine`, async function () {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      const engine = new VisualChangeEngine();
      apply = sinon.spy((mutations) => engine.applyVisualChanges(mutations));
      manager = build({ revertVisualChangesFunc: () => engine.revertVisualChanges() });
      delivered = variants({ a: targetedTreatment(`exp1`, itemTarget) });

      document.body.innerHTML = `<button class="cta">Item 0</button>`;
      navigate(`/item/0`);
      manager.applyForCurrentPage();
      const undoDepthPerPage = engine._undoStack.length;
      expect(undoDepthPerPage).to.equal(changes.length);

      for (let page = 1; page <= 5; page++) {
        navigate(`/item/${page}`);
        manager.applyForCurrentPage();
        document.body.innerHTML = `<button class="cta">Item ${page}</button>`;
        await Promise.resolve();
        while (frames.length) {
          frames.shift()();
        }
        const button = document.querySelector(`.cta`);
        expect(button.getAttribute(`data-variant`)).to.equal(`B`);
        expect(button.style.color).to.equal(`red`);
        expect(engine._undoStack.length).to.equal(undoDepthPerPage);
      }
      expect(apply).to.have.been.calledOnce;

      engine.revertVisualChanges();
      const button = document.querySelector(`.cta`);
      expect(button.hasAttribute(`data-variant`)).to.be.false;
      expect(button.style.color).to.equal(``);
    });

    it(`restores a child that a parent's setText detached when reverting with the real engine`, async function () {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      const engine = new VisualChangeEngine();
      document.body.innerHTML = `<div class="card"><span class="badge">New</span></div>`;
      const badge = document.querySelector(`.badge`);

      engine.applyVisualChanges([
        { type: `setStyle`, selector: `.badge`, property: `color`, value: `red` },
        { type: `setText`, selector: `.card`, value: `Replaced` },
      ]);
      expect(badge.isConnected).to.be.false;

      document.body.appendChild(document.createElement(`p`));
      await Promise.resolve();
      while (frames.length) {
        frames.shift()();
      }

      engine.revertVisualChanges();
      const restoredBadge = document.querySelector(`.card .badge`);
      expect(restoredBadge).to.equal(badge);
      expect(restoredBadge.textContent).to.equal(`New`);
      expect(restoredBadge.style.color).to.equal(``);
    });

    it(`leaves a child the page moved into the live document in place when its setText parent is removed`, async function () {
      const frames = [];
      global.window.requestAnimationFrame = callback => frames.push(callback);
      const engine = new VisualChangeEngine();
      document.body.innerHTML = `<div class="card"><span class="badge">New</span></div><div class="shelf"></div>`;
      const card = document.querySelector(`.card`);
      const badge = document.querySelector(`.badge`);
      const shelf = document.querySelector(`.shelf`);

      engine.applyVisualChanges([{ type: `setText`, selector: `.card`, value: `Replaced` }]);
      shelf.appendChild(badge);
      card.remove();
      await Promise.resolve();
      while (frames.length) {
        frames.shift()();
      }

      expect(badge.parentNode).to.equal(shelf);
      expect(engine._undoStack.length).to.equal(0);
    });

    it(`leaves a child the page moved elsewhere in place when reverting setText`, function () {
      const engine = new VisualChangeEngine();
      document.body.innerHTML = `<div class="card"><span class="badge">New</span><em class="note">Hi</em></div><div class="shelf"></div>`;
      const card = document.querySelector(`.card`);
      const badge = document.querySelector(`.badge`);
      const note = document.querySelector(`.note`);
      const shelf = document.querySelector(`.shelf`);

      engine.applyVisualChanges([{ type: `setText`, selector: `.card`, value: `Replaced` }]);
      shelf.appendChild(badge);
      engine.revertVisualChanges();

      expect(badge.parentNode).to.equal(shelf);
      expect(note.parentNode).to.equal(card);
      expect(card.textContent).to.equal(`Hi`);
    });

    it(`reapplies when a navigation changes the matched set`, function () {
      delivered = variants({
        a: targetedTreatment(`exp1`, itemTarget),
        b: treatment(`exp2`, otherChanges, `http://localhost/item/456`),
      });
      navigate(`/item/123`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/item/456`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledTwice;
      expect(apply.lastCall.args[0]).to.deep.equal(changes.concat(otherChanges));

      navigate(`/item/789`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledThrice;
      expect(apply.lastCall.args[0]).to.deep.equal(changes);
    });

    it(`reapplies when the same flag is delivered with a different variant`, function () {
      delivered = variants({ a: targetedTreatment(`exp1`, itemTarget) });
      navigate(`/item/123`);
      manager.applyForCurrentPage();

      delivered = variants({ a: Object.assign(targetedTreatment(`exp1`, itemTarget), { key: `C` }) });
      navigate(`/item/456`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledTwice;
    });

    it(`keeps the no-target fallback scoped by origin and pathname`, function () {
      delivered = variants({ a: treatment(`exp1`) });
      navigate(`/pricing?campaign=test#details`);
      manager.applyForCurrentPage();
      expect(apply).to.have.been.calledOnce;

      navigate(`/item/123`);
      manager.applyForCurrentPage();
      expect(revert).to.have.been.calledOnce;
    });
  });

  describe(`editor sessions`, function () {
    beforeEach(function () {
      delivered = variants({ a: treatment(`exp-a`), b: treatment(`exp-b`, otherChanges) });
      manager.onFlagsDelivered(delivered);
      apply.resetHistory();
      revert.resetHistory();
    });

    it(`starting a session withholds that experiment and re-applies the rest`, function () {
      manager._startEditorSession(`exp-a`);
      expect(manager._suppressedExperiments[`exp-a`]).to.be.true;
      expect(apply).to.have.been.calledOnceWith(otherChanges);
    });

    it(`starting a session before any delivery clears a standalone preview`, function () {
      delivered = new Map();
      manager = build();
      manager._applyEditorPreview(preview);
      expect(apply).to.have.been.calledOnceWith(preview);

      manager._startEditorSession(`exp-a`);
      expect(revert).to.have.been.calledOnce;
    });

    it(`composes the preview after the live changes`, function () {
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);
      expect(apply.lastCall.args[0]).to.deep.equal(otherChanges.concat(preview));
    });

    it(`never reports preview mutations as exposures`, function () {
      delivered = new Map();
      manager = build();
      track.resetHistory();
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);
      expect(track).to.not.have.been.called;
    });

    it(`ignores a preview that is not an array`, function () {
      manager._applyEditorPreview(`nope`);
      expect(apply).to.not.have.been.called;
    });

    [`empty changes`, `explicit revert`].forEach((clearMethod) => {
      it(`clears the preview using ${clearMethod} and keeps the other experiment`, function () {
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(preview);
        if (clearMethod === `empty changes`) {
          manager._applyEditorPreview([]);
        } else {
          manager._revertEditorPreview();
        }
        expect(apply.lastCall.args[0]).to.deep.equal(otherChanges);
      });
    });

    it(`reverts when clearing the preview leaves nothing to apply`, function () {
      delivered = variants({ a: treatment(`exp-a`) });
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);
      manager._applyEditorPreview([]);
      expect(revert).to.have.been.called;
    });

    it(`scopes the preview by the edited experiment's $mp.url when it has no target`, function () {
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);

      navigate(`/other`);
      manager.applyForCurrentPage();
      expect(apply.lastCall.args[0]).to.deep.equal(otherChanges.concat(preview));
      expect(revert).to.have.been.calledOnce;

      navigate(`/pricing?campaign=test#details`);
      manager.applyForCurrentPage();
      expect(apply.lastCall.args[0]).to.deep.equal(otherChanges.concat(preview));
    });

    it(`keeps the preview when the same session restarts on the same page`, function () {
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);
      apply.resetHistory();

      navigate(`/pricing/?campaign=test`);
      manager._startEditorSession(`exp-a`);
      expect(apply).to.not.have.been.called;
      expect(manager._editorPreview.mutations).to.deep.equal(preview);
    });

    it(`discards the preview when the same session restarts on another page`, function () {
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);

      navigate(`/other`);
      manager._startEditorSession(`exp-a`);
      expect(manager._editorPreview).to.equal(null);
      expect(manager._editorSession.pageKey).to.equal(`http://localhost/other`);
    });

    describe(`preview following the edited experiment's target`, function () {
      beforeEach(function () {
        delivered = variants({
          a: targetedTreatment(`exp-a`, patternTarget(`http://localhost/item/*`)),
          b: treatment(`exp-b`, otherChanges),
        });
        navigate(`/item/1`);
        manager.applyForCurrentPage();
        apply.resetHistory();
        revert.resetHistory();
      });

      it(`applies on any matching page and reverts on a non-matching one`, function () {
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(preview);
        expect(apply.lastCall.args[0]).to.deep.equal(preview);

        navigate(`/item/2?tab=specs`);
        manager.applyForCurrentPage();
        expect(apply).to.have.been.calledOnce;
        expect(revert).to.have.been.calledOnce;

        navigate(`/other`);
        manager.applyForCurrentPage();
        expect(revert).to.have.been.calledTwice;

        navigate(`/item/3`);
        manager.applyForCurrentPage();
        expect(apply).to.have.been.calledTwice;
        expect(apply.lastCall.args[0]).to.deep.equal(preview);
      });

      it(`applies a preview sent after navigating away from where the session started`, function () {
        manager._startEditorSession(`exp-a`);
        navigate(`/item/2`);
        manager.applyForCurrentPage();
        manager._applyEditorPreview(preview);
        expect(apply.lastCall.args[0]).to.deep.equal(preview);
      });

      it(`also applies on the authoring page when it is outside the target`, function () {
        navigate(`/pricing`);
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(preview);
        expect(apply.lastCall.args[0]).to.deep.equal(otherChanges.concat(preview));

        navigate(`/item/2`);
        manager.applyForCurrentPage();
        expect(apply.lastCall.args[0]).to.deep.equal(preview);

        navigate(`/other`);
        manager.applyForCurrentPage();
        expect(revert).to.have.been.calledOnce;
      });

      it(`does not apply a preview sent on a page outside the target`, function () {
        manager._startEditorSession(`exp-a`);
        navigate(`/pricing`);
        manager.applyForCurrentPage();
        manager._applyEditorPreview(preview);
        expect(apply.lastCall.args[0]).to.deep.equal(otherChanges);
      });

      it(`keeps the preview when the same session restarts on another matching page`, function () {
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(preview);

        navigate(`/item/2`);
        manager._startEditorSession(`exp-a`);
        expect(manager._editorPreview.mutations).to.deep.equal(preview);
      });

      it(`applies only on the authored page when the edited experiment is not delivered`, function () {
        delivered = variants({ b: treatment(`exp-b`, otherChanges) });
        manager._startEditorSession(`exp-a`);
        manager._applyEditorPreview(preview);
        expect(apply.lastCall.args[0]).to.deep.equal(preview);

        navigate(`/item/2`);
        manager.applyForCurrentPage();
        expect(revert).to.have.been.calledTwice;

        navigate(`/item/1`);
        manager.applyForCurrentPage();
        expect(apply.lastCall.args[0]).to.deep.equal(preview);
      });
    });

    it(`switching experiments releases the previous one and withholds the new one`, function () {
      manager._startEditorSession(`exp-a`);
      manager._startEditorSession(`exp-b`);
      expect(manager._suppressedExperiments[`exp-a`]).to.be.undefined;
      expect(manager._suppressedExperiments[`exp-b`]).to.be.true;
      expect(apply.lastCall.args[0]).to.deep.equal(changes);
    });

    it(`ending the session releases the experiment and restores its live changes`, function () {
      manager._startEditorSession(`exp-a`);
      manager._applyEditorPreview(preview);
      manager._endEditorSession(`exp-a`);
      expect(manager._suppressedExperiments[`exp-a`]).to.be.undefined;
      expect(manager._editorPreview).to.equal(null);
      expect(apply.lastCall.args[0]).to.deep.equal(changes.concat(otherChanges));
    });

    it(`ignores an end for an experiment that is not being edited`, function () {
      manager._startEditorSession(`exp-a`);
      apply.resetHistory();
      manager._endEditorSession(`exp-b`);
      manager._endEditorSession(null);
      expect(apply).to.not.have.been.called;
      expect(manager._suppressedExperiments[`exp-a`]).to.be.true;
    });

    it(`ignores a start without an experiment id`, function () {
      manager._startEditorSession(``);
      expect(manager._editorSession).to.equal(null);
      expect(apply).to.not.have.been.called;
    });
  });

  describe(`init`, function () {
    it(`is a no-op when visual experiments are disabled`, function () {
      config.visual_experiments = false;
      manager.init();
      expect(manager.getExperimentsApi()).to.be.undefined;
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
    });

    it(`hides the page, exposes the editor API, and binds the engine`, function () {
      manager = build({ applyVisualChangesFunc: undefined, revertVisualChangesFunc: undefined, onSettledFunc: undefined });
      manager.init();
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.true;
      expect(Object.keys(manager.getExperimentsApi())).to.deep.equal([
        `applyVisualChanges`, `revertVisualChanges`, `startEditorSession`, `endEditorSession`,
      ]);

      document.body.innerHTML = `<h1>Original</h1>`;
      manager.getExperimentsApi().applyVisualChanges(preview);
      expect(document.querySelector(`h1`).textContent).to.equal(`Preview headline`);
      manager.getExperimentsApi().revertVisualChanges();
      expect(document.querySelector(`h1`).textContent).to.equal(`Original`);
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
    });

    it(`reveals the page when delivery settles`, function () {
      manager = build({ onSettledFunc: undefined });
      manager.init();
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.true;
      manager.onDeliverySettled();
      expect(document.documentElement.classList.contains(`mp-antiflicker-hide`)).to.be.false;
    });

    it(`keeps injected engine hooks`, function () {
      manager.init();
      manager.onFlagsDelivered(variants({ a: treatment(`exp1`) }));
      expect(apply).to.have.been.calledOnceWith(changes);
    });

    it(`re-applies on SPA navigation without a fetch`, function () {
      manager.init();
      delivered = variants({ a: treatment(`exp1`, changes, `http://localhost/dashboard`) });

      navigate(`/dashboard`);
      expect(apply).to.have.been.calledOnceWith(changes);

      navigate(`/settings`);
      expect(revert).to.have.been.calledOnce;
    });

    it(`runs once`, function () {
      manager.init();
      const api = manager.getExperimentsApi();
      manager.init();
      expect(manager.getExperimentsApi()).to.equal(api);
    });
  });
});
