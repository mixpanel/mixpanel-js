import { expect } from 'chai';

import { extract_domain, _, window, document } from '../../src/utils';

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

  it(`returns UTM parameters with null default value`, function() {
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
    expect(marketingParams.utm_source).to.equal(`google`)

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
    document.URL = `https://www.example.com/pricing?utm_source=google`
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
