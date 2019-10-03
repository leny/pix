const faker = require('faker');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

module.exports = function buildOrganizationInvitation({
  id = faker.random.number(),
  organizationId = faker.random.number(),
  email = faker.internet.email(),
  status = OrganizationInvitation.StatusType.PENDING,
  createdAt = faker.date.recent(),
  updatedAt = faker.date.recent(),
} = {}) {
  return new OrganizationInvitation({
    id,
    organizationId,
    email,
    status,
    createdAt,
    updatedAt,
  });
};