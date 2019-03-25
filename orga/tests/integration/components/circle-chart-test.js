import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | circle-chart', function(hooks) {
  setupRenderingTest(hooks);

  module('Component rendering', function() {

    test('should render component', async function(assert) {
      // when
      await render(hbs`{{circle-chart}}`);

      // then
      assert.dom('.circle-chart__container').exists();
    });

    test('should display the progressing circle with given value', async function(assert) {
      // given
      const value = '60';
      this.set('value', value);

      // when
      await render(hbs`{{circle-chart value=value}}`);

      // then
      assert.dom('.circle-chart--slice').hasAttribute('stroke-dasharray',`${value}, 100`)
    });
  });
});
