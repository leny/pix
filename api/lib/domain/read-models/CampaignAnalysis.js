const _ = require('lodash');
const recommendationService = require('../services/recommendation-service');

class CampaignAnalysis {
  constructor({
    campaignId,
    targetProfile,
    tutorials,
  } = {}) {
    this.id = campaignId;
    const maxSkillLevelInTargetProfile = targetProfile.maxSkillDifficulty;
    this.campaignTubeRecommendations = targetProfile.tubes.map((tube) => {
      const competence = targetProfile.getCompetence(tube.competenceId);
      const area = targetProfile.getArea(competence.areaId);
      const tutorialIds = _.uniq(_.flatMap(tube.skills, 'tutorialIds'));
      const tubeTutorials = _.filter(tutorials, (tutorial) => tutorialIds.includes(tutorial.id));
      return new CampaignTubeRecommendation({
        campaignId: campaignId,
        area,
        competence,
        tube,
        maxSkillLevelInTargetProfile,
        tutorials: tubeTutorials,
      });
    });
  }

  addValidatedKnowledgeElementsToTubeRecommendations(validatedKnowledgeElementsByTube) {
    _.each(this.campaignTubeRecommendations, (campaignTubeRecommendation) => {
      const tubeId = campaignTubeRecommendation.tubeId;
      if (tubeId in validatedKnowledgeElementsByTube) {
        campaignTubeRecommendation.addValidatedKnowledgeElements(validatedKnowledgeElementsByTube[tubeId]);
      }
    });
  }

  finalize(participantCount) {
    _.each(this.campaignTubeRecommendations, (campaignTubeRecommendation) => {
      campaignTubeRecommendation.finalize(participantCount);
    });
  }
}

class CampaignTubeRecommendation {
  constructor({
    campaignId,
    area,
    tube,
    competence,
    maxSkillLevelInTargetProfile,
    tutorials,
  } = {}) {
    this.campaignId = campaignId;
    this.tube = tube;
    this.competenceId = competence.id;
    this.competenceName = competence.name;
    this.areaColor = area.color;
    this.maxSkillLevelInTargetProfile = maxSkillLevelInTargetProfile;
    this.tutorials = tutorials;
    this.cumulativeScore = 0;
    this.participantCountSoFar = 0;
    this.averageScore = null;
  }

  get tubeId() {
    return this.tube.id;
  }

  get tubePracticalTitle() {
    return this.tube.practicalTitle;
  }

  get id() {
    return `${this.campaignId}_${this.tubeId}`;
  }

  addValidatedKnowledgeElements(validatedKnowledgeElements) {
    const knowledgeElementsByParticipant = _.toArray(_.groupBy(validatedKnowledgeElements, 'userId'));
    this._computeCumulativeScore(knowledgeElementsByParticipant);
    this.participantCountSoFar += knowledgeElementsByParticipant.length;
  }

  finalize(participantCount) {
    if (participantCount) {
      const participantCountWithoutKnowledgeElements = participantCount - this.participantCountSoFar;
      const emptyKnowledgeElementsByParticipant = _.times(participantCountWithoutKnowledgeElements, () => []);
      this._computeCumulativeScore(emptyKnowledgeElementsByParticipant);
      this.averageScore = this.cumulativeScore / participantCount;
    }
  }

  _computeCumulativeScore(knowledgeElementsByParticipant) {
    this.cumulativeScore += _(knowledgeElementsByParticipant)
      .values()
      .sumBy((knowledgeElements) =>
        recommendationService.computeRecommendationScore(
          this.tube.skills,
          this.maxSkillLevelInTargetProfile,
          knowledgeElements,
        ));
  }
}

module.exports = CampaignAnalysis;
