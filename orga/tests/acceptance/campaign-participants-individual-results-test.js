import { module, test } from 'qunit';
import { visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  createPrescriberByUser,
} from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Participants Individual Results', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  let participant, campaignParticipationResult;

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    createPrescriberByUser(user);

    server.create('campaign', { id: 1 });
    participant = server.create('user', { firstName: 'Jack', lastName: 'Doe' });
    campaignParticipationResult = server.create('campaign-participation-result', 'withCompetenceResults');

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it should display individual results when participation is shared', async function(assert) {
    // given
    server.create('campaign-participation', { campaignId: 1, userId: participant.id, campaignParticipationResult, isShared: true });

    // when
    await visit('/campagnes/1/participants/1');

    // then
    assert.contains('Compétences (2)');
  });

  test('it should not display individual results when participation is not shared', async function(assert) {
    // given
    server.create('campaign-participation', { campaignId: 1, userId: participant.id, campaignParticipationResult, isShared: false });

    // when
    await visit('/campagnes/1/participants/1');

    // then
    assert.contains('Compétences (-)');
  });
});
