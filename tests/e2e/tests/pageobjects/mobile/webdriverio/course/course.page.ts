import data from '../../../../strings/index';
import Driver from '../driver';

class CoursePage extends Driver {
  async navigateToAssignment() {
    const assignments = data.courseAssignmentsTab.title;
    const assignmentsTabElement = await this.findByUiSelectorText(assignments);
    await assignmentsTabElement.click();
  }
}

export default new CoursePage();
