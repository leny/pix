import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-pe', function() {

  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:login-pe');
    expect(route).to.be.ok;
  });
});
