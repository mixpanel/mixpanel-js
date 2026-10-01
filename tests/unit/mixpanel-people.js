import { expect } from 'chai';

import { MixpanelPeople } from '../../src/mixpanel-people';
import { MockMixpanelLib } from './test-utils/mock-mixpanel-lib';

describe(`MixpanelPeople`, function() {
  describe(`set before identify`, function() {
    it(`queues dates in the encoded format and leaves the caller's object alone`, function() {
      const queued = [];
      const mockMixpanel = new MockMixpanelLib();
      mockMixpanel._flags = {identify_called: false};
      mockMixpanel.persistence = {
        _add_to_people_queue: (action, data) => queued.push({action, data}),
      };
      const people = new MixpanelPeople();
      people._init(mockMixpanel);

      const created = new Date(Date.UTC(2020, 0, 2, 3, 4, 5));
      const props = {created};
      people.set(props);

      expect(queued).to.have.length(1);
      expect(queued[0].action).to.equal(`$set`);
      expect(queued[0].data.$set.created).to.equal(`2020-01-02T03:04:05`);
      expect(props.created).to.equal(created);
    });
  });
});
