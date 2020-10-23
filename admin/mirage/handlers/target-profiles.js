import { Response } from 'ember-cli-mirage';
import _ from 'lodash';

function attachTargetProfiles(schema, request) {
  const organizationId = request.params.id;
  const params = JSON.parse(request.requestBody);
  const targetProfilesToAttach = params.data.attributes['target-profiles-to-attach'];
  targetProfilesToAttach.forEach((targetProfileId) =>
    schema.targetProfiles.create({ organizationId, name: `Profil ${targetProfileId}` }));
  return new Response(204);
}

async function getOrganizationTargetProfiles(schema, request) {
  const organizationId = request.params.id;
  return schema.targetProfiles.where({ organizationId });
}

function findPaginatedTargetProfileOrganizations(schema, request) {
  const targetProfileId = request.params.id;
  const queryParams = request.queryParams;
  const targetProfileShares = schema.targetProfileShares.where({ targetProfileId }).models;
  const organizationIds = targetProfileShares.map((targetProfileShare) => targetProfileShare.organizationId);
  const organizations = schema.organizations.where({ id: organizationIds }).models;
  const rowCount = organizations.length;

  const pagination = _getPaginationFromQueryParams(queryParams);
  const paginatedOrganizations = _applyPagination(organizations, pagination);

  const json = this.serialize({ modelName: 'organization', models: paginatedOrganizations }, 'organization');
  json.meta = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    rowCount,
    pageCount: Math.ceil(rowCount / pagination.pageSize),
  };
  return json;
}

function _getPaginationFromQueryParams(queryParams) {
  return {
    pageSize: parseInt(_.get(queryParams, 'page[size]',  10)),
    page: parseInt(_.get(queryParams, 'page[number]',  1)),
  };
}

function _applyPagination(summaries, { page, pageSize }) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  return _.slice(summaries, start, end);
}

export {
  attachTargetProfiles,
  getOrganizationTargetProfiles,
  findPaginatedTargetProfileOrganizations,
};
