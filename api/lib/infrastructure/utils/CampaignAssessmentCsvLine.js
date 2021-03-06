const moment = require('moment');
const _ = require('lodash');

const STATS_COLUMNS_COUNT = 3;
const EMPTY_CONTENT = 'NA';

class CampaignAssessmentCsvLine {
  constructor({
    organization,
    campaign,
    campaignParticipationInfo,
    targetProfile,
    participantKnowledgeElementsByCompetenceId,
    stages = [],
    acquiredBadges,
    campaignParticipationService,
  }) {
    this.organization = organization;
    this.campaign = campaign;
    this.campaignParticipationInfo = campaignParticipationInfo;
    this.targetProfile = targetProfile;
    this.stages = stages;
    this.targetedKnowledgeElementsCount = _.sum(_.map(participantKnowledgeElementsByCompetenceId, (knowledgeElements) => knowledgeElements.length));
    this.targetedKnowledgeElementsByCompetence = participantKnowledgeElementsByCompetenceId;
    this.acquiredBadges = acquiredBadges;
    this.campaignParticipationService = campaignParticipationService;

    // To have the good `this` in _getStatsForCompetence, it is necessary to bind it
    this._getStatsForCompetence = this._getStatsForCompetence.bind(this);
  }

  toCsvLine() {
    return [
      ...this._makeCommonColumns(),
      ...(this.campaignParticipationInfo.isShared ? this._makeSharedColumns() : this._makeNotSharedColumns()),
    ];
  }

  _makeSharedStatsColumns({ targetedSkillCount, validatedSkillCount }) {
    return [
      _.round(validatedSkillCount / targetedSkillCount, 2),
      targetedSkillCount,
      validatedSkillCount,
    ];
  }

  _makeEmptyColumns(times) {
    return _.times(times, () => EMPTY_CONTENT);
  }

  _getStatsForCompetence(competence) {
    return {
      targetedSkillCount: competence.skillCount,
      validatedSkillCount: this._countValidatedKnowledgeElementsForCompetence(competence.id),
    };
  }

  _makeCompetenceColumns() {
    return _.flatMap(this.targetProfile.competences, (competence) => this._makeSharedStatsColumns({
      id: competence.id,
      ...this._getStatsForCompetence(competence),
    }));
  }

  _makeAreaColumns() {
    return _.flatMap(this.targetProfile.areas, ({ id, competences }) => {
      const areaCompetenceStats = competences.map(this._getStatsForCompetence);

      const targetedSkillCount = _.sumBy(areaCompetenceStats, 'targetedSkillCount');
      const validatedSkillCount = _.sumBy(areaCompetenceStats, 'validatedSkillCount');

      return this._makeSharedStatsColumns({
        id,
        targetedSkillCount,
        validatedSkillCount,
      });
    });
  }

  _makeBadgesColumns() {
    return _.flatMap(this.targetProfile.badges, (badge) => _.includes(this.acquiredBadges, badge) ? 'Oui' : 'Non');
  }

  _makeCommonColumns() {
    return [
      this.organization.name,
      this.campaign.id,
      this.campaign.name,
      this.targetProfile.name,
      this.campaignParticipationInfo.participantLastName,
      this.campaignParticipationInfo.participantFirstName,
      ...this._studentNumber,
      ...(this.campaign.idPixLabel ? [this.campaignParticipationInfo.participantExternalId] : []),
      this.campaignParticipationService.progress(this.campaignParticipationInfo.isCompleted, this.targetedKnowledgeElementsCount, this.targetProfile.skills.length),
      moment.utc(this.campaignParticipationInfo.createdAt).format('YYYY-MM-DD'),
      this.campaignParticipationInfo.isShared ? 'Oui' : 'Non',
      this.campaignParticipationInfo.isShared ? moment.utc(this.campaignParticipationInfo.sharedAt).format('YYYY-MM-DD') : EMPTY_CONTENT,
      ...(this.campaignParticipationInfo.isShared ? this._makeBadgesColumns() : this._makeEmptyColumns(this.targetProfile.badges.length)),
      ...(this.stages[0] ? [this._getReachedStage()] : []),
      this.campaignParticipationInfo.isShared ? this._percentageSkillsValidated() : EMPTY_CONTENT,
    ];
  }

  _makeSharedColumns() {
    return [
      ...this._makeCompetenceColumns(),
      ...this._makeAreaColumns(),
      ...this.organization.isSco ? [] : _.map(this.targetProfile.skills, (targetedSkill) => this._makeSkillColumn(targetedSkill)),
    ];
  }

  _makeNotSharedColumns() {
    return [
      ...this._makeEmptyColumns(this.targetProfile.competences.length * STATS_COLUMNS_COUNT),
      ...this._makeEmptyColumns(this.targetProfile.areas.length * STATS_COLUMNS_COUNT),
      ...this.organization.isSco ? [] : this._makeEmptyColumns(this.targetProfile.skills.length),
    ];
  }

  _makeSkillColumn(targetedSkill) {
    let knowledgeElementForSkill = null;
    const competenceId = this.targetProfile.getCompetenceIdOfSkill(targetedSkill.id);
    if (competenceId in this.targetedKnowledgeElementsByCompetence) {
      knowledgeElementForSkill = _.find(this.targetedKnowledgeElementsByCompetence[competenceId],
        (knowledgeElement) => knowledgeElement.skillId === targetedSkill.id);
    }

    return knowledgeElementForSkill
      ? (knowledgeElementForSkill.isValidated ? 'OK' : 'KO')
      : 'Non testé';

  }

  _countValidatedKnowledgeElementsForCompetence(competenceId) {
    return this.targetedKnowledgeElementsByCompetence[competenceId]
      .filter((knowledgeElement) => knowledgeElement.isValidated)
      .length;
  }

  _countValidatedKnowledgeElements() {
    return _.sum(_.map(this.targetedKnowledgeElementsByCompetence, (knowledgeElements) => {
      return knowledgeElements.filter((knowledgeElement) => knowledgeElement.isValidated)
        .length;
    }));
  }

  _percentageSkillsValidated() {
    return _.round(this._countValidatedKnowledgeElements() / this.targetProfile.skills.length, 2);
  }

  _getReachedStage() {
    if (!this.campaignParticipationInfo.isShared) {
      return EMPTY_CONTENT;
    }

    const percentageSkillsValidated = this._percentageSkillsValidated() * 100;

    return this.stages.filter((stage) => percentageSkillsValidated >= stage.threshold).length;
  }

  get _studentNumber() {
    let studentNumber = null;
    if (this.organization.isSup && this.organization.isManagingStudents) {
      studentNumber = this.campaignParticipationInfo.studentNumber || '';
    }
    return [studentNumber].filter((value) => value != null);
  }
}

module.exports = CampaignAssessmentCsvLine;
