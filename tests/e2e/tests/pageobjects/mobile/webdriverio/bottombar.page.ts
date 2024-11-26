import data from '../../../strings/index';
import Driver from './driver';

class BottomBar extends Driver {
  async getTeachingBtn() {
    const selector = data.teachingScreen.title;
    return await this.findByUiSelector(
      `new UiSelector().descriptionContains("${selector}")`,
    );
  }

  async getAgendaBtn() {
    const selector = data.agendaScreen.title;
    return await this.findByUiSelector(
      `new UiSelector().descriptionContains("${selector}")`,
    );
  }

  async getPlacesBtn() {
    const selector = data.placesScreen.title;
    return await this.findByUiSelector(
      `new UiSelector().descriptionContains("${selector}")`,
    );
  }
  async getServicesBtn() {
    const selector = data.servicesScreen.title;
    return await this.findByUiSelector(
      `new UiSelector().descriptionContains("${selector}")`,
    );
  }
  async getProfileBtn() {
    const selector = data.profileScreen.title;
    return await this.findByUiSelector(
      `new UiSelector().descriptionContains("${selector}")`,
    );
  }

  async navigateToTeachingPage() {
    const btn = await this.getTeachingBtn();
    await btn.click();
  }
  async navigateToAgendaPage() {
    const btn = await this.getAgendaBtn();
    await btn.click();
  }
  async navigateToPlacesPage() {
    const btn = await this.getPlacesBtn();
    await btn.click();
  }
  async navigateToServicesPage() {
    const btn = await this.getServicesBtn();
    await btn.click();
  }
  async navigateToProfilePage() {
    const btn = await this.getProfileBtn();
    await btn.click();
  }
}

export default new BottomBar();
