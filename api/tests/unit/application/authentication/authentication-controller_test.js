const { sinon, expect, hFake } = require('../../../test-helper');

const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');

const authenticationController = require('../../../../lib/application/authentication/authentication-controller');

describe('Unit | Application | Controller | Authentication', () => {

  describe('#authenticateUser', () => {

    const accessToken = 'jwt.access.token';

    let request;

    beforeEach(() => {
      request = {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
        payload: {
          grant_type: 'password',
          username: 'user@email.com',
          password: 'user_password',
          scope: 'pix-orga',
        },
      };
      sinon.stub(usecases, 'authenticateUser').resolves(accessToken);
      sinon.stub(tokenService, 'extractUserId').returns(1);
    });

    it('should check user credentials', async () => {
      // given
      const username = 'user@email.com';
      const password = 'user_password';
      const scope = 'pix-orga';
      const source = 'pix';

      // when
      await authenticationController.authenticateUser(request, hFake);

      // then
      expect(usecases.authenticateUser).to.have.been.calledWith({
        username,
        password,
        scope,
        source,
      });
    });

    /**
     * @see https://www.oauth.com/oauth2-servers/access-tokens/access-token-response/
     */
    it('should return an OAuth 2 token response (even if we do not really implement OAuth 2 authorization protocol)', async () => {
      // when
      const response = await authenticationController.authenticateUser(request, hFake);

      // then
      const expectedResponseResult = {
        token_type: 'bearer',
        access_token: accessToken,
        user_id: 1,
      };
      expect(response.source).to.deep.equal(expectedResponseResult);
      expect(response.statusCode).to.equal(200);
      expect(response.headers).to.deep.equal({
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
      });
    });
  });

  describe('#authenticateExternalUser', () => {
    let request;
    const accessToken = 'jwt.access.token';
    const user = {
      username: 'saml.jackson1234',
      password: 'Pix123',
    };

    beforeEach(() => {
      request = {
        payload: {
          data: {
            attributes: {
              username: user.username,
              password: user.password,
              'external-user-token': 'SamlJacksonToken',
              'expected-user-id': 1,
            },
            type: 'external-user-authentication-requests',
          },
        },
      };

      sinon.stub(tokenService, 'extractUserId').returns(1);
      sinon.stub(usecases, 'updateUserSamlId').resolves();
    });

    it('should check user credentials', async () => {
      // given
      const source = 'external';
      sinon.stub(usecases, 'authenticateUser').resolves(accessToken);

      // when
      await authenticationController.authenticateExternalUser(request, hFake);

      // then
      expect(usecases.authenticateUser).to.have.been.calledWith({
        username: user.username,
        password: user.password,
        source,
      });
    });

    it('should update user samlId', async () => {
      // given
      sinon.stub(usecases, 'authenticateUser').resolves(accessToken);

      // when
      await authenticationController.authenticateExternalUser(request, hFake);

      // then
      expect(usecases.updateUserSamlId).to.have.been.calledWith({
        userId: 1,
        externalUserToken: 'SamlJacksonToken',
        expectedUserId: 1,
      });
    });

    it('should return an access token', async () => {
      // given
      sinon.stub(usecases, 'authenticateUser').resolves(accessToken);

      // when
      const response = await authenticationController.authenticateExternalUser(request, hFake);

      // then
      expect(response.statusCode).to.equal(200);
      expect(response.source.data.attributes['access-token']).to.equal(accessToken);
    });
  });
});
