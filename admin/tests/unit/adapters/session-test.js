import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Adapter | session', function(hooks) {
  setupTest(hooks);
  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:session');
  });

  module('#urlForUpdateRecord', function() {
    test('should build update url from session id', function(assert) {
      // when
      const options = { adapterOptions: {} };
      const url = adapter.urlForUpdateRecord(123, 'session', options);

      assert.ok(url.endsWith('/sessions/123'));
    });

    test('should build specific url to results-sent-to-prescriber', function(assert) {
      // when
      const options = { adapterOptions: { flagResultsAsSentToPrescriber: true } };
      const url = adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/results-sent-to-prescriber'));
    });

    test('should build specific url to publication', function(assert) {
      // when
      const options = { adapterOptions: { updatePublishedCertifications: true, isPublished: true } };
      const url = adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/publication'));
    });

    test('should build specific url to user assignment', function(assert) {
      // when
      const options = { adapterOptions: { userAssignment: true } };
      const url = adapter.urlForUpdateRecord(123, 'session', options);

      // then
      assert.ok(url.endsWith('/sessions/123/user-assignment'));
    });
  });
  
  module('#updateRecord', function() {

    module('when updatePublishedCertification adapterOption is passed', function() {

      [true, false].forEach(function(isTrue) {
        test(`should send a patch request with publish to ${isTrue}`, function(assert) {
          // when
          const snapshot = { id: 123, adapterOptions: { updatePublishedCertifications: true, toPublish: isTrue } };
          adapter.ajax = sinon.stub();

          adapter.updateRecord(null, { modelName: 'session' }, snapshot);

          // then
          sinon.assert.calledWithExactly(adapter.ajax, 'http://localhost:3000/api/sessions/123/publication', 'PATCH', { data: { data: { attributes: { toPublish: isTrue } } } });
          assert.ok(adapter);
        });
      });
    });
    
    module('when userAssignment adapterOption passed', function(hooks) {

      hooks.beforeEach(function() {
        sinon.stub(adapter, 'ajax');
      });

      hooks.afterEach(function() {
        adapter.ajax.restore();
      });

      test('should send a patch request to user assignment endpoint', async function(assert) {
        // given
        adapter.ajax.resolves();

        // when
        await adapter.updateRecord(null, { modelName: 'session' }, { id: 123, adapterOptions: { userAssignment: true } });

        // then
        sinon.assert.calledWith(adapter.ajax, 'http://localhost:3000/api/sessions/123/user-assignment', 'PATCH');
        assert.ok(adapter); /* required because QUnit wants at least one expect (and does not accept Sinon's one) */
      });
    });
  });
});
