const _ = require('lodash');
const { pipe } = require('lodash/fp');
const randomString = require('randomstring');
const { STUDENT_RECONCILIATION_ERRORS } = require('../constants');

const {
  NotFoundError, SchoolingRegistrationAlreadyLinkedToUserError, AlreadyRegisteredUsernameError,
} = require('../errors');
const { areTwoStringsCloseEnough, isOneStringCloseEnoughFromMultipleStrings } = require('./string-comparison-service');
const { normalizeAndRemoveAccents, removeSpecialCharacters } = require('./validation-treatments');

const MAX_ACCEPTABLE_RATIO = 0.25;
const STRICT_MATCH_RATIO = 0;

function findMatchingCandidateIdForGivenUser(matchingUserCandidates, user) {
  const standardizedUser = _standardizeUser(user);
  const standardizedMatchingUserCandidates = _.map(matchingUserCandidates, _standardizeMatchingCandidate);

  const matchingUserFound = _findMatchingCandidate(standardizedMatchingUserCandidates, standardizedUser, STRICT_MATCH_RATIO);
  return matchingUserFound || _findMatchingCandidate(standardizedMatchingUserCandidates, standardizedUser, MAX_ACCEPTABLE_RATIO);
}

async function findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser({
  organizationId,
  reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
  higherSchoolingRegistrationRepository,
}) {
  const schoolingRegistration = await higherSchoolingRegistrationRepository.findOneRegisteredByOrganizationIdAndUserData({
    organizationId,
    reconciliationInfo: { studentNumber, birthdate },
  });

  if (!schoolingRegistration) {
    throw new NotFoundError('There are no schooling registrations found');
  }

  const schoolingRegistrationId = findMatchingCandidateIdForGivenUser([schoolingRegistration], { firstName, lastName });
  if (!schoolingRegistrationId) {
    throw new NotFoundError('There were no schoolingRegistrations matching with names');
  }

  if (!_.isNil(schoolingRegistration.userId))  {
    throw new SchoolingRegistrationAlreadyLinkedToUserError();
  }
  return schoolingRegistration;
}

async function findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser({
  organizationId,
  reconciliationInfo: { firstName, lastName, birthdate },
  schoolingRegistrationRepository,
  userRepository,
  obfuscationService,
}) {
  const schoolingRegistrations = await schoolingRegistrationRepository.findByOrganizationIdAndBirthdate({ organizationId, birthdate });

  if (_.isEmpty(schoolingRegistrations)) {
    throw new NotFoundError('There are no schooling registrations found');
  }

  const schoolingRegistrationId = findMatchingCandidateIdForGivenUser(schoolingRegistrations, { firstName, lastName });
  if (!schoolingRegistrationId) {
    throw new NotFoundError('There were no schoolingRegistrations matching with names');
  }
  const schoolingRegistration = _.find(schoolingRegistrations, { 'id': schoolingRegistrationId });

  await checkIfStudentIsAlreadyReconciledOnTheSameOrganization(schoolingRegistration, userRepository, obfuscationService);
  return schoolingRegistration;
}

