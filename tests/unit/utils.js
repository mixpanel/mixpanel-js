import { expect } from 'chai';
import sinon from 'sinon';

import { batchedThrottle, canUseCompressionStream, extract_domain, generateTraceparent, _, document } from '../../src/utils';
import { window } from '../../src/window';

describe(`extract_domain`, function() {
  it(`matches simple domain names`, function() {
    expect(extract_domain(`mixpanel.com`)).to.equal(`mixpanel.com`);
    expect(extract_domain(`abc.org`)).to.equal(`abc.org`);
    expect(extract_domain(`superlongdomainnamepartfifteen.net`)).to.equal(`superlongdomainnamepartfifteen.net`);
    expect(extract_domain(`startup.ly`)).to.equal(`startup.ly`);
  });

  it(`extracts domain names from hostnames with subdomains`, function() {
    expect(extract_domain(`mysubdomain.mixpanel.com`)).to.equal(`mixpanel.com`);
    expect(extract_domain(`superfly.startup.ly`)).to.equal(`startup.ly`);
  });

  it(`supports many labels in a single hostname`, function() {
    expect(extract_domain(`my.sub.domain.mixpanel.com`)).to.equal(`mixpanel.com`);
  });

  it(`supports a few common country code second-level domain names (ccSLD)`, function() {
    expect(extract_domain(`www.oxford.ac.uk`)).to.equal(`oxford.ac.uk`);
    expect(extract_domain(`www.dmv.ca.gov`)).to.equal(`dmv.ca.gov`);
    expect(extract_domain(`www.imcc.isa.us`)).to.equal(`imcc.isa.us`);

    // unfortunately can't do a real (sub)domain extraction without a list
    // cases like www.avignon.aeroport.fr will still fail
  });

  it(`supports 2-char domain names in common TLDs`, function() {
    expect(extract_domain(`my.com`)).to.equal(`my.com`);
    expect(extract_domain(`subdomain.my.com`)).to.equal(`my.com`);
    expect(extract_domain(`x.org`)).to.equal(`x.org`);
    expect(extract_domain(`subdomain.x.org`)).to.equal(`x.org`);
  });

  it(`supports long TLDs`, function() {
    expect(extract_domain(`supercool.company`)).to.equal(`supercool.company`);
    expect(extract_domain(`sub.supercool.company`)).to.equal(`supercool.company`);
  });
});

