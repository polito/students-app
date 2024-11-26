import data from '../../../../strings/index';
import Driver from '../driver';

class BookingsPage extends Driver {
  async navigateToNewBooking() {
    const newBooking = data.bookingsScreen.newBooking;
    const newBookingBtn = await this.findByAccessibilityId(newBooking);
    await newBookingBtn.click();
  }
}

export default new BookingsPage();
