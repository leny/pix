import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    const store = this.store;
    const assessmentId = params.assessment_id;
    return RSVP.hash({
      campaignParticipation: store.query('campaignParticipation', { filter: { assessmentId } })
        .then((campaignParticipations) => campaignParticipations.get('firstObject')),
      assessment: store.findRecord('assessment', assessmentId),
    });
  },

  async afterModel(model) {
    await model.campaignParticipation.belongsTo('campaignParticipationResult').reload();
    await model.campaignParticipation.belongsTo('campaign').reload({ include: 'targetProfile' });
    const improvableNextChallenge = await this.store.queryRecord('challenge', { assessmentId: model.assessment.id, tryImproving: true });
    const compaignNotAlreadyShared = !model.campaignParticipation.isShared;

    this.controllerFor('campaigns.skill-review')
      .set('isAssessmentImprovable', Boolean(improvableNextChallenge) && compaignNotAlreadyShared);
  },
});