describe(`_.info helper methods`, function() {
  beforeEach(resetTestingState);
  afterEach(resetTestingState);
  function resetTestingState() {
    // reset util module window and document state before and after each test run
    var location = {
      hostname: ``
    };
    window.location = location;
    document.URL = ``;
    document.location = location;
    document.referrer = ``;
    document.title = ``;
  }

  describe(`_.info.campaignParams`, function() {
    it(`matches UTM source if present`, function() {
      document.URL = `https://www.example.com/?utm_source=google`;
      expect(_.info.campaignParams().utm_source).to.equal(`google`);
    });

    it(`does not match UTM source if not present`, function() {
      document.URL = `https://www.example.com/?utm_medium=email`;
      expect(_.info.campaignParams().utm_source).to.be.undefined;
    });

    it(`matches UTM medium if present`, function() {
      document.URL = `https://www.example.com/?utm_medium=email`;
      expect(_.info.campaignParams()).to.contain({utm_medium: `email`});
    });

    it(`does not match UTM medium if empty`, function() {
      document.URL = `https://www.example.com/?utm_medium=&utm_source=bing`;
      expect(_.info.campaignParams().utm_medium).to.be.undefined;
    });

    it(`matches partial UTM parameters if present`, function() {
      document.URL = `https://www.example.com/?utm_medium=email&utm_source=bing&utm_campaign=summer-sale`;
      var campaignParams = _.info.campaignParams();
      expect(campaignParams.utm_source).to.equal(`bing`);
      expect(campaignParams.utm_medium).to.equal(`email`);
      expect(campaignParams.utm_campaign).to.equal(`summer-sale`);
      expect(campaignParams.utm_content).to.be.undefined;
      expect(campaignParams.utm_term).to.be.undefined;
    });

    it(`matches all five UTM parameters if present`, function() {
      document.URL = `https://www.example.com/?utm_medium=email&utm_source=bing&utm_term=analysis,product&utm_campaign=summer-sale&utm_content=april-blog`;
      var campaignParams = _.info.campaignParams();
      expect(campaignParams.utm_source).to.equal(`bing`);
      expect(campaignParams.utm_medium).to.equal(`email`);
      expect(campaignParams.utm_campaign).to.equal(`summer-sale`);
      expect(campaignParams.utm_content).to.equal(`april-blog`);
      expect(campaignParams.utm_term).to.equal(`analysis,product`);
    });

    it(`accepts a default value for absent UTM parameters`, function() {
      document.URL = `https://www.example.com/?utm_source=bing&utm_term=analysis,product&utm_campaign=summer-sale`;
      var campaignParams = _.info.campaignParams(null);
      expect(campaignParams.utm_source).to.equal(`bing`);
      expect(campaignParams.utm_campaign).to.equal(`summer-sale`);
      expect(campaignParams.utm_term).to.equal(`analysis,product`);
      expect(campaignParams.utm_medium).to.be.null;
      expect(campaignParams.utm_content).to.be.null;
    });
  });

  describe(`_.info.clickParams`, function() {
    it(`matches on single gclid if present`, function() {
      // note it would be very unlikely for more than one click ID to be present on a URL
      document.URL = `https://www.example.com/?gclid=some-gclid`;
      var clickParams = _.info.clickParams();
      expect(clickParams.gclid).to.equal(`some-gclid`);

      expect(clickParams.dclid).to.be.undefined;
      expect(clickParams.fbclid).to.be.undefined;
      expect(clickParams.ko_click_id).to.be.undefined;
      expect(clickParams.li_fat_id).to.be.undefined;
      expect(clickParams.msclkid).to.be.undefined;
      expect(clickParams.ttclid).to.be.undefined;
      expect(clickParams.twclid).to.be.undefined;
      expect(clickParams.wbraid).to.be.undefined;
    });

    it(`matches on all click IDs if present`, function() {
      // note it would be very unlikely for more than one click ID to be present on a URL
      document.URL = `https://www.example.com/?dclid=a&fbclid=b&gclid=c&ko_click_id=d&li_fat_id=e&msclkid=f&ttclid=g&twclid=h&wbraid=i`;
      var clickParams = _.info.clickParams();
      expect(clickParams.dclid).to.equal(`a`);
      expect(clickParams.fbclid).to.equal(`b`);
      expect(clickParams.gclid).to.equal(`c`);
      expect(clickParams.ko_click_id).to.equal(`d`);
      expect(clickParams.li_fat_id).to.equal(`e`);
      expect(clickParams.msclkid).to.equal(`f`);
      expect(clickParams.ttclid).to.equal(`g`);
      expect(clickParams.twclid).to.equal(`h`);
      expect(clickParams.wbraid).to.equal(`i`);
    });

    it(`does not match on click IDs if not present`, function() {
      // note it would be very unlikely for more than one click ID to be present on a URL
      document.URL = `https://www.example.com/?utm_source=google`;
      var clickParams = _.info.clickParams();
      expect(clickParams.dclid).to.be.undefined;
      expect(clickParams.fbclid).to.be.undefined;
      expect(clickParams.gclid).to.be.undefined;
      expect(clickParams.ko_click_id).to.be.undefined;
      expect(clickParams.li_fat_id).to.be.undefined;
      expect(clickParams.msclkid).to.be.undefined;
      expect(clickParams.ttclid).to.be.undefined;
      expect(clickParams.twclid).to.be.undefined;
      expect(clickParams.wbraid).to.be.undefined;
    });
  });

  describe(`_.info.marketingParams`, function() {
    it(`matches on both UTM params and click IDs if present`, function() {
      // note it would be very unlikely for more than one click ID to be present on a URL
      document.URL = `https://www.example.com/?utm_source=google&gclid=some-gclid`;
      var marketingParams = _.info.marketingParams();
      expect(marketingParams.utm_source).to.equal(`google`);

      expect(marketingParams.utm_campaign).to.be.undefined;
      expect(marketingParams.utm_term).to.be.undefined;
      expect(marketingParams.utm_medium).to.be.undefined;
      expect(marketingParams.utm_content).to.be.undefined;

      expect(marketingParams.gclid).to.equal(`some-gclid`);

      expect(marketingParams.dclid).to.be.undefined;
      expect(marketingParams.fbclid).to.be.undefined;
      expect(marketingParams.ko_click_id).to.be.undefined;
      expect(marketingParams.li_fat_id).to.be.undefined;
      expect(marketingParams.msclkid).to.be.undefined;
      expect(marketingParams.ttclid).to.be.undefined;
      expect(marketingParams.twclid).to.be.undefined;
      expect(marketingParams.wbraid).to.be.undefined;
    });
  });

  describe(`_.info.mpPageViewProperties`, function() {
    it(`pulls page view properties from window and document`, function() {
      document.title = `Pricing - Mixpanel`;
      document.URL = `https://www.example.com/pricing?utm_source=google`;
      window.location = {
        hostname: `www.example.com`,
        pathname: `/pricing`,
        protocol: `https`,
        search: `?utm_source=google`
      };

      var pageViewProperties = _.info.mpPageViewProperties();

      expect(pageViewProperties.current_page_title).to.equal(`Pricing - Mixpanel`);
      expect(pageViewProperties.current_domain).to.equal(`www.example.com`);
      expect(pageViewProperties.current_url_path).to.equal(`/pricing`);
      expect(pageViewProperties.current_url_protocol).to.equal(`https`);
      expect(pageViewProperties.current_url_search).to.equal(`?utm_source=google`);
    });
  });
});

