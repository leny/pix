import Route from '@ember/routing/route';

export default class TargetProfileOrganizationsRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
    name: { refreshModel: true },
    type: { refreshModel: true },
    externalId: { refreshModel: true },
  };

  async model(params) {
    const targetProfile = this.modelFor('authenticated.target-profiles.target-profile');
    await targetProfile.hasMany('organizations').reload({ adapterOptions: {
      filter: {
        name: params.name ? params.name.trim() : '',
        type: params.type ? params.type.trim() : '',
        externalId: params.externalId ? params.externalId.trim() : '',
      },
      page: {
        number: params.pageNumber,
        size: params.pageSize,
      },
    } });
    return targetProfile;
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      controller.pageNumber = 1;
      controller.pageSize = 10;
      controller.name = null;
      controller.type = null;
      controller.externalId = null;
    }
  }
}
