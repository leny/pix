const moment = require('moment');
const bluebird = require('bluebird');
const csvService = require('../services/csv-service');
const { pipe, assign: addProperties } = require('lodash/fp');
const _ = require('lodash');

const {
  UserNotAuthorizedToGetCampaignResultsError,
  CampaignWithoutOrganizationError
} = require('../errors');

let headerPropertyMap = [
  {
    headerName: 'Nom de l\'organisation',
    propertyName: 'organizationName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: 'ID Campagne',
    propertyName: 'campaignId',
    type: csvService.valueTypes.NUMBER,
  },
  {
    headerName: 'Nom de la campagne',
    propertyName: 'campaignName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: 'Nom du Profil Cible',
    propertyName: 'targetProfileName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: 'Nom du Participant',
    propertyName: 'userLastName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: 'Prénom du Participant',
    propertyName: 'userFirstName',
    type: csvService.valueTypes.TEXT,
  },
  {
    headerName: '% de progression',
    propertyName: 'progression',
    type: csvService.valueTypes.NUMBER,
  },
  {
    headerName: 'Date de début',
    propertyName: 'startedAt',
    type: csvService.valueTypes.NUMBER,
  },
  {
    headerName: 'Partage (O/N)',
    propertyName: 'isShared',
    type: csvService.valueTypes.TEXT,
  },
];

const headerPropertyMapForSharedCampaign = [
  {
    headerName: 'Date du partage',
    propertyName: 'sharedAt',
    type: csvService.valueTypes.NUMBER,
  },
  {
    headerName: '% maitrise de l\'ensemble des acquis du profil',
    propertyName: 'knowledgeElementsValidatedPercentage',
    type: csvService.valueTypes.NUMBER,
  },
];

async function _fetchUserIfHeHasAccessToCampaignOrganization(userId, organizationId, userRepository) {
  if (_.isNil(organizationId)) {
    throw new CampaignWithoutOrganizationError(`Campaign without organization : ${organizationId}`);
  }
  const user = await userRepository.getWithMemberships(userId);

  if (!user.hasAccessToOrganization(organizationId)) {
    throw new UserNotAuthorizedToGetCampaignResultsError(`User does not have an access to the organization ${organizationId}`);
  }
  return user;
}

function _cleanText(text) {
  return `${text.replace(/"/g, '')}`;
}

function createCsvHeader(enhancedTargetProfile, idPixLabel) {
  return _.concat(
    _getBaseHeaders(idPixLabel),
    _getCompetencesHeaders(enhancedTargetProfile.competences),
    _getAreasHeaders(enhancedTargetProfile.areas),
    _getSkillsHeaders(enhancedTargetProfile.skillNames),
  );
}

function _getBaseHeaders(idPixLabel) {
  return [
    'Nom de l\'organisation',
    'ID Campagne',
    'Nom de la campagne',
    'Nom du Profil Cible',
    'Nom du Participant',
    'Prénom du Participant',
    idPixLabel ? _cleanText(idPixLabel) : null,
    '% de progression',
    'Date de début',
    'Partage (O/N)',
    'Date du partage',
    '% maitrise de l\'ensemble des acquis du profil',
  ].filter(Boolean);
}

function _getCompetencesHeaders(competences) {
  return _.flatMap(competences, _getCompetenceHeaders);
}

function _getCompetenceHeaders(competence) {
  return [
    `% de maitrise des acquis de la compétence ${competence.name}`,
    `Nombre d'acquis du profil cible dans la compétence ${competence.name}`,
    `Acquis maitrisés dans la compétence ${competence.name}`,
  ];
}

function _getAreasHeaders(areas) {
  return _.flatMap(areas, _getAreaHeaders);
}

function _getAreaHeaders(area) {
  return [
    `% de maitrise des acquis du domaine ${area.title}`,
    `Nombre d'acquis du profil cible du domaine ${area.title}`,
    `Acquis maitrisés du domaine ${area.title}`,
  ];
}

function _getSkillsHeaders(skillNames) {
  return _.flatMap(skillNames, _getSkillHeaders);
}

function _getSkillHeaders(skillName) {
  return [
    `${skillName}`,
  ];
}