describe(`_.isBlockedUA`, function() {
  [
    `Mozilla/5.0 (compatible; Yahoo! Slurp; http://help.yahoo.com/help/us/ysearch/slurp)`,
    `Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)`,
    `Mozilla/5.0 (compatible; AhrefsSiteAudit/6.1; +http://ahrefs.com/robot/site-audit)`, // Desktop
    `Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.5359.128 Mobile Safari/537.36 (compatible; AhrefsSiteAudit/6.1; +http://ahrefs.com/robot/site-audit)`, // Mobile
    `Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)`,
    `Mozilla/5.0 (Windows Phone 8.1; ARM; Trident/7.0; Touch; rv:11.0; IEMobile/11.0; NOKIA; Lumia 530) like Gecko (compatible; adidxbot/2.0; +http://www.bing.com/bingbot.htm)`,
    `Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/534+ (KHTML, like Gecko) BingPreview/1.0b`,
    `Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)`,
    `Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)`,
    `Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)`,
    `facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)`,
    `facebookexternalhit/1.1`,
    `Mozilla/5.0 (compatible;PetalBot;+http://aspiegel.com/petalbot)`,
    `Mozilla/5.0(Linux;Android7.0;) AppleWebKit/537.36(KHTML,likeGecko) MobileSafari/537.36(compatible;PetalBot;+http://aspiegel.com/petalbot)`,
    `Mozilla/5.0 (compatible; Pinterestbot/1.0; +http://www.pinterest.com/bot.html)`,
    `APIs-Google (+https://developers.google.com/webmasters/APIs-Google.html)`,
    `Mediapartners-Google`,
    `Mozilla/5.0 (Linux; Android 5.0; SM-G920A) AppleWebKit (KHTML, like Gecko) Chrome Mobile Safari (compatible; AdsBot-Google-Mobile; +http://www.google.com/mobile/adsbot.html)`,
    `FeedFetcher-Google; (+http://www.google.com/feedfetcher.html)`,
    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2272.118 Safari/537.36 (compatible; Google-Read-Aloud; +/search/docs/advanced/crawling/overview-google-crawlers)`,
    `Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012; DuplexWeb-Google/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Mobile Safari/537.36`,
    `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/49.0.2623.75 Safari/537.36 Google Favicon`,
    `Mozilla/5.0 (Linux; Android 4.2.1; en-us; Nexus 5 Build/JOP40D) AppleWebKit/535.19 (KHTML, like Gecko; googleweblight) Chrome/38.0.1025.166 Mobile Safari/535.19`,
    `Mozilla/5.0 (Linux; Android 8.0; Pixel 2 Build/OPD3.170816.012; Storebot-Google/1.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Mobile Safari/537.36`,
    `Screaming Frog SEO Spider/12.3`,
    `Mozilla/5.0 (Linux; Android 7.0; Moto G (4)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4695.0 Mobile Safari/537.36 Chrome-Lighthouse`,
    `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/600.2.5 (KHTML\, like Gecko) Version/8.0.2 Safari/600.2.5 (Amazonbot/0.1; +https://developer.amazon.com/support/amazonbot)`,
    `Mozilla/5.0 (compatible; YandexRenderResourcesBot/1.0; +http://yandex.com/bots)`,
  ].forEach((ua) => {
    it(`should block bot user agent: ${ua}`, () => {
      expect(_.isBlockedUA(ua)).to.be.true;
    });
  });
});

describe(`batchedThrottle`, function () {
  let clock = null;

  beforeEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = sinon.useFakeTimers();
  });

  afterEach(function() {
    if (clock) {
      clock.restore();
    }
    clock = null;
  });

  it(`throttles invocations and executes callback with throttled arguments`, async function () {
    const callback = sinon.spy();
    const throttledCallback = batchedThrottle(callback, 100);

    throttledCallback(1);
    throttledCallback(2);
    throttledCallback(3);

    await clock.tickAsync(50);
    expect(callback.callCount).to.equal(0);
    await clock.tickAsync(51);

    expect(callback.callCount).to.equal(1);
    expect(callback.args[0][0]).to.deep.equal([1, 2, 3]);
  });


  it(`throttled fn returns a promise that resolves to the return value of the callback`, async function () {
    const callback = sinon.spy((args) => {
      return `resolved ${args.join(`,`)}`;
    });
    const throttledCallback = batchedThrottle(callback, 100);

    var firstCbPromise = throttledCallback(1).then((ret) => {
      expect(callback.callCount).to.equal(1);
      expect(callback.args[0][0]).to.deep.equal([1, 2, 3]);
      expect(ret).to.equal(`resolved 1,2,3`);
      return ret;
    });
    throttledCallback(2);
    throttledCallback(3);

    clock.tick(100);
    var returnVal = await firstCbPromise;
    expect(returnVal).to.equal(`resolved 1,2,3`);
  });

  it(`supports a callback that returns a promise`, async function () {
    const callback = sinon.spy((args) => {
      return Promise.resolve(`resolved ${args.join(`,`)}`);
    });
    const throttledCallback = batchedThrottle(callback, 100);

    var firstCbPromise = throttledCallback(1).then((ret) => {
      expect(callback.callCount).to.equal(1);
      expect(callback.args[0][0]).to.deep.equal([1, 2, 3]);
      return ret;
    });
    throttledCallback(2);
    throttledCallback(3);

    clock.tick(100);
    var returnVal = await firstCbPromise;
    expect(returnVal).to.equal(`resolved 1,2,3`);
  });

  it(`can chain a callback that returns a rejected promise`, async function () {
    const callback = sinon.spy((args) => {
      return Promise.reject(`rejected ${args.join(`,`)}`);
    });
    const throttledCallback = batchedThrottle(callback, 100);

    var firstCbPromise = throttledCallback(1).catch((ret) => {
      expect(callback.callCount).to.equal(1);
      expect(callback.args[0][0]).to.deep.equal([1, 2, 3]);
      return ret;
    });
    throttledCallback(2);
    throttledCallback(3);

    clock.tick(100);
    var returnVal = await firstCbPromise;
    expect(returnVal).to.equal(`rejected 1,2,3`);
  });
});

describe(`_.UUID`, function() {
  context(`when the environment supports the crypto API`, function() {
    beforeEach(function() {
      sinon.stub(window.crypto, `randomUUID`).returns(`fake-uuid`);
    });

    afterEach(function() {
      sinon.restore();
    });

    it(`uses the native randomUUID function`, function() {
      expect(_.UUID()).to.equal(`fake-uuid`);
    });
  });

  context(`when the environment does not support the crypto API`, function() {
    it(`generates a unique 36-char UUID`, function() {
      const generatedIds = new Set();
      for (let i = 0; i < 100; i++) {
        const uuid = _.UUID();
        expect(uuid).to.match(/^[a-f0-9\-]{36}$/);
        generatedIds.add(uuid);
      }
      expect(generatedIds.size).to.equal(100);
    });
  });
});

describe(`generateTraceparent`, function() {
  it(`generates a traceparent value in the correct string format`, function() {
    const traceparentRegex = /^00-[a-f0-9]{32}-[a-f0-9]{16}-01$/;
    const generatedTraceparents = new Set();
    for (let i = 0; i < 100; i++) {
      const traceparent = generateTraceparent();
      expect(traceparent).to.match(traceparentRegex);
      generatedTraceparents.add(traceparent);
    }
    expect(generatedTraceparents.size).to.equal(100);
  });
});

describe(`canUseCompressionStream`, function() {
  let originalCompressionStream;

  beforeEach(function() {
    originalCompressionStream = window.CompressionStream;
  });

  afterEach(function() {
    window.CompressionStream = originalCompressionStream;
  });

  it(`returns false when CompressionStream is not available`, function() {
    window.CompressionStream = undefined;
    const userAgent = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`;
    const vendor = `Apple Computer, Inc.`;
    const opera = undefined;

    expect(canUseCompressionStream(userAgent, vendor, opera)).to.be.false;
  });

  [
    { browser: `Safari 16.4`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Safari/605.1.15` },
    { browser: `Safari 16.5`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15` },
    { browser: `Mobile Safari 16.4`, userAgent: `Mozilla/5.0 (iPhone; CPU iPhone OS 16_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.4 Mobile/15E148 Safari/604.1` },
    { browser: `Mobile Safari 16.5`, userAgent: `Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1` },
  ].forEach(({ browser, userAgent }) => {
    it(`returns false for ${browser}, userAgent: ${userAgent}`, function() {
      window.CompressionStream = function() {};
      const vendor = `Apple Computer, Inc.`;
      const opera = undefined;

      expect(canUseCompressionStream(userAgent, vendor, opera)).to.be.false;
    });
  });

  [
    { browser: `Safari 16.6 (bug fixed)`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15`, vendor: `Apple Computer, Inc.` },
    { browser: `Safari 17.0`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15`, vendor: `Apple Computer, Inc.` },
    { browser: `Chrome`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36`, vendor: `Google Inc.` },
    { browser: `Firefox`, userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0`, vendor: `` },
    { browser: `Edge`, userAgent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0`, vendor: `Google Inc.` },
  ].forEach(({ browser, userAgent, vendor }) => {
    it(`returns true for ${browser}, userAgent: ${userAgent}, vendor: ${vendor}`, function() {
      window.CompressionStream = function() {};
      const opera = undefined;

      expect(canUseCompressionStream(userAgent, vendor, opera)).to.be.true;
    });
  });
});
