import {
  CourseOverview,
  CoursesApi,
  PeopleApi,
} from '@polito/api-client/index';

import { expect as expectChai } from 'chai';

import { Gestures } from '../../helpers/gestures';
import CoursePage from '../../pageobjects/mobile/webdriverio/course/course.page';
import TeachingPage from '../../pageobjects/mobile/webdriverio/teaching.page';
import data from '../../strings/index';

describe('Course info use case', () => {
  let period: string;
  let credits: string;
  let examCallPlural: string;
  let staffSectionTitle: string;
  let moreSectionTitle: string;
  let courseId: number = -1;
  let coursesData: CourseOverview;
  const courseApi = new CoursesApi();
  const peopleApi = new PeopleApi();

  before(async () => {
    const courses = await courseApi.getCourses();

    const length = await courses.data.length;
    if (length > 0) {
      coursesData = await courses.data[0];
      courseId = coursesData.id === null ? -1 : await coursesData.id;
    }
  });

  it('check course info page', async function (this: Mocha.Context) {
    // Test skipped because no courses in teaching page
    if (courseId === -1) {
      this.skip();
    }
    await TeachingPage.navigateToCourse(coursesData.name, coursesData.cfu);
    const course = await courseApi.getCourse({ courseId });
    const courseData = await course.data;
    const professorId =
      courseData.teacherId === null ? -1 : await courseData.teacherId;

    const professorObj = await peopleApi.getPerson({ personId: professorId });
    const professorFullName =
      await `${professorObj.data.firstName} ${professorObj.data.lastName}`;

    examCallPlural = data.common.examCall_plural;
    ({ period, credits } = data.common);
    ({ staffSectionTitle, moreSectionTitle } = data.courseInfoTab);

    const courseGuideScreen: string = data.courseGuideScreen.title;

    const periodText = `${coursesData.teachingPeriod} - ${courseData.year}`;
    const periodLabelElement = await CoursePage.findByUiSelectorText(period);
    const periodLabel = await periodLabelElement.getText();

    const periodElement = await CoursePage.findByUiSelectorText(periodText);
    const periodValue = await periodElement.getText();

    const creditsLabelElement = await CoursePage.findByUiSelectorText(credits);
    const creditsLabel = await creditsLabelElement.getText();

    const creditsText = `${courseData.cfu} CFU`;
    const creditsElement = await CoursePage.findByUiSelectorText(creditsText);
    const creditsValue = await creditsElement.getText();

    const staffElement = await CoursePage.findByUiSelectorText(
      staffSectionTitle,
    );
    const staff = await staffElement.getText();

    const professorElement = await CoursePage.findByUiSelectorText(
      professorFullName,
    );
    const professor = await professorElement.getText();

    await Gestures.swipeUp();

    const examCallsLabelElement = await CoursePage.findByUiSelectorText(
      examCallPlural,
    );
    const examCallsLabel = await examCallsLabelElement.getText();

    const moreLabelElement = await CoursePage.findByUiSelectorText(
      moreSectionTitle,
    );
    const moreLabel = await moreLabelElement.getText();

    const courseGuideElement = await CoursePage.findByUiSelectorText(
      courseGuideScreen,
    );
    const courseGuide = await courseGuideElement.getText();

    expectChai(periodLabel).to.be.equal(period);
    expectChai(periodValue).to.be.equal(periodText);

    expectChai(creditsLabel).to.be.equal(credits);
    expectChai(creditsValue).to.be.equal(creditsText);

    expectChai(staff).to.be.equal(staffSectionTitle);
    expectChai(professor).to.be.equal(professorFullName);

    expectChai(examCallsLabel).to.be.equal(examCallPlural);

    expectChai(moreLabel).to.be.equal(moreSectionTitle);

    expectChai(courseGuide).to.be.equal(courseGuideScreen);
  });
});
