import data from '../../../../strings/index';
import Driver from '../driver';

class OfferingPage extends Driver {
  async selectMasterOption() {
    const master = data.offeringMasterScreen.title;
    const masterBtnElement = await this.findByUiSelectorText(master);
    await masterBtnElement.click();
  }

  async selectFirstBachelor(degreeName: string) {
    const firstOfferingElement = await this.findByAccessibilityId(degreeName);
    await firstOfferingElement.click();
  }
  async selectFirstMaster(degreeName: string) {
    const firstDegreeElement = await this.findByAccessibilityId(degreeName);
    await firstDegreeElement.click();
  }
}

export default new OfferingPage();
