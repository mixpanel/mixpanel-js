import { expect } from 'chai';

import { extract_domain } from '../../src/utils';

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
