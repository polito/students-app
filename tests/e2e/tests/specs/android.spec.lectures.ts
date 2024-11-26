import { Lecture, LecturesApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';

import { getMondayCurrentWeek, getSaturdayCurrentWeek } from '../helpers/date';
import AgendaPage from '../pageobjects/mobile/webdriverio/agenda.page';
import BottomBar from '../pageobjects/mobile/webdriverio/bottombar.page';

function removeLectureAtSameDayAndSameHour(lectures: Lecture[]): Lecture[] {
  const occurences: { [key: string]: number } = {};

  // count occurences for every combination of date and hour
  lectures.forEach(l => {
    const startsAt = l.startsAt.toString();
    occurences[startsAt] = (occurences[startsAt] || 0) + 1;
  });

  // filter courses that have ocurrence > 1
  const newLecturesData = lectures.filter(l => {
    return occurences[l.startsAt.toString()] === 1;
  });

  return newLecturesData;
}

describe('Weekly lectures use case', () => {
  const lectureApi = new LecturesApi();

  beforeEach(async () => {
    await BottomBar.navigateToAgendaPage();
  });

  it('check weekly lectures', async function (this: Mocha.Context) {
    const mondayDate = getMondayCurrentWeek();
    const saturdayDate = getSaturdayCurrentWeek();

    const lecturesWeek = await lectureApi.getLectures({
      fromDate: mondayDate,
      toDate: saturdayDate,
    });

    if (lecturesWeek.data.length === 0) {
      // Test skipped because no lectures for current week
      this.skip();
    }

    await AgendaPage.selectWeeklyLayout();
    await AgendaPage.showLectures();

    const lectures = removeLectureAtSameDayAndSameHour(lecturesWeek.data);

    const courses = lectures.map(item => item.courseName);

    for (let i = 0; i < courses.length; i++) {
      const courseName = courses[i];

      const courseNameElement = await AgendaPage.findByUiSelectorText(
        courseName,
      );

      const courseNameText = await courseNameElement.getText();

      expectChai(courseNameText).to.be.equal(courseName);
    }
  });
});
