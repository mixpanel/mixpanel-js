import { expect } from 'chai';

import jsdomSetup from './jsdom-setup';

describe(`exemptEventProperties`, function() {
  // re-required before each test so they reference the correct jsdom document
  let exemptEventProperties;

  jsdomSetup({
    reImportModules: [`../../src/window`, `../../src/utils`, `../../src/exempt-events`],
    beforeCallback: modules => {
      ({exemptEventProperties} = modules[2]);
    },
  });

  const NO_EXTRAS = {};

  it(`is null for an event that isn't allowed`, function() {
    expect(exemptEventProperties(`Purchase`, {}, NO_EXTRAS)).to.equal(null);
    expect(exemptEventProperties(`$identify`, {}, NO_EXTRAS)).to.equal(null);
  });

  it(`allows page views, clicks, scrolls and page exits`, function() {
    [`$mp_web_page_view`, `$mp_click`, `$mp_scroll`, `$mp_page_leave`].forEach(
      eventName => expect(exemptEventProperties(eventName, {}, NO_EXTRAS)).to.deep.equal({$mp_exempt: true})
    );
  });

  it(`allows the events consent_exempt_allowlist adds`, function() {
    expect(exemptEventProperties(`Signup Viewed`, {}, {events: [`Signup Viewed`]})).to.deep.equal({$mp_exempt: true});
  });

  it(`keeps only the allowed properties, and the ones consent_exempt_allowlist adds`, function() {
    const properties = {
      token: `tok`,
      $os: `Mac OS X`,
      section: `pricing`,
      distinct_id: `user-1`,
      $device_id: `device-1`,
      $screen_width: 1440,
      $referrer: `https://search.example/?q=name`,
      utm_source: `ad`,
    };

    expect(exemptEventProperties(`$mp_click`, properties, NO_EXTRAS)).to.deep.equal({token: `tok`, $os: `Mac OS X`, $mp_exempt: true});
    expect(exemptEventProperties(`$mp_click`, properties, {properties: [`section`]})).to.deep.equal({
      token: `tok`,
      $os: `Mac OS X`,
      section: `pricing`,
      $mp_exempt: true,
    });
  });

  it(`floors the time to the hour and keeps the browser's major version`, function() {
    const properties = exemptEventProperties(`$mp_click`, {time: 1793900123.456, $browser_version: 120.5}, NO_EXTRAS);

    expect(properties.time).to.equal(1793898000);
    expect(properties.$browser_version).to.equal(120);
  });

  it(`sends URLs as origin and path, without credentials`, function() {
    const hrefSent = href => exemptEventProperties(`$mp_click`, {$el_attr__href: href}, NO_EXTRAS).$el_attr__href;

    expect(hrefSent(`https://user:secret@example.com/docs?id=1#top`)).to.equal(`https://example.com/docs`);
    expect(hrefSent(`https://user:p@ss@example.com/docs`)).to.equal(`https://example.com/docs`);
    expect(hrefSent(`/pricing?ref=nav`)).to.equal(`/pricing`);
    // browsers ignore this whitespace, so the link works
    expect(hrefSent(`\nhttps://user:secret@example.com/docs `)).to.equal(`https://example.com/docs`);
    expect(exemptEventProperties(`$mp_click`, {$current_url: `https://example.com/home?utm_source=ad`}, NO_EXTRAS).$current_url)
      .to.equal(`https://example.com/home`);
  });

  it(`drops URLs that aren't http(s) or relative, and URLs that aren't strings`, function() {
    const hrefSent = href => exemptEventProperties(`$mp_click`, {$el_attr__href: href}, NO_EXTRAS);

    [
      `mailto:alice@example.com`, `tel:+33100000000`, ` mailto:alice@example.com`, `mail\tto:alice@example.com`, 42,
      // protocol-relative, which browsers also read from \\ and /\
      `//user:pw@example.com/docs`, `\\\\user:pw@example.com/docs`, `/\\user:pw@example.com/docs`
    ].forEach(
      href => expect(hrefSent(href)).to.not.have.property(`$el_attr__href`)
    );
  });

  it(`filters properties named like Object methods`, function() {
    expect(exemptEventProperties(`$mp_click`, {hasOwnProperty: `shadowed`, $os: `iOS`}, NO_EXTRAS))
      .to.deep.equal({$os: `iOS`, $mp_exempt: true});
  });
});
