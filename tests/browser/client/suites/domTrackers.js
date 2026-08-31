/* global chai, sinon */

const { expect } = chai;
import { randName, simulateMouseClick, clearAllLibInstances } from "../utils";

function createFixture(tagName) {
  const name = randName();
  const el = document.createElement(tagName);
  el.className = name;
  document.body.appendChild(el);
  return {el, className: `.${name}`};
}

function createLink() {
  const link = createFixture(`a`);
  link.el.href = `#`;
  return link;
}

function createLinkWithId() {
  const link = createLink();
  const id = randName();
  link.el.id = id;
  link.id = `#${id}`;
  return link;
}

function createForm() {
  return createFixture(`form`);
}

function simulateSubmit(element) {
  element.dispatchEvent(new Event(`submit`, {bubbles: true, cancelable: true}));
}

// _.dom_query treats a real Array as a CSS selector (it only special-cases
// array-*like* objects that aren't Arrays, e.g. a NodeList or jQuery collection)
function toArrayLike(elements) {
  const arrayLike = {length: elements.length};
  elements.forEach((el, i) => { arrayLike[i] = el; });
  return arrayLike;
}

export function domTrackersTests(mixpanel) {
  describe(`track_links`, function() {
    let fixtures;

    beforeEach(() => {
      fixtures = [];
      mixpanel.init(randName(), {
        batch_requests: false,
        debug: true
      }, `test`);
    });

    afterEach(async () => {
      fixtures.forEach((fixture) => fixture.remove());
      await clearAllLibInstances(mixpanel);
    });

    function link(tag) {
      const fixture = tag === `id` ? createLinkWithId() : createLink();
      fixtures.push(fixture.el);
      return fixture;
    }

    it(`invokes the callback`, async () => {
      const a = link();

      const fired = await new Promise((resolve) => {
        mixpanel.test.track_links(a.className, `link_clicked`, {property: `dodeo`}, () => {
          resolve(true);
          return false; // this stops the browser from going to the link location
        });
        simulateMouseClick(a.el);
      });

      expect(fired).to.equal(true, `track_links callback was fired`);
    });

    it(`preserves a pre-existing onclick handler`, async () => {
      const a = link();
      let oldWasFired = false;
      a.el.onclick = () => {
        oldWasFired = true;
        return false;
      };

      await new Promise((resolve) => {
        mixpanel.test.track_links(a.className, `link_clicked`, {property: `it works`}, () => {
          resolve();
          return false;
        });
        simulateMouseClick(a.el);
      });

      expect(oldWasFired).to.equal(true, `old event was fired, and new event was fired`);
    });

    it(`supports changing track_links_timeout`, async () => {
      const a = link();

      mixpanel.init(randName(), {
        batch_requests: true,
        debug: true
      }, `batchingLinks`);

      expect(mixpanel.batchingLinks.config.track_links_timeout).to.equal(300, `track_links_timeout defaults to a sane value`);
      mixpanel.batchingLinks.set_config({track_links_timeout: 1000});
      expect(mixpanel.batchingLinks.config.track_links_timeout).to.equal(1000, `track_links_timeout can be changed`);

      // only relevant to non-batching configs - set to 1 so the callback fires right away
      mixpanel.init(randName(), {
        batch_requests: false,
        debug: true
      }, `nonbatchingLinks`);
      mixpanel.nonbatchingLinks.set_config({track_links_timeout: 1});

      const timeoutOccurred = await new Promise((resolve) => {
        mixpanel.nonbatchingLinks.track_links(a.className, `do de do`, {}, (timeoutOccured) => {
          resolve(timeoutOccured);
          return false;
        });
        simulateMouseClick(a.el);
      });

      expect(timeoutOccurred).to.equal(true, `track_links_timeout successfully modified the timeout`);
    });

    it(`adds a url property to tracked events`, async () => {
      const a = link();
      a.el.href = `#test`;

      const properties = await new Promise((resolve) => {
        mixpanel.test.track_links(a.className, `testing url property`, {}, (timeoutOccured, props) => {
          resolve(props);
          return false;
        });
        simulateMouseClick(a.el);
      });

      expect(properties.url).to.not.equal(undefined, `url property was successfully added`);
      expect(properties.url).to.not.equal(null, `url property was successfully added`);
    });

    it(`gracefully fails on an invalid query`, () => {
      const a = link(`id`);

      expect(() => mixpanel.test.track_links(`a` + a.id, `this should work`)).to.not.throw();

      const errorStub = sinon.stub(console, `error`);
      try {
        expect(() => mixpanel.test.track_links(`a#badbadbadid`, `this shouldn't work`)).to.not.throw();
        expect(errorStub.calledWith(`Mixpanel error:`)).to.equal(true, `terrible query should log an error, not throw`);
      } finally {
        errorStub.restore();
      }
    });

    it(`handles SVG elements' non-string classNames without throwing`, () => {
      const name = randName();
      const svg = document.createElementNS(`http://www.w3.org/2000/svg`, `svg`);
      svg.setAttribute(`width`, `300`);
      svg.setAttribute(`height`, `100`);
      svg.setAttribute(`class`, name);
      document.body.appendChild(svg);
      fixtures.push(svg);

      expect(() => mixpanel.test.track_links(`.test`, `this should not fire an error`)).to.not.throw();
    });

    it(`accepts a DOM element as the query`, async () => {
      const a = link();
      a.el.href = `#test`;

      await new Promise((resolve) => {
        mixpanel.test.track_links(a.el, `testing url property`, {}, () => {
          resolve();
          return false;
        });
        simulateMouseClick(a.el);
      });
    });

    it(`accepts an array-like object of elements as the query`, async () => {
      const linkOne = link();
      const linkTwo = link();
      const links = toArrayLike([linkOne.el, linkTwo.el]);
      expect(links.length).to.equal(2);

      await new Promise((resolve) => {
        mixpanel.test.track_links(links, `testing array-like links`, {}, () => {
          resolve();
          return false;
        });
        simulateMouseClick(linkTwo.el);
      });
    });

    it(`accepts a NodeList as the query`, async () => {
      const linkOne = link(`id`);
      const linkTwo = link(`id`);
      const links = document.querySelectorAll(linkOne.id + `,` + linkTwo.id);
      expect(links.length).to.equal(2);

      await new Promise((resolve) => {
        mixpanel.test.track_links(links, `testing url property`, {}, () => {
          resolve();
          return false;
        });
        simulateMouseClick(linkOne.el);
      });
    });
  });

  describe(`track_forms`, function() {
    let fixtures;

    beforeEach(() => {
      fixtures = [];
      mixpanel.init(randName(), {
        batch_requests: false,
        debug: true
      }, `test`);
    });

    afterEach(async () => {
      fixtures.forEach((fixture) => fixture.remove());
      await clearAllLibInstances(mixpanel);
    });

    function form() {
      const fixture = createForm();
      fixtures.push(fixture.el);
      return fixture;
    }

    it(`invokes the callback`, async () => {
      const f = form();

      const fired = await new Promise((resolve) => {
        mixpanel.test.track_forms(f.className, `form_submitted`, {property: `dodeo`}, () => {
          resolve(true);
          return false; // this stops the browser from submitting the form
        });
        simulateSubmit(f.el);
      });

      expect(fired).to.equal(true, `track_forms callback was fired`);
    });

    it(`supports changing track_links_timeout`, async () => {
      const f = form();

      mixpanel.init(randName(), {
        batch_requests: false,
        debug: true
      }, `nonbatchingForms`);
      mixpanel.nonbatchingForms.set_config({track_links_timeout: 1});

      const timeoutOccurred = await new Promise((resolve) => {
        mixpanel.nonbatchingForms.track_forms(f.className, `do de do`, {}, (timeoutOccured) => {
          resolve(timeoutOccured);
          return false;
        });
        simulateSubmit(f.el);
      });

      expect(timeoutOccurred).to.equal(true, `track_links_timeout successfully modified the timeout (track_forms)`);
    });

    it(`accepts a DOM element as the query`, async () => {
      const f = form();

      await new Promise((resolve) => {
        mixpanel.test.track_forms(f.el, `form_submitted`, {}, () => {
          resolve();
          return false;
        });
        simulateSubmit(f.el);
      });
    });

    it(`accepts an array-like object of elements as the query`, async () => {
      const formOne = form();
      const formTwo = form();
      const forms = toArrayLike([formOne.el, formTwo.el]);
      expect(forms.length).to.equal(2);

      await new Promise((resolve) => {
        mixpanel.test.track_forms(forms, `form_submitted`, {}, () => {
          resolve();
          return false;
        });
        simulateSubmit(formTwo.el);
      });
    });

    it(`accepts a NodeList as the query`, async () => {
      const formOne = form();
      const formTwo = form();
      const forms = document.querySelectorAll(formOne.className + `,` + formTwo.className);
      expect(forms.length).to.equal(2);

      await new Promise((resolve) => {
        mixpanel.test.track_forms(forms, `form_submitted`, {}, () => {
          resolve();
          return false;
        });
        simulateSubmit(formTwo.el);
      });
    });
  });
}
