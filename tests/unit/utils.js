import { expect } from 'chai';

import { extract_domain, determine_eligibility } from '../../src/utils';

describe(`determine_eligibility`, function() {
  it(`returns different results for different strings`, function() {
    expect(determine_eligibility(`foobar`, 50)).to.be.ok;
    expect(determine_eligibility(`Obrecht`, 50)).not.to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 50)).not.to.be.ok;
    expect(determine_eligibility(`259bc8bc47e5d846a5f605291d6a3081`, 50)).to.be.ok;
    expect(determine_eligibility(`4d7e557043413032be13f331d67075f0`, 50)).to.be.ok;
    expect(determine_eligibility(`9297ad31ef1e5b2abca601c17e31e2ca`, 50)).not.to.be.ok;
    expect(determine_eligibility(`93d75eb9284e619c62e9d3213246ae7a`, 50)).not.to.be.ok;
  });

  it(`respects percentage threshold deterministically`, function() {
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 10)).not.to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 25)).not.to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 50)).not.to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 55)).to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 75)).to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 95)).to.be.ok;
  });

  it(`lets everything through at 100%`, function() {
    expect(determine_eligibility(`foobar`, 100)).to.be.ok;
    expect(determine_eligibility(`Obrecht`, 100)).to.be.ok;
    expect(determine_eligibility(`e7dc0f73ec3550799049cb8d64fde831`, 100)).to.be.ok;
    expect(determine_eligibility(`259bc8bc47e5d846a5f605291d6a3081`, 100)).to.be.ok;
    expect(determine_eligibility(`4d7e557043413032be13f331d67075f0`, 100)).to.be.ok;
    expect(determine_eligibility(`9297ad31ef1e5b2abca601c17e31e2ca`, 100)).to.be.ok;
    expect(determine_eligibility(`93d75eb9284e619c62e9d3213246ae7a`, 100)).to.be.ok;
  });
});

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
