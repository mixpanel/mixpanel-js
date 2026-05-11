/* global chai, sinon */

const { expect } = chai;
import {
  randName,
  clearAllLibInstances,
  clearAllStorage,
  getXhrRequestData,
  untilDone
} from "../utils";

export function autocaptureTests(mixpanel) {
  describe(`autocapture pageview with heatmap`, function() {
    this.timeout(10000);

    let token, origHref, xhr, requests;

    beforeEach(async () => {
      token = randName();
      origHref = window.location.href;
      await clearAllLibInstances(mixpanel);
      await clearAllStorage();

      requests = [];
      xhr = sinon.useFakeXMLHttpRequest();
      xhr.onCreate = (req) => {
        requests.push(req);
      };
    });

    afterEach(async () => {
      if (xhr) {
        xhr.restore();
      }
      window.history.replaceState(null, null, origHref);
      if (mixpanel.actest) {
        await mixpanel.actest.stop_session_recording();
      }
      await clearAllLibInstances(mixpanel);
    });

    it(`does not track pageviews when both disabled`, async () => {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: false },
          record_heatmap_data: false,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?test=1";
      window.history.pushState({ path: newUrl }, '', newUrl);

      const pageviewRequests = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests.length).to.equal(0);
    });

    it(`tracks pageviews with heatmap tag when recording started`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: false },
          record_heatmap_data: true,
          record_sessions_percent: 1.0,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      mixpanel.actest.start_session_recording();
      await untilDone(() => Object.keys(mixpanel.actest.get_session_recording_properties()).length > 0);

      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?test=2";
      window.history.pushState({ path: newUrl }, '', newUrl);

      const pageviewRequests = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests.length).to.equal(1);
      const eventData = getXhrRequestData(pageviewRequests[0]);
      expect(eventData.event).to.equal('$mp_web_page_view');
      expect(eventData.properties.$captured_for_heatmap).to.equal(true);
    });

    it(`tracks pageviews without heatmap tag when pageview enabled and heatmap disabled`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: 'full-url' },
          record_heatmap_data: false,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      const pageviewRequests = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });

      expect(pageviewRequests.length).to.equal(1);
      const initEventData = getXhrRequestData(pageviewRequests[0]);
      expect(initEventData.event).to.equal('$mp_web_page_view');
      expect(initEventData.properties.$captured_for_heatmap).to.be.undefined;
    });

    it(`adds heatmap tag when both enabled and recording started`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: 'full-url' },
          record_heatmap_data: true,
          record_sessions_percent: 1.0,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      const pageviewRequests1 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests1.length).to.equal(1);
      const initEventData = getXhrRequestData(pageviewRequests1[0]);
      expect(initEventData.event).to.equal('$mp_web_page_view');
      expect(initEventData.properties.$captured_for_heatmap).to.be.undefined;

      mixpanel.actest.start_session_recording();
      await untilDone(() => Object.keys(mixpanel.actest.get_session_recording_properties()).length > 0);

      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?test=4";
      window.history.pushState({ path: newUrl }, '', newUrl);

      const pageviewRequests2 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests2.length).to.equal(2);
      const eventData = getXhrRequestData(pageviewRequests2[1]);
      expect(eventData.event).to.equal('$mp_web_page_view');
      expect(eventData.properties.$captured_for_heatmap).to.equal(true);
    });

    it(`uses full-url mode by default with heatmap`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: false },
          record_heatmap_data: true,
          record_sessions_percent: 1.0,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      mixpanel.actest.start_session_recording();
      await untilDone(() => Object.keys(mixpanel.actest.get_session_recording_properties()).length > 0);

      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?test=5";
      window.history.pushState({ path: newUrl }, '', newUrl);

      const pageviewRequests1 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests1.length).to.equal(1);
      const eventData = getXhrRequestData(pageviewRequests1[0]);
      expect(eventData.event).to.equal('$mp_web_page_view');
      expect(eventData.properties.$captured_for_heatmap).to.equal(true);

      const hashUrl = newUrl + "#section";
      window.history.pushState({ path: hashUrl }, '', hashUrl);

      const pageviewRequests2 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests2.length).to.equal(2);
      const hashEventData = getXhrRequestData(pageviewRequests2[1]);
      expect(hashEventData.event).to.equal('$mp_web_page_view');
      expect(hashEventData.properties.$captured_for_heatmap).to.equal(true);
    });

    it(`does not track pageviews when heatmap enabled but recording not started`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: false },
          record_heatmap_data: true,
          record_sessions_percent: 1.0,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + "?test=pageview-not-recording";
      window.history.pushState({ path: newUrl }, '', newUrl);

      const pageviewRequests = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });

      expect(pageviewRequests.length).to.equal(0);
    });

    it(`respects explicit pageview mode even when heatmap is recording`, async function() {
      await new Promise((resolve) => {
        mixpanel.init(token, {
          autocapture: { pageview: 'url-with-path' },
          record_heatmap_data: true,
          record_sessions_percent: 1.0,
          batch_requests: false,
          loaded: resolve
        }, `actest`);
      });

      mixpanel.actest.start_session_recording();
      await untilDone(() => Object.keys(mixpanel.actest.get_session_recording_properties()).length > 0);

      const baseUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      const urlWithQuery = baseUrl + "?token=secret123&session=xyz";
      window.history.pushState({ path: urlWithQuery }, '', urlWithQuery);

      const pageviewRequests1 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests1.length).to.equal(1);

      const urlWithDifferentQuery = baseUrl + "?token=different456&session=abc";
      window.history.pushState({ path: urlWithDifferentQuery }, '', urlWithDifferentQuery);

      const pageviewRequests2 = requests.filter(req => {
        if (!req.requestBody) return false;
        const data = getXhrRequestData(req);
        return data && data.event === '$mp_web_page_view';
      });
      expect(pageviewRequests2.length).to.equal(1);
    });
  });
}
