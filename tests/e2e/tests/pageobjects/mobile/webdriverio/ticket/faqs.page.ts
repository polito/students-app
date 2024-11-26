import data from '../../../../strings/index';
import Driver from '../driver';

class FaqsPage extends Driver {
  async searchFaq(faq: string) {
    const placeholderFaq = data.ticketFaqsScreen.search;

    const searchElement = await this.findByUiSelector(
      `new UiSelector().text("${placeholderFaq}").className("android.widget.EditText")`,
    );
    await searchElement.click();

    await searchElement.setValue(faq);

    const KEYCODE_ENTER = 66;
    await driver.pressKeyCode(KEYCODE_ENTER);
  }
  async navigateToWriteTicket() {
    const writeTicket = data.ticketFaqsScreen.writeTicket;
    const writeTicketBtn = await this.findByAccessibilityId(writeTicket);
    await writeTicketBtn.click();
  }
}

export default new FaqsPage();
