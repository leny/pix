const _ = require('lodash');

const BookshelfCampaign = require('../data/campaign');
const competenceDatasource = require('../datasources/airtable/competence-datasource');
const skillDatasource = require('../datasources/airtable/skill-datasource');
const CampaignCollectiveResult = require('../../domain/models/CampaignCollectiveResult');
const CampaignCompetenceCollectiveResult = require('../../domain/models/CampaignCompetenceCollectiveResult');

module.exports = {

  async getCampaignCollectiveResult(campaignId) {

    const { competences, campaign, targetedSkillIds, targetedSkills } = await _fetchData(campaignId);
    const { participants, participantsKEs } = _filterData(campaign, targetedSkillIds);
    const { participantsKEsByCompetenceId, targetedSkillsByCompetenceId } = _groupByCompetenceId(participantsKEs, targetedSkills);
    const campaignCompetenceCollectiveResults = _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participants, targetedSkillsByCompetenceId, participantsKEsByCompetenceId);

    return new CampaignCollectiveResult({ id: campaignId, campaignCompetenceCollectiveResults });
  }
};

async function _fetchData(campaignId) {

  const [competences, campaign] = await Promise.all([
    competenceDatasource.list(),
    _fetchCampaignWithRelatedData(campaignId)
  ]);

  const targetedSkillIds = campaign.related('targetProfile').related('skillIds').map((targetProfileSkill) => targetProfileSkill.get('skillId'));
  const targetedSkills = await skillDatasource.findByRecordIds(targetedSkillIds);

  return { competences, campaign, targetedSkillIds, targetedSkills };
}

function _filterData(campaign, targetedSkillIds) {

  const sharedParticipations = campaign.related('campaignParticipations').filter((participation) => participation.get('isShared'));
  const participants = sharedParticipations.map((participation) => participation.related('user'));
  const participantsKEs = _filterParticipantsKEs(sharedParticipations, targetedSkillIds);

  return { participants, participantsKEs };
}

function _groupByCompetenceId(participantsKEs, targetedSkills) {

  const participantsKEsByCompetenceId = _.groupBy(participantsKEs, (bookshelfKE) => bookshelfKE.get('competenceId'));
  const targetedSkillsByCompetenceId = _.groupBy(targetedSkills, 'competenceId');

  return { participantsKEsByCompetenceId, targetedSkillsByCompetenceId };
}

function _fetchCampaignWithRelatedData(campaignId) {

  return BookshelfCampaign.where({ id: campaignId }).fetch({
    withRelated: [
      'campaignParticipations',
      'campaignParticipations.user',
      'campaignParticipations.user.knowledgeElements',
      'targetProfile.skillIds'
    ]
  });
}

function _filterParticipantsKEs(sharedParticipations, targetedSkillIds) {
  return _.flatMap(sharedParticipations, (participation) => {
    return participation
      .related('user')
      .related('knowledgeElements')
      .filter((ke) => ke.isValidated()
        && ke.isCoveredByTargetProfile(targetedSkillIds)
        && ke.wasCreatedBefore(participation.get('sharedAt')))
      .filter((ke, index, otherKEs) => ke.isTheLastOneForGivenSkill(otherKEs));
  });
}

function _forgeCampaignCompetenceCollectiveResults(campaignId, competences, participants, targetedSkillsByCompetenceId, participantsKEsByCompetenceId) {

  const results = Object.keys(targetedSkillsByCompetenceId).reduce((results, competenceId) => {

    const competence = _.find(competences, { id: competenceId });

    const averageValidatedSkills = _.size(participants) ? _.size(participantsKEsByCompetenceId[competenceId]) / _.size(participants) : 0;

    const campaignCompetenceCollectiveResult = new CampaignCompetenceCollectiveResult({
      campaignId,
      competenceId,
      competenceName: competence.name,
      competenceIndex: competence.index,
      totalSkillsCount: _.size(targetedSkillsByCompetenceId[competenceId]),
      averageValidatedSkills,
    });

    results.push(campaignCompetenceCollectiveResult);

    return results;
  }, []);

  return _.sortBy(results, ['competenceIndex']);
}
