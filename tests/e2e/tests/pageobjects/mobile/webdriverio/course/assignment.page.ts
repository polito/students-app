import data from '../../../../strings/index';
import Driver from '../driver';

class AssignmentPage extends Driver {
  async uploadAssignment() {
    const uploadAssignment = data.courseAssignmentUploadScreen.title;
    const uploadAssignmentBtn = await this.findByAccessibilityId(
      uploadAssignment,
    );

    await uploadAssignmentBtn.click();
  }
}

export default new AssignmentPage();
