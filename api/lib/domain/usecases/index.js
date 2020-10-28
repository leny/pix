const dependencies = {
  answerRepository: require('../../infrastructure/repositories/answer-repository'),
  assessmentRepository: require('../../infrastructure/repositories/assessment-repository'),
  badgeAcquisitionRepository: require('../../infrastructure/repositories/badge-acquisition-repository'),
  assessmentResultRepository: require('../../infrastructure/repositories/assessment-result-repository'),
  badgeCriteriaService: require('../../domain/services/badge-criteria-service'),
  badgeRepository: require('../../infrastructure/repositories/badge-repository'),
  campaignAssessmentParticipationRepository: require('../../infrastructure/repositories/campaign-assessment-participation-repository'),
  campaignAssessmentParticipationResultRepository: require('../../infrastructure/repositories/campaign-assessment-participation-result-repository'),
  campaignAssessmentParticipationSummaryRepository: require('../../infrastructure/repositories/campaign-assessment-participation-summary-repository'),
  campaignCollectiveResultRepository: require('../../infrastructure/repositories/campaign-collective-result-repository'),
  campaignParticipationInfoRepository: require('../../infrastructure/repositories/campaign-participation-info-repository'),
  campaignParticipationRepository: require('../../infrastructure/repositories/campaign-participation-repository'),
  campaignParticipationResultRepository: require('../../infrastructure/repositories/campaign-participation-result-repository'),
  campaignProfilesCollectionParticipationSummaryRepository: require('../../infrastructure/repositories/campaign-profiles-collection-participation-summary-repository'),
  campaignProfileRepository: require('../../infrastructure/repositories/campaign-profile-repository'),
  campaignRepository: require('../../infrastructure/repositories/campaign-repository'),
  campaignCsvExportService: require('../../domain/services/campaign-csv-export-service'),
  certificationAssessmentRepository: require('../../infrastructure/repositories/certification-assessment-repository'),
  certificationAttestationPdf: require('../../infrastructure/utils/pdf/certification-attestation-pdf'),
  certificationCandidatesOdsService: require('../../domain/services/certification-candidates-ods-service'),
  certificationCandidateRepository: require('../../infrastructure/repositories/certification-candidate-repository'),
  certificationReportRepository: require('../../infrastructure/repositories/certification-report-repository'),
  certificationChallengesService: require('../../domain/services/certification-challenges-service'),
  certificationCenterRepository: require('../../infrastructure/repositories/certification-center-repository'),
  certificationCenterMembershipRepository: require('../../infrastructure/repositories/certification-center-membership-repository'),
  certificationChallengeRepository: require('../../infrastructure/repositories/certification-challenge-repository'),
  placementProfileService: require('../../domain/services/placement-profile-service'),
  partnerCertificationRepository: require('../../infrastructure/repositories/partner-certification-repository'),
  certificationCourseRepository: require('../../infrastructure/repositories/certification-course-repository'),
  certificationRepository: require('../../infrastructure/repositories/certification-repository'),
  challengeRepository: require('../../infrastructure/repositories/challenge-repository'),
  cleaCertificationStatusRepository: require('../../infrastructure/repositories/clea-certification-status-repository'),
  competenceEvaluationRepository: require('../../infrastructure/repositories/competence-evaluation-repository'),
  competenceMarkRepository: require('../../infrastructure/repositories/competence-mark-repository'),
  competenceRepository: require('../../infrastructure/repositories/competence-repository'),
  competenceTreeRepository: require('../../infrastructure/repositories/competence-tree-repository'),
  correctionRepository: require('../../infrastructure/repositories/correction-repository'),
  courseRepository: require('../../infrastructure/repositories/course-repository'),
  encryptionService: require('../../domain/services/encryption-service'),
  getCompetenceLevel: require('../../domain/services/get-competence-level'),
  higherSchoolingRegistrationRepository: require('../../infrastructure/repositories/higher-schooling-registration-repository'),
  improvementService: require('../../domain/services/improvement-service'),
  juryCertificationSummaryRepository: require('../../infrastructure/repositories/jury-certification-summary-repository'),
  jurySessionRepository: require('../../infrastructure/repositories/jury-session-repository'),
  knowledgeElementRepository: require('../../infrastructure/repositories/knowledge-element-repository'),
  mailService: require('../../domain/services/mail-service'),
  membershipRepository: require('../../infrastructure/repositories/membership-repository'),
  obfuscationService: require('../../domain/services/obfuscation-service'),
  organizationService: require('../../domain/services/organization-service'),
  organizationRepository: require('../../infrastructure/repositories/organization-repository'),
  organizationInvitationRepository: require('../../infrastructure/repositories/organization-invitation-repository'),
  passwordGenerator: require('../../domain/services/password-generator'),
  pickChallengeService: require('../services/pick-challenge-service'),
  prescriberRepository: require('../../infrastructure/repositories/prescriber-repository'),
  resetPasswordService: require('../../domain/services/reset-password-service'),
  reCaptchaValidator: require('../../infrastructure/validators/grecaptcha-validator'),
  scoringCertificationService: require('../../domain/services/scoring/scoring-certification-service'),
  scorecardService: require('../../domain/services/scorecard-service'),
  settings: require('../../config'),
  skillRepository: require('../../infrastructure/repositories/skill-repository'),
  sessionAuthorizationService: require('../../domain/services/session-authorization-service'),
  sessionRepository: require('../../infrastructure/repositories/session-repository'),
  schoolingRegistrationRepository: require('../../infrastructure/repositories/schooling-registration-repository'),
  stageRepository: require('../../infrastructure/repositories/stage-repository'),
  studentRepository: require('../../infrastructure/repositories/student-repository'),
  schoolingRegistrationsXmlService: require('../../domain/services/schooling-registrations-xml-service'),
  targetProfileRepository: require('../../infrastructure/repositories/target-profile-repository'),
  targetProfileWithLearningContentRepository: require('../../infrastructure/repositories/target-profile-with-learning-content-repository'),
  targetProfileShareRepository: require('../../infrastructure/repositories/target-profile-share-repository'),
  tokenService: require('../../domain/services/token-service'),
  tubeRepository: require('../../infrastructure/repositories/tube-repository'),
  tutorialEvaluationRepository: require('../../infrastructure/repositories/tutorial-evaluation-repository'),
  tutorialRepository: require('../../infrastructure/repositories/tutorial-repository'),
  userOrgaSettingsRepository: require('../../infrastructure/repositories/user-orga-settings-repository'),
  userReconciliationService: require('../services/user-reconciliation-service'),
  userRepository: require('../../infrastructure/repositories/user-repository'),
  userTutorialRepository: require('../../infrastructure/repositories/user-tutorial-repository'),
  verifyCertificateCodeService: require('../../domain/services/verify-certificate-code-service'),
};

