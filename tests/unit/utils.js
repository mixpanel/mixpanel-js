import { expect } from 'chai';

import { DOMAIN_MATCH_REGEX } from '../../src/utils';

describe(`DOMAIN_MATCH_REGEX`, function() {
  it(`matches simple domain names`, function() {
    expect(`mixpanel.com`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`mixpanel.com`);
    expect(`abc.org`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`abc.org`);
    expect(`superlongdomainnamepartfifteen.net`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`superlongdomainnamepartfifteen.net`);
    expect(`startup.ly`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`startup.ly`);
  });

  it(`extracts domain names from hostnames with subdomains`, function() {
    expect(`mysubdomain.mixpanel.com`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`mixpanel.com`);
    expect(`superfly.startup.ly`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`startup.ly`);
  });

  it(`supports many labels in a single hostname`, function() {
    expect(`my.sub.domain.mixpanel.com`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`mixpanel.com`);
  });

  it(`supports a few common country code second-level domain names (ccSLD)`, function() {
    expect(`www.oxford.ac.uk`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`oxford.ac.uk`);
    expect(`www.dmv.ca.gov`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`dmv.ca.gov`);
    expect(`www.imcc.isa.us`.match(DOMAIN_MATCH_REGEX)[0]).to.equal(`imcc.isa.us`);

    // unfortunately can't do a real (sub)domain extraction without a list
    // cases like www.avignon.aeroport.fr will still fail
  });
});