function _stateOfSkill(skillId, knowledgeElements) {
  const knowledgeElementForSkill = _.find(knowledgeElements, { skillId });
  if (knowledgeElementForSkill) {
    return knowledgeElementForSkill.isValidated ? 'OK' : 'KO';
  } else {
    return 'Non testé';
  }
}

function _getValidatedSkillsForCompetence(competenceSkills, knowledgeElements) {
  return _(knowledgeElements)
    .filter('isValidated')
    .filter(_knowledgeElementRelatedTo(competenceSkills))
    .size();
}

function _knowledgeElementRelatedTo(skills) {
  return (knowledgeElement) => _(skills).map('id').includes(knowledgeElement.skillId);
}

function _competenceRelatedTo(skillIds) {
  return (competence) => skillIds.some((skillId) => competence.skills.includes(skillId));
}

function _withSkill(headers, targetProfileKnowledgeElements, line) {
  return (skill) => {
    line = pipe(csvService.addTextCell(`${skill.name}`, _stateOfSkill(skill.id, targetProfileKnowledgeElements), headers))(line);
  };
}

function _withCompetence(headers, enhancedTargetProfile, line) {
  return (competence) => {
    line = pipe(
      csvService.addNumberCell(`% de maitrise des acquis de la compétence ${competence.name}`, competence.percentage, headers),
      csvService.addNumberCell(`Nombre d'acquis du profil cible dans la compétence ${competence.name}`, competence.skillsForThisCompetence.length, headers),
      csvService.addNumberCell(`Acquis maitrisés dans la compétence ${competence.name}`, competence.numberOfSkillsValidatedForThisCompetence, headers),
    )(line);
  };
}

function enhanceTargetProfileCompetencesAndAreas(enhancedTargetProfile) {
  return _.each(enhancedTargetProfile.competences, (competence) => {
    const skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    const numberOfSkillsValidatedForThisCompetence = _getValidatedSkillsForCompetence(skillsForThisCompetence, enhancedTargetProfile.knowledgeElements);

    competence.skillsForThisCompetence = enhancedTargetProfile.getSkillsInCompetence(competence);
    competence.numberOfSkillsValidatedForThisCompetence = numberOfSkillsValidatedForThisCompetence;
    competence.percentage = _.round(competence.numberOfSkillsValidatedForThisCompetence / skillsForThisCompetence.length, 2);

    const areaForThisCompetence = enhancedTargetProfile.areas.find((area) => area.title === competence.area.title);
    areaForThisCompetence.numberSkillsValidated += numberOfSkillsValidatedForThisCompetence;
    areaForThisCompetence.numberSkillsTested = areaForThisCompetence.numberSkillsTested + skillsForThisCompetence.length;
  });
}

function _withArea(headers, line) {
  return (area) => {
    const percentage = _.round(area.numberSkillsValidated / area.numberSkillsTested, 2);
    line = pipe(
      csvService.addNumberCell(`% de maitrise des acquis du domaine ${area.title}`, percentage, headers),
      csvService.addNumberCell(`Nombre d'acquis du profil cible du domaine ${area.title}`, area.numberSkillsTested, headers),
      csvService.addNumberCell(`Acquis maitrisés du domaine ${area.title}`, area.numberSkillsValidated, headers),
    )(line);
  };
}

function _initLineWithPlaceholders(headers) {
  return headers.map(() => 'NA');
}

function enhanceTargetProfile(targetProfile, competences) {
  const enhancedTargetProfile = _.assign(targetProfile, {
    skillNames: _.map(targetProfile.skills, 'name'),
    skillIds: _.map(targetProfile.skills, 'id'),
  });
  enhancedTargetProfile.competences = competences.filter(_competenceRelatedTo(enhancedTargetProfile.skillIds));
  enhancedTargetProfile.areas = _(enhancedTargetProfile.competences).map('area').map(addProperties({ numberSkillsValidated: 0, numberSkillsTested: 0 })).value();
  return enhancedTargetProfile;
}

