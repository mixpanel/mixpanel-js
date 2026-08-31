import { expect } from 'chai';
import sinon from 'sinon';

import { LinkTracker } from '../../src/dom-trackers';
import { window } from '../../src/window';

describe(`LinkTracker`, function() {
  let clock;
  let linkTracker;

  beforeEach(function() {
    clock = sinon.useFakeTimers();
    linkTracker = new LinkTracker();
    sinon.stub(window, `location`).value(`http://localhost/original`);
  });

  afterEach(function() {
    sinon.restore();
  });

  describe(`after_track_handler`, function() {
    it(`does not navigate when the element has no href`, function() {
      linkTracker.after_track_handler({}, {new_tab: false, href: ``});
      clock.tick(0);

      expect(window.location).to.equal(`http://localhost/original`);
    });

    it(`navigates when the element has a real href`, function() {
      linkTracker.after_track_handler({}, {new_tab: false, href: `http://example.com/page`});
      clock.tick(0);

      expect(window.location).to.equal(`http://example.com/page`);
    });

    it(`does not navigate on a new-tab click regardless of href`, function() {
      linkTracker.after_track_handler({}, {new_tab: true, href: `http://example.com/page`});
      clock.tick(0);

      expect(window.location).to.equal(`http://localhost/original`);
    });
  });
});
