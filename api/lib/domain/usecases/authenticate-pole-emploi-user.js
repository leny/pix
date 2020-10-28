const User = require('../models/User');
const { UserNotFoundError } = require('../errors');

module.exports = async function authenticatePoleEmploiUser({
  code,
  clientId,
  redirectUri,
  authenticationService,
  tokenService,
  userRepository,
}) {

  try {
    const peTokens = await authenticationService.authenticatePoleEmploiUser({ code, clientId, redirectUri });
    const userInfo = await authenticationService.getPoleEmploiUserInfo(peTokens.accessToken);

    const user = new User({
      firstName: userInfo.given_name,
      lastName: userInfo.family_name,
      email: userInfo.email,
      password: '',
      cgu: false,
    });
    user.idIdentiteExterne = userInfo.idIdentiteExterne;

    let foundUser;
    try {
      foundUser = await userRepository.getByEmail(user.email);
    } catch (error) {
      if (error instanceof UserNotFoundError) {
        foundUser = await userRepository.create(user);
      } else {
        throw error;
      }
    }

    const accessToken = tokenService.createAccessTokenFromUser(foundUser, 'external');

    return {
      access_token: accessToken,
      id_token: peTokens.idToken,
    };
  } catch (error) {
    console.log(error);
  }
};
