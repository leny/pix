const _ = require('lodash');

class CampaignParticipation {

  constructor({
    id,
    // attributes
    createdAt,
    isShared,
    participantExternalId,
    sharedAt,
    // includes
    assessments,
    campaign,
    user,
    // references
    assessmentId,
    campaignId,
    userId,
  } = {}) {
    this.id = id;
    this.createdAt = createdAt;
    this.isShared = isShared;
    this.participantExternalId = participantExternalId;
    this.sharedAt = sharedAt;
    this.campaign = campaign;
    this.user = user;
    this.assessments = assessments;
    this.assessmentId = assessmentId;
    this.campaignId = campaignId;
    this.userId = userId;
  }

  getTargetProfileId() {
    return _.get(this, 'campaign.targetProfileId', null);
  }

  get lastAssessment() {
    return _.maxBy(this.assessments, 'createdAt');
  }

}

module.exports = CampaignParticipation;
