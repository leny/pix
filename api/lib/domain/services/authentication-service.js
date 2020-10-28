const axios = require('axios');
const querystring = require('querystring');
const settings = require('../../config');

const encryptionService = require('./encryption-service');

async function getUserByUsernameAndPassword({ username, password, userRepository }) {
  const foundUser = await userRepository.getByUsernameOrEmailWithRoles(username);
  await encryptionService.check(password, foundUser.password);
  return foundUser;
}

async function authenticatePoleEmploiUser({ code, clientId, redirectUri }) {
  const data = {
    client_secret: settings.poleEmploi.clientSecret,
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    redirect_uri: redirectUri,
  };

  const response = await axios.post(
    settings.poleEmploi.tokenUrl,
    querystring.stringify(data),
    {
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
    },
  );

  return {
    accessToken: response.data['access_token'],
    idToken: response.data['id_token'],
  };
}

async function getPoleEmploiUserInfo(accessToken) {
  const response = await axios.get(
    settings.poleEmploi.candidatInfoUrl,
    {
      headers: { 'Authorization': `Bearer ${accessToken}`, 'content-type': 'application/json' },
    },
  );

  return response.data;
}

module.exports = {
  authenticatePoleEmploiUser,
  getPoleEmploiUserInfo,
  getUserByUsernameAndPassword,
};
