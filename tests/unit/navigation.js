import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

import jsdomSetup from './jsdom-setup';

chai.use(sinonChai);

let navigation;
let EV;

describe(`navigation location-change detector`, function() {
  jsdomSetup({
    url: `http://localhost/a`,
    // Re-import navigation each test so its module-level "installed" guard resets
    // and it binds to the fresh jsdom window/history.
    reImportModules: [`../../src/window`, `../../src/navigation`],
    beforeCallback: modules => {
      navigation = modules[1];
      EV = navigation.EV_MP_LOCATION_CHANGE;
    },
  });

  it(`dispatches a location-change event on history.pushState`, function() {
    navigation.ensureLocationChangeListeners();
    const spy = sinon.spy();
    window.addEventListener(EV, spy);
    window.history.pushState({}, ``, `/b`);
    expect(spy).to.have.been.calledOnce;
  });

  it(`dispatches on history.replaceState`, function() {
    navigation.ensureLocationChangeListeners();
    const spy = sinon.spy();
    window.addEventListener(EV, spy);
    window.history.replaceState({}, ``, `/c`);
    expect(spy).to.have.been.calledOnce;
  });

  it(`dispatches on popstate`, function() {
    navigation.ensureLocationChangeListeners();
    const spy = sinon.spy();
    window.addEventListener(EV, spy);
    window.dispatchEvent(new Event(`popstate`));
    expect(spy).to.have.been.calledOnce;
  });

  it(`dispatches on hashchange`, function() {
    navigation.ensureLocationChangeListeners();
    const spy = sinon.spy();
    window.addEventListener(EV, spy);
    window.dispatchEvent(new Event(`hashchange`));
    expect(spy).to.have.been.calledOnce;
  });

  it(`installs only once so pushState dispatches a single event (no wrapper stacking)`, function() {
    // Calling the installer repeatedly must not re-patch history; a stacked patch
    // would dispatch the event more than once per navigation.
    navigation.ensureLocationChangeListeners();
    navigation.ensureLocationChangeListeners();
    navigation.ensureLocationChangeListeners();
    const spy = sinon.spy();
    window.addEventListener(EV, spy);
    window.history.pushState({}, ``, `/d`);
    expect(spy).to.have.been.calledOnce;
  });

  it(`onLocationChange fires the handler and its teardown removes it`, function() {
    const spy = sinon.spy();
    const off = navigation.onLocationChange(spy);
    window.history.pushState({}, ``, `/e`);
    expect(spy).to.have.been.calledOnce;

    off();
    window.history.pushState({}, ``, `/f`);
    expect(spy).to.have.been.calledOnce; // no further calls after teardown
  });
});
