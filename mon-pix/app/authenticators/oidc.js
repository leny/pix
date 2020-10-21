import OIDCAuthenticator from 'ember-simple-auth-oidc/authenticators/oidc';
import getAbsoluteUrl from 'ember-simple-auth-oidc/utils/absoluteUrl';

import config from 'ember-simple-auth-oidc/config';

const {
  host,
  clientId,
  afterLogoutUri,
  endSessionEndpoint,
} = config;

export default OIDCAuthenticator.extend({

  async authenticate({ code, redirectUri }) {
    const bodyObject = {
      code,
      client_id: clientId,
      redirect_uri: redirectUri,
    };

    const body = Object.keys(bodyObject)
      .map((k) => `${k}=${encodeURIComponent(bodyObject[k])}`)
      .join('&');

    const response = await fetch('/api/token/pole-emploi', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    const data = await response.json();

    return {
      access_token: data.access_token,
      id_token: data.id_token,
      redirectUri,
    };
  },

  singleLogout(idToken) {
    if (!endSessionEndpoint) {
      return;
    }

    const params = [];

    if (afterLogoutUri) {
      params.push(`redirect_uri=${getAbsoluteUrl(afterLogoutUri)}`);
    }

    if (idToken) {
      params.push(`id_token_hint=${idToken}`);
    }

    this._redirectToUrl(`${getAbsoluteUrl(endSessionEndpoint, host)}?${params.join('&')}`);
  },

});
