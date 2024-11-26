import { BookingsApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';
import { format } from 'date-fns';
import { isBefore } from 'date-fns';

import {
  convertDateToStringInItalyTZ,
  convertToDayMonth,
  getMondayCurrentWeek,
  getSaturdayCurrentWeek,
  timeoutTest,
} from '../../helpers/date';
import BookingsPage from '../../pageobjects/mobile/webdriverio/bookings/bookings.page';
import NewBookingPage from '../../pageobjects/mobile/webdriverio/bookings/newBooking.page';
import SeatSelectionPage from '../../pageobjects/mobile/webdriverio/bookings/seatSelection.page';
import StudyRoom from '../../pageobjects/mobile/webdriverio/bookings/studyRoom.page';
import BottomBar from '../../pageobjects/mobile/webdriverio/bottombar.page';
import ServicesPage from '../../pageobjects/mobile/webdriverio/services.page';
import data from '../../strings';

describe('Book study room use case', () => {
  let bookingTopicId: string;

  const bookingsApi = new BookingsApi();

  before(async () => {
    await BottomBar.navigateToServicesPage();

    await ServicesPage.navigateToBookings();

    await BookingsPage.navigateToNewBooking();

    const SPECIAL_NEEDS = 'Special Needs';
    const bookingTopics = await bookingsApi.getBookingTopics();
    const bookingTopic = await bookingTopics.data.filter(
      item => item.title === SPECIAL_NEEDS,
    )[0];
    bookingTopicId = await bookingTopic.subtopics[0].id;

    await NewBookingPage.navigateToStudyRoom(
      bookingTopic.title,
      bookingTopic.subtopics[0].title,
    );
    const reset = data.common.reset;
    const resetElement = await StudyRoom.findByAccessibilityId(reset);
    await resetElement.click();
    await driver.pause(timeoutTest);
  });

  it('successfully booking study room special needs', async function (this: Mocha.Context) {
    const fromDate = getMondayCurrentWeek();
    const toDate = getSaturdayCurrentWeek();

    const bookingSlot = await bookingsApi.getBookingSlots({
      bookingTopicId,
      fromDate,
      toDate,
    });

    bookingSlot.data = bookingSlot.data.sort((a, b) => {
      const dateA = new Date(a.startsAt).getTime();
      const dateB = new Date(b.startsAt).getTime();
      return dateA - dateB;
    });

    const now = new Date();

    // find first index of bookingSlot that can be booked
    const index = bookingSlot.data.findIndex(
      item =>
        item.feedback === '' &&
        item.canBeBooked &&
        item.hasSeats &&
        isBefore(now, item.startsAt) &&
        !item.startsAt.toString().includes('18:00'),
    );

    // No available booking slots in current week.
    if (index === -1) {
      this.skip();
    }
    // ROOM ARE AVAILABLE IN CURRENT WEEK
    else {
      await driver.pause(timeoutTest * 3);

      const availableBookingSlot = await bookingSlot.data[index];

      const availableRoom = await StudyRoom.findAvailableRoom(index);

      await availableRoom.click();

      const seats = await bookingsApi.getBookingSeats({
        bookingSlotId: availableBookingSlot.id.toString(),
        bookingTopicId,
      });

      // GET LABEL OF AVAILABLE SEAT (A1)
      let seatLabel = '';
      for (const row of seats.data.rows) {
        for (const seat of row.seats) {
          if (seat.status === 'available') {
            seatLabel = seat.label;
            break;
          }
        }
        if (seatLabel !== '') {
          break;
        }
      }
      await SeatSelectionPage.selectSeat(seatLabel);

      await SeatSelectionPage.bookStudyRoom();

      await driver.pause(timeoutTest);

      await BottomBar.navigateToServicesPage();
      await ServicesPage.navigateToBookings();

      // CHECK BOOKED ROOM
      const bookings = await bookingsApi.getBookings();

      const bookedRoom = await bookings.data.filter(item => {
        const a = convertDateToStringInItalyTZ(item.startsAt);
        const b = format(availableBookingSlot.startsAt, 'dd/MM/yyyy, HH:mm:ss');
        return a === b;
      })[0];

      const startTime = bookedRoom.startsAt.toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const endTime = bookedRoom.endsAt.toLocaleTimeString('it-IT', {
        timeZone: 'Europe/Rome',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const dayMonth = convertToDayMonth(bookedRoom.startsAt);
      const timeString = `${startTime} - ${endTime}`;

      const specialNeedsElement = await BookingsPage.findByUiSelectorText(
        bookedRoom.topic.title,
      );
      const specialNeedsText = await specialNeedsElement.getText();

      const dayMonthElement = await BookingsPage.findByUiSelectorText(dayMonth);
      const dayMonthText = await dayMonthElement.getText();

      const timeElement = await BookingsPage.findByUiSelectorText(timeString);
      const timeText = await timeElement.getText();

      // DELETE BOOKED ROOM AFTER TEST
      await bookingsApi.deleteBooking({ bookingId: bookedRoom.id });

      expectChai(specialNeedsText).to.be.equal(bookedRoom.topic.title);
      expectChai(dayMonthText).to.be.equal(dayMonth);
      expectChai(timeText).to.be.equal(timeString);
    }
  });
});
