import Component from '@ember/component';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/string';

export default Component.extend({
  classNames: ['card', 'border-primary', 'certification-details-competence'],
  rate:0,
  competence:null,
  juryRate:false,
  certifiedWidth: computed('competence', function(){
    let obtainedLevel = this.get('competence').obtainedLevel;
    return htmlSafe('width:'+Math.round((obtainedLevel / 8)*100)+'%');
  }),
  positionedWidth: computed('competence', function() {
    let positionedLevel = this.get('competence').positionedLevel;
    return htmlSafe('width:'+Math.round((positionedLevel / 8)*100)+'%');
  }),
  answers: computed('competence', function() {
    const competence = this.get('competence');
    return competence.answers;
  }),
  actions: {
    updateCompetence() {
      this.set('competenceJury', this.updateScore());
      this.get('updateDetails')();
    }
  },
  updateScore: function() {
    const juryRate = this.get('juryRate');
    const rate = this.get('rate');
    const competence = this.get('competence');
    const score = competence.obtainedScore;
    let newScore = this.computeScore((juryRate!==false)?juryRate:rate);
    if (newScore.score != score) {
      this.set('competence.juryScore', newScore.score);
      this.set('competence.juryLevel', newScore.level);
      this.set('competence.juryWidth', htmlSafe('width:'+Math.round((newScore.level / 8)*100)+'%'));
      return true;
    } else {
      this.set('competence.juryScore', false);
      return false;
    }
  },
  computeScore: function(rate) {
    if (rate < 50) {
      return {score:0, level:0};
    }
    const score = this.get('competence').positionedScore;
    const level = this.get('competence').positionedLevel;
    const answers = this.get('competence').answers;
    let answersData = answers.reduce((data, answer) => {
      let value = answer.jury ? answer.jury:answer.result;
      if (value === 'ok') {
        data.good++;
      } else if (value === 'partially') {
        data.partially++;
      }
      if (value !== 'skip') {
        data.count++;
      }
      return data;
    }
    , {good:0, partially:0, count:0});
    switch (answersData.count) {
      case 0:
        return {score:0, level:0};
      case 1:
        if (answersData.good === 1) {
          return {score:score, level:level};
        }
        return {score:0, level:0};
      case 2:
        if (answersData.good === 2) {
          return {score:score, level:level};
        } else if (answersData.good === 1) {
          if (answersData.partially === 1) {
            if (rate >= 80) {
              return {score:score, level:level};
            } else {
              return {score:score-8, level:level-1};
            }
          }
        }
        return {score:0, level:0};
      case 3:
        if (answersData.good === 3) {
          return {score:score, level:level};
        } else if (answersData.good === 2) {
          if (rate >= 80) {
            return {score:score, level:level};
          } else {
            return {score:score-8, level:level-1};
          }
        }
        return {score:0, level:0};
    }
  },
  competenceJury:computed('juryRate', {
    get() {
      const juryRate = this.get('juryRate');
      if (juryRate !== false )  {
        return this.updateScore();
      } else {
        return false;
      }
    },
    set(key, value) {
      return value;
    }
  }),
});
