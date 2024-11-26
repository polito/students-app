import data from '../../../strings/index';
import Driver from './driver';

class ServicesPage extends Driver {
  async navigateToOffering() {
    const title = data.offeringScreen.title;
    const offeringBtnElement = await this.findByUiSelectorText(title);
    await offeringBtnElement.click();
  }
  async navigateToTicket() {
    const ticket = data.ticketScreen.title;
    const ticketBtnElement = await this.findByUiSelectorText(ticket);
    await ticketBtnElement.click();
  }
  async navigateToBookings() {
    const booking_plural: string = data.common.booking_plural;

    const bookingBtnElement = await this.findByUiSelectorText(booking_plural);
    await bookingBtnElement.click();
  }
  async navigateToJobOffers() {
    const title: string = data.jobOfferScreen.title;

    const jobOfferBtnElement = await this.findByUiSelectorText(title);
    await jobOfferBtnElement.click();
  }
}

export default new ServicesPage();
