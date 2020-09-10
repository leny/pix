import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Checkpoint', function() {
  setupTest();

  describe('#afterModel', function() {

    let route;
    let assessment;

    let reloadStub;
    let storeStub;
    let getCampaignStub;

    beforeEach(function() {
      route = this.owner.lookup('route:assessments/checkpoint');

      reloadStub = sinon.stub();
      getCampaignStub = sinon.stub();
      storeStub = {
        query: sinon.stub().returns({ get: getCampaignStub }),
      };
      assessment = {
        codeCampaign: 'AZERTY',
        type: 'CAMPAIGN',
        isForCampaign: true,
        isCompetenceEvaluation: false,
        set: sinon.stub(),
        belongsTo: sinon.stub().returns({ reload: reloadStub }),
      };
      route.set('store', storeStub);
    });

    it('should force the progression reload (that has certainly changed since last time)', async function() {
      // when
      await route.afterModel(assessment);

      // then
      sinon.assert.calledWith(assessment.belongsTo, 'progression');
      sinon.assert.calledOnce(reloadStub);
    });

    it('should retrieve campaign with campaign code in assessment', async function() {
      // when
      await route.afterModel(assessment);

      // then
      sinon.assert.calledWith(storeStub.query, 'campaign', { filter: { code: assessment.codeCampaign } });
      sinon.assert.calledOnce(getCampaignStub);
    });
  });

});
