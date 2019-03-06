import { htmlSafe } from '@ember/string';
import { computed } from '@ember/object';
import Component from '@ember/component';

export default Component.extend({

  competence: {
    name: 'Mener une recherche et une veille d’information',
    domain: 'Informations et données',
    level: '4',
    pixUntilNextLevel: 60,
    color: 'red'
  },

});
