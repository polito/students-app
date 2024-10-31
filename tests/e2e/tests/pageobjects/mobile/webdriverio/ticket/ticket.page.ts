import data from '../../../../strings/index';
import Driver from '../driver';

class TicketPage extends Driver {
  async navigateToFaqs() {
    const addTicket = data.ticketsScreen.addNew;
    const addTicketBtn = await this.findByAccessibilityId(addTicket);
    await addTicketBtn.click();
  }
}

export default new TicketPage();