async function checkIfStudentIsAlreadyReconciledOnTheSameOrganization(matchingSchoolingRegistration, userRepository, obfuscationService) {
  if (!_.isNil(matchingSchoolingRegistration.userId))  {
    const userId = matchingSchoolingRegistration.userId ;
    const user = await userRepository.getUserAuthenticationMethods(userId);
    const authenticationMethod = obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans le même établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_SAME_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = {
      shortCode: error.shortCode,
      value: authenticationMethod.value,
      userId: userId,
    };
    if (authenticationMethod.authenticatedBy === 'samlId') {
      meta.schoolingRegistrationId = matchingSchoolingRegistration.id;
    }
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

async function checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations(student, userRepository, obfuscationService) {
  if (_.get(student, 'account')) {
    const userId = student.account.userId;
    const user = await userRepository.getUserAuthenticationMethods(userId);
    const authenticationMethod = obfuscationService.getUserAuthenticationMethodWithObfuscation(user);

    const detail = 'Un compte existe déjà pour l‘élève dans un autre établissement.';
    const error = STUDENT_RECONCILIATION_ERRORS.RECONCILIATION.IN_OTHER_ORGANIZATION[authenticationMethod.authenticatedBy];
    const meta = {
      shortCode: error.shortCode,
      value: authenticationMethod.value,
      userId: userId,
    };
    throw new SchoolingRegistrationAlreadyLinkedToUserError(detail, error.code, meta);
  }
}

function _containsOneElement(arr) {
  return _.size(arr) === 1;
}

function _standardizeUser(reconciliationInfo) {
  return _(reconciliationInfo)
    .pick(['firstName', 'lastName'])
    .mapValues(_standardize)
    .value();
}

function _standardizeMatchingCandidate(matchingUserCandidate) {
  return _(matchingUserCandidate)
    .pick(['id', 'firstName', 'middleName', 'thirdName', 'lastName', 'preferredLastName'])
    .mapValues(_standardize)
    .value();
}

function _standardize(propToStandardize) {
  return _.isString(propToStandardize)
    ? pipe(normalizeAndRemoveAccents, removeSpecialCharacters)(propToStandardize)
    : propToStandardize;
}

function _findMatchingCandidate(standardizedMatchingUserCandidates, standardizedUser, maxAcceptableRatio) {
  return _(['firstName', 'middleName', 'thirdName'])
    .map(_findCandidatesMatchingWithUser(standardizedMatchingUserCandidates, standardizedUser, maxAcceptableRatio))
    .filter(_containsOneElement)
    .flatten()
    .map('id')
    .first() || null;
}

// A given name refers to either a first name, middle name or third name
function _findCandidatesMatchingWithUser(matchingUserCandidatesStandardized, standardizedUser, maxAcceptableRatio) {
  return (candidateGivenName) => matchingUserCandidatesStandardized
    .filter(_candidateHasSimilarFirstName(standardizedUser, candidateGivenName, maxAcceptableRatio))
    .filter(_candidateHasSimilarLastName(standardizedUser, maxAcceptableRatio));
}

function _candidateHasSimilarFirstName({ firstName: userFirstName }, candidateGivenName, maxAcceptableRatio = MAX_ACCEPTABLE_RATIO) {
  return (candidate) => candidate[candidateGivenName] && areTwoStringsCloseEnough(userFirstName, candidate[candidateGivenName], maxAcceptableRatio);
}

function _candidateHasSimilarLastName({ lastName }, maxAcceptableRatio = MAX_ACCEPTABLE_RATIO) {
  return (candidate) => {
    const candidatesLastName = [candidate.lastName, candidate.preferredLastName]
      .filter((candidateLastName) => candidateLastName);
    return isOneStringCloseEnoughFromMultipleStrings(lastName, candidatesLastName, maxAcceptableRatio);
  };
}

// TODO Export all functions generating random codes to an appropriate service
const _generateCode = () => {
  return randomString.generate({ length: 4, charset: 'numeric' });
};

async function generateUsernameUntilAvailable({ firstPart, secondPart, userRepository }) {
  let randomPart = secondPart;

  let username;
  let isUsernameAvailable;

  do {
    username = firstPart + randomPart;
    isUsernameAvailable = true;

    try {
      await userRepository.isUsernameAvailable(username);
    } catch (error) {
      if (error instanceof AlreadyRegisteredUsernameError) {
        isUsernameAvailable = false;
        randomPart = _generateCode();
      } else {
        throw error;
      }
    }
  } while (!isUsernameAvailable);

  return username;
}

async function createUsernameByUser({ user: { firstName, lastName, birthdate }, userRepository }) {
  const standardizeUser = _standardizeUser({ firstName, lastName });
  const [ , month, day ] = birthdate.split('-');

  const firstPart = standardizeUser.firstName + '.' + standardizeUser.lastName;
  const secondPart = day + month;

  const username = await generateUsernameUntilAvailable({ firstPart, secondPart, userRepository });

  return username;
}

module.exports = {
  generateUsernameUntilAvailable,
  createUsernameByUser,
  findMatchingCandidateIdForGivenUser,
  findMatchingHigherSchoolingRegistrationIdForGivenOrganizationIdAndUser,
  findMatchingSchoolingRegistrationIdForGivenOrganizationIdAndUser,
  checkIfStudentHasAlreadyAccountsReconciledInOtherOrganizations,
};
