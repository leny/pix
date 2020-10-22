import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AddStudentList extends Component {

  @service notifications;

  get headerCheckboxStatus() {
    return this.hasCheckedEverything
      ? 'checked'
      : this.hasCheckedSomething ? 'partial' : 'unchecked';
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.studentList.any((student) => student.isSelected);
    return hasOneOrMoreCheck;
  }

  get hasCheckedEverything() {
    const allCertifReportsAreCheck = this.args.studentList.every((student) => student.isSelected);
    return allCertifReportsAreCheck;
  }

  @action
  toggleItem(item) {
    item.isSelected = !item.isSelected;
  }

  @action
  toggleAllItems() {
    const state = this.headerCheckboxStatus;
    let newState = true;
    if (state === 'checked') {
      newState = false;
    }
    this.args.studentList.forEach((student) => {
      student.isSelected = newState;
    });
  }

  @action
  async saveStudents() {
    // todo : remonter cette méthode dans la route add-student ? 🤔
    const sessionId = this.args.session.id;
    const studentListToAdd = this.args.studentList.filter((student) => student.isSelected);
    console.log(studentListToAdd);
    try {
      await this.args.session.save({ adapterOptions: { studentListToAdd, sessionId } });
    } catch (error) {
      // todo : check error mieux
      this.notifications.error('Une erreur est survenue au moment d‘enregistrer les candidats... ');
    }
  }
}
