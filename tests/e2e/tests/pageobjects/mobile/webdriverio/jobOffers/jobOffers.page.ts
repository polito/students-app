import Driver from '../driver';

class JobOffersPage extends Driver {
  async selectFirstJobOffer(titleJob: string) {
    const titleJobElement = await this.findByUiSelectorText(titleJob);
    await titleJobElement.click();
  }
}

export default new JobOffersPage();
