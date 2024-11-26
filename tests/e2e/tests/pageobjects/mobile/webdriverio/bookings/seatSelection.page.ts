import data from '../../../../strings/index';
import Driver from '../driver';

class SeatSelectionPage extends Driver {
  async selectSeat(seatLabel: string) {
    const seatStatus = data.bookingSeatScreen.seatStatus.available;
    const seatElement = await this.findByAccessibilityId(
      `${seatLabel}, ${seatStatus}`,
    );
    await seatElement.click();
  }
  async clickInformationAcknowledgment() {
    const informationAcknowledgment =
      data.bookingSeatScreen.informationAcknowledgment;
    const informationAcknowledgmentLink =
      data.bookingSeatScreen.informationAcknowledgmentLink;
    const informationAcknowledgmentElement = await this.findByAccessibilityId(
      `${informationAcknowledgment} ${informationAcknowledgmentLink}`,
    );
    await informationAcknowledgmentElement.click();
  }
  async bookStudyRoom() {
    const confirm = data.bookingSeatScreen.confirm;
    const confirmBtn = await this.findByAccessibilityId(confirm);
    await confirmBtn.click();
  }
}

export default new SeatSelectionPage();