const { injectDependencies } = require('../../infrastructure/utils/dependency-injection');

module.exports = injectDependencies({
  acceptOrganizationInvitation: require('./accept-organization-invitation'),
  acceptPixLastTermsOfService: require('./accept-pix-last-terms-of-service'),
  acceptPixCertifTermsOfService: require('./accept-pix-certif-terms-of-service'),
  acceptPixOrgaTermsOfService: require('./accept-pix-orga-terms-of-service'),
  addCertificationCandidateToSession: require('./add-certification-candidate-to-session'),
  addTutorialEvaluation: require('./add-tutorial-evaluation'),
  addTutorialToUser: require('./add-tutorial-to-user'),
  anonymizeUser: require('./anonymize-user'),
  attachTargetProfilesToOrganization: require('./attach-target-profiles-to-organization'),
  archiveCampaign: require('./archive-campaign'),
  assignCertificationOfficerToJurySession: require('./assign-certification-officer-to-jury-session'),
  authenticateUser: require('./authenticate-user'),
  beginCampaignParticipationImprovement: require('./begin-campaign-participation-improvement'),
  completeAssessment: require('./complete-assessment'),
  computeCampaignAnalysis: require('./compute-campaign-analysis'),
  computeCampaignCollectiveResult: require('./compute-campaign-collective-result'),
  computeCampaignParticipationAnalysis: require('./compute-campaign-participation-analysis'),
  correctAnswerThenUpdateAssessment: require('./correct-answer-then-update-assessment'),
  createAndReconcileUserToSchoolingRegistration: require('./create-and-reconcile-user-to-schooling-registration'),
  createUserAndReconcileToSchoolingRegistrationFromExternalUser: require('./create-user-and-reconcile-to-schooling-registration-from-external-user'),
  createCampaign: require('./create-campaign'),
  createCertificationCenterMembership: require('./create-certification-center-membership'),
  createMembership: require('./create-membership'),
  createOrganization: require('./create-organization'),
  createOrganizationInvitations: require('./create-organization-invitations'),
  createOrUpdateUserOrgaSettings: require('./create-or-update-user-orga-settings'),
  createSession: require('./create-session'),
  createUser: require('./create-user'),
  deleteUnlinkedCertificationCandidate: require('./delete-unlinked-certification-candidate'),
  disableMembership: require('./disable-membership'),
  dissociateUserFromSchoolingRegistration: require('./dissociate-user-from-schooling-registration'),
  dissociateSchoolingRegistrations: require('./dissociate-schooling-registrations'),
  finalizeSession: require('./finalize-session'),
  findAnswerByChallengeAndAssessment: require('./find-answer-by-challenge-and-assessment'),
  findAnswerByAssessment: require('./find-answer-by-assessment'),
  findAssociationBetweenUserAndSchoolingRegistration: require('./find-association-between-user-and-schooling-registration'),
  findCampaignParticipationsRelatedToAssessment: require('./find-campaign-participations-related-to-assessment'),
  findCampaignProfilesCollectionParticipationSummaries: require('./find-campaign-profiles-collection-participation-summaries'),
  findCompetenceEvaluations: require('./find-competence-evaluations'),
  findCompletedUserCertifications: require('./find-completed-user-certifications'),
  findLatestOngoingUserCampaignParticipations: require('./find-latest-ongoing-user-campaign-participations'),
  findPaginatedCampaignAssessmentParticipationSummaries: require('./find-paginated-campaign-assessment-participation-summaries'),
  findPaginatedFilteredCertificationCenters: require('./find-paginated-filtered-certification-centers'),
  findPaginatedFilteredOrganizationCampaigns: require('./find-paginated-filtered-organization-campaigns'),
  findPaginatedFilteredOrganizationMemberships: require('./find-paginated-filtered-organization-memberships'),
  findPaginatedFilteredOrganizations: require('./find-paginated-filtered-organizations'),
  findPaginatedFilteredTargetProfiles: require('./find-paginated-filtered-target-profiles'),
  findPaginatedFilteredUsers: require('./find-paginated-filtered-users'),
  findPendingOrganizationInvitations: require('./find-pending-organization-invitations'),
  findSessionsForCertificationCenter: require('./find-sessions-for-certification-center'),
  findStudentsFromCertificationCenterId: require('./find-students-from-certification-center-id'),
  findCampaignAssessments: require('./find-campaign-assessments'),
  findTutorials: require('./find-tutorials'),
  findUserTutorials: require('./find-user-tutorials'),
  findPaginatedFilteredSchoolingRegistrations: require('./find-paginated-filtered-schooling-registrations'),
  flagSessionResultsAsSentToPrescriber: require('./flag-session-results-as-sent-to-prescriber'),
  generateUsername: require('./generate-username'),
  generateUsernameWithTemporaryPassword: require('./generate-username-with-temporary-password'),
  getAnswer: require('./get-answer'),
  getAssessment: require('./get-assessment'),
  getAttendanceSheet: require('./get-attendance-sheet'),
  getCandidatesImportSheet: require('./get-candidates-import-sheet'),
  getCampaign: require('./get-campaign'),
  getCampaignAssessmentParticipation: require('./get-campaign-assessment-participation'),
  getCampaignAssessmentParticipationResult: require('./get-campaign-assessment-participation-result'),
  getCampaignParticipation: require('./get-campaign-participation'),
  getCampaignParticipationResult: require('./get-campaign-participation-result'),
  getCampaignProfile: require('./get-campaign-profile'),
  getCampaignReport: require('./get-campaign-report'),
  getCertificationAttestation: require('./certificate/get-certification-attestation'),
  getCertificationCenter: require('./get-certification-center'),
  getCertificationCourse: require('./get-certification-course'),
  getCorrectionForAnswer: require('./get-correction-for-answer'),
  getCurrentUser: require('./get-current-user'),
  getExternalAuthenticationRedirectionUrl: require('./get-external-authentication-redirection-url'),
  getJurySession: require('./get-jury-session'),
  getNextChallengeForCampaignAssessment: require('./get-next-challenge-for-campaign-assessment'),
  getNextChallengeForCertification: require('./get-next-challenge-for-certification'),
  getNextChallengeForCompetenceEvaluation: require('./get-next-challenge-for-competence-evaluation'),
  getNextChallengeForDemo: require('./get-next-challenge-for-demo'),
  getNextChallengeForPreview: require('./get-next-challenge-for-preview'),
  getOrCreateSamlUser: require('./get-or-create-saml-user'),
  getOrganizationDetails: require('./get-organization-details'),
  getOrganizationInvitation: require('./get-organization-invitation'),
  getPrescriber: require('./get-prescriber'),
  getPrivateCertificate: require('./certificate/get-private-certificate'),
  getProgression: require('./get-progression'),
  getSchoolingRegistrationsCsvTemplate: require('./get-schooling-registrations-csv-template'),
  getScorecard: require('./get-scorecard'),
  getSession: require('./get-session'),
  getSessionCertificationCandidates: require('./get-session-certification-candidates'),
  getSessionCertificationReports: require('./get-session-certification-reports'),
  getSessionResults: require('./get-session-results'),
  getShareableCertificate: require('./certificate/get-shareable-certificate'),
  getTargetProfileDetails: require('./get-target-profile-details'),
  getUserCampaignParticipationToCampaign: require('./get-user-campaign-participation-to-campaign'),
  getUserProfileSharedForCampaign: require('./get-user-profile-shared-for-campaign'),
  getUserCertificationCenterMemberships: require('./get-user-certification-center-memberships'),
  isUserCertifiable: require('./is-user-certifiable'),
  getUserDetailsForAdmin: require('./get-user-details-for-admin'),
  getUserProfile: require('./get-user-profile'),
  getUserWithMemberships: require('./get-user-with-memberships'),
  importCertificationCandidatesFromAttendanceSheet: require('./import-certification-candidates-from-attendance-sheet'),
  importHigherSchoolingRegistrations: require('./import-higher-schooling-registrations'),
  importSchoolingRegistrationsFromSIECLEFormat: require('./import-schooling-registrations-from-siecle'),
  improveCompetenceEvaluation: require('./improve-competence-evaluation'),
  linkUserToSessionCertificationCandidate: require('./link-user-to-session-certification-candidate'),
  reconcileHigherSchoolingRegistration: require('./reconcile-higher-schooling-registration'),
  reconcileSchoolingRegistration: require('./reconcile-schooling-registration'),
  reconcileUserToOrganization: require('./reconcile-user-to-organization'),
  rememberUserHasSeenAssessmentInstructions: require('./remember-user-has-seen-assessment-instructions'),
  resetScorecard: require('./reset-scorecard'),
  retrieveCampaignInformation: require('./retrieve-campaign-information'),
  retrieveLastOrCreateCertificationCourse: require('./retrieve-last-or-create-certification-course'),
  saveCertificationCenter: require('./save-certification-center'),
  shareCampaignResult: require('./share-campaign-result'),
  sendScoInvitation: require('./send-sco-invitation'),
  startCampaignParticipation: require('./start-campaign-participation'),
  startOrResumeCompetenceEvaluation: require('./start-or-resume-competence-evaluation'),
  startWritingCampaignAssessmentResultsToStream: require('./start-writing-campaign-assessment-results-to-stream'),
  startWritingCampaignProfilesCollectionResultsToStream: require('./start-writing-campaign-profiles-collection-results-to-stream'),
  unarchiveCampaign: require('./unarchive-campaign'),
  updateCampaign: require('./update-campaign'),
  updateExpiredPassword: require('./update-expired-password'),
  updateMembership: require('./update-membership'),
  updateOrganizationInformation: require('./update-organization-information'),
  updatePublicationSession: require('./update-publication-session'),
  updateSchoolingRegistrationDependentUserPassword: require('./update-schooling-registration-dependent-user-password'),
  updateSession: require('./update-session'),
  updateStudentNumber: require('./update-student-number'),
  updateUserDetailsForAdministration: require('./update-user-details-for-administration'),
  updateUserPassword: require('./update-user-password'),
  updateUserSamlId: require('./update-user-samlId'),

}, dependencies);
