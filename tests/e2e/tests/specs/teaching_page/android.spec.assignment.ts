import { CoursesApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';

import { setup } from '../../../config/setup';
import { timeoutTest } from '../../helpers/date';
import AssignmentPage from '../../pageobjects/mobile/webdriverio/course/assignment.page';
import CoursePage from '../../pageobjects/mobile/webdriverio/course/course.page';
import UploadAssignmentPage from '../../pageobjects/mobile/webdriverio/course/uploadAssignment.page';
import TeachingPage from '../../pageobjects/mobile/webdriverio/teaching.page';

describe('Upload assignment use case', () => {
  let courseName: string = '';
  let courseCfu: number = -1;
  let courseId: number = -1;

  const coursesApi = new CoursesApi();

  before(async () => {
    const courses = await coursesApi.getCourses();
    const length = await courses.data.length;
    if (length > 0) {
      const coursesData = await courses.data[0];
      courseName = await coursesData.name;
      courseCfu = await coursesData.cfu;
      courseId = coursesData.id === null ? -1 : await coursesData.id;
    }
  });
  it('upload assignment with scan file option', async function (this: Mocha.Context) {
    // Test skipped because no courses in teaching page
    if (courseId === -1) {
      this.skip();
    }
    await TeachingPage.navigateToCourse(courseName, courseCfu);
    await CoursePage.navigateToAssignment();
    await AssignmentPage.uploadAssignment();

    await UploadAssignmentPage.selectScanDocumentOption();

    await UploadAssignmentPage.scanDocument();

    const description = `test_emulator_file_scan_${setup.timestamp}`;
    await UploadAssignmentPage.writeDescription(description);

    await UploadAssignmentPage.uploadAssignment();

    await driver.pause(timeoutTest);

    const assignments = await coursesApi.getCourseAssignments({ courseId });

    const assignmentUploaded = assignments.data.filter(
      assignment => assignment.description === description,
    )[0];

    const fileUploaded = await AssignmentPage.findByUiSelectorText(
      assignmentUploaded.description,
    );
    const fileUploadedText = await fileUploaded.getText();

    expectChai(fileUploadedText).to.be.equal(description);
  });
});