module.exports = async function startWritingCampaignResultsToStream(
  {
    userId,
    campaignId,
    writableStream,
    campaignRepository,
    userRepository,
    targetProfileRepository,
    competenceRepository,
    campaignParticipationRepository,
    organizationRepository,
    smartPlacementAssessmentRepository,
    knowledgeElementRepository,
  }) {

  const campaign = await campaignRepository.get(campaignId);

  const [user, targetProfile, competences, organization, listCampaignParticipation] = await Promise.all([
    _fetchUserIfHeHasAccessToCampaignOrganization(userId, campaign.organizationId, userRepository),
    targetProfileRepository.get(campaign.targetProfileId),
    competenceRepository.list(),
    organizationRepository.get(campaign.organizationId),
    campaignParticipationRepository.findByCampaignId(campaign.id),
  ]);

  const enhancedTargetProfile = enhanceTargetProfile(targetProfile, competences);

  const headers = createCsvHeader(enhancedTargetProfile, campaign.idPixLabel);

  if (campaign.idPixLabel) {
    const item = {
      headerName: _cleanText(campaign.idPixLabel),
      propertyName: 'campaignLabel',
      type: csvService.valueTypes.TEXT,
    };
    headerPropertyMap = csvService.insert(item).into(headerPropertyMap).after('Prénom du Participant');
  }

  // WHY: add \uFEFF the UTF-8 BOM at the start of the text, see:
  // - https://en.wikipedia.org/wiki/Byte_order_mark
  // - https://stackoverflow.com/a/38192870
  const headerLine = '\uFEFF' + csvService.getHeadersWithQuotes(headers).join(';') + '\n';

  writableStream.write(headerLine);
  bluebird.mapSeries(listCampaignParticipation, async (campaignParticipation) => {

    const [assessment, allKnowledgeElements] = await Promise.all([
      smartPlacementAssessmentRepository.get(campaignParticipation.assessmentId),
      knowledgeElementRepository.findUniqByUserId({ userId: campaignParticipation.userId, limitDate: campaignParticipation.sharedAt })
    ]);

    enhancedTargetProfile.knowledgeElements = allKnowledgeElements.filter(_knowledgeElementRelatedTo(targetProfile.skills));
    enhanceTargetProfileCompetencesAndAreas(enhancedTargetProfile);

    let line = _initLineWithPlaceholders(headers);

    line = pipe(
      campaignParticipation.isShared ? _withEndResults(campaignParticipation, enhancedTargetProfile, headers) : _.identity
    )(line);

    let rawData = {
      organizationName: organization.name,
      campaignId,
      campaignName: campaign.name,
      targetProfileName: targetProfile.name,
      userFirstName: user.firstName,
      userLastName: user.lastName,
      campaignLabel: campaignParticipation.participantExternalId,
      progression: assessment.isCompleted ? 1 : enhancedTargetProfile.getProgression(allKnowledgeElements),
      startedAt: moment.utc(assessment.createdAt).format('YYYY-MM-DD'),
      isShared: campaignParticipation.isShared ? 'Oui' : 'Non',
    };

    if (campaignParticipation.isShared) {
      rawData = {
        ...rawData,
        sharedAt: moment.utc(campaignParticipation.sharedAt).format('YYYY-MM-DD'),
        knowledgeElementsValidatedPercentage: enhancedTargetProfile.getKnowledgeElementsValidatedPercentage(enhancedTargetProfile.knowledgeElements),
      };
      const headerPropertyMapFull = [...headerPropertyMap, ...headerPropertyMapForSharedCampaign];
      csvService.updateCsvLine({ line, rawData, headerPropertyMap: headerPropertyMapFull });
    } else {
      csvService.updateCsvLine({ line, rawData, headerPropertyMap });
    }

    line = line.join(';') + '\n';

    writableStream.write(line);
  }).then(() => {
    writableStream.end();
  }).catch((error) => {
    writableStream.emit('error', error);
    throw error;
  });

  const fileName = `Resultats-${campaign.name}-${campaign.id}-${moment.utc().format('YYYY-MM-DD-hhmm')}.csv`;
  return { fileName };
};

function _withEndResults(campaignParticipation, enhancedTargetProfile, headers) {
  return (line) => {

    _.forEach(enhancedTargetProfile.competences, _withCompetence(headers, enhancedTargetProfile, line));
    _.forEach(enhancedTargetProfile.areas, _withArea(headers, line));
    _.forEach(enhancedTargetProfile.skills, _withSkill(headers, enhancedTargetProfile.knowledgeElements, line));

    return line;
  };
}
