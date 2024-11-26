import { ExamsApi, PeopleApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';
import { isBefore, isToday } from 'date-fns';

import {
  convertDateToHourMinute,
  convertToDateString,
} from '../../helpers/date';
import ExamPage from '../../pageobjects/mobile/webdriverio/exam.page';
import TeachingPage from '../../pageobjects/mobile/webdriverio/teaching.page';
import data from '../../strings/index';

describe('Book exam use case', () => {
  const examsApi = new ExamsApi();
  const peopleApi = new PeopleApi();

  it('successfully book exam', async function (this: Mocha.Context) {
    const exams = await examsApi.getExams();
    const now = new Date();

    // GET ONLY EXAM THAT CAN BE BOOKED
    const examsData = exams.data.filter(
      item =>
        item.status === 'available' &&
        item.feedback === 'CONTROLLO SUPERATO' &&
        (isToday(item.bookingEndsAt) || isBefore(now, item.bookingEndsAt)),
    );

    // Skip book exam test because actual period is not valid\nList of exams empty
    if (examsData.length === 0) {
      this.skip();
    }

    const exam = examsData[0];

    const teaching = data.teachingScreen.title;
    const teachingTitle = await TeachingPage.findByUiSelectorText(teaching);
    const teachingText = await teachingTitle.getText();

    await TeachingPage.seeAllExamCall();

    const available = data.common.examStatus.available;

    // Skip book exam test because invalid exam date
    if (exam.examStartsAt === null || exam.examEndsAt === null) {
      this.skip();
    } else {
      const date = convertToDateString(exam.examStartsAt);
      const hour = convertDateToHourMinute(exam.examStartsAt);
      const examCallString = `${exam.courseName} ${date}. ora ${hour}. ${available}`;

      // SELECT EXAM
      const examCall = await TeachingPage.getExamCallByString(examCallString);
      await examCall.click();

      // CHECK EXAM CALL INFO
      const courseNameElement = await ExamPage.findByUiSelectorText(
        exam.courseName,
      );
      const courseNameText = await courseNameElement.getText();

      const startTime = convertDateToHourMinute(exam.examStartsAt);
      const endTime = convertDateToHourMinute(exam.examEndsAt);
      const timeString = `${startTime} - ${endTime}`;

      const timeElement = await ExamPage.findByUiSelectorText(timeString);
      const timeText = await timeElement.getText();

      const professor = await peopleApi.getPerson({ personId: exam.teacherId });
      const professorFullName =
        await `${professor.data.firstName} ${professor.data.lastName}`;
      const professorElement = await ExamPage.findByUiSelectorText(
        professorFullName,
      );
      const professorText = await professorElement.getText();

      const dateEndsAt = convertToDateString(exam.bookingEndsAt);
      const timeEndsAt = convertDateToHourMinute(exam.bookingEndsAt);
      const bookingEndsAt = `${dateEndsAt} ${timeEndsAt}`;
      const bookingEndsAtElement = await ExamPage.findByUiSelectorText(
        bookingEndsAt,
      );
      const bookingEndsAtText = await bookingEndsAtElement.getText();

      const bookedCountElement = await ExamPage.findByUiSelectorText(
        `${exam.bookedCount}`,
      );
      const bookingCountText = await bookedCountElement.getText();

      // BOOKING EXAM
      const booking = data.examScreen.ctaBook;
      const bookingBtn = await ExamPage.findByAccessibilityId(booking);
      await bookingBtn.click();

      // GET BOOKED EXAM
      const booked = data.common.examStatus.booked;
      const examCallBookedString = `${exam.courseName} ${date}. ora ${hour}. ${booked}`;
      const examCallBooked = await TeachingPage.getExamCallByString(
        examCallBookedString,
      );
      const desc = await examCallBooked.getAttribute('content-desc');

      expectChai(teachingText).to.be.equal(teaching);
      expectChai(courseNameText).to.be.equal(exam.courseName);
      expectChai(timeText).to.be.equal(timeString);
      expectChai(professorText).to.be.equal(professorFullName);
      expectChai(bookingEndsAtText).to.be.equal(bookingEndsAt);
      expectChai(bookingCountText).to.be.equal(`${exam.bookedCount}`);
      expectChai(desc).to.include(examCallBookedString);
    }
  });
});
