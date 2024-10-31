import data from '../../../strings/index';
import Driver from './driver';

class PlacesPage extends Driver {
  async selectSite(siteName: string) {
    const siteBtnElement = await this.findByUiSelectorText(siteName);
    await siteBtnElement.click();
    const optionSite = await this.findByUiSelector(
      `new UiSelector().textContains("${siteName}")`,
    );
    await optionSite.click();
  }
  async selectFloor(floorName: string) {
    const changeFloor = data.placesScreen.changeFloor;
    const floorBtnElement = await this.findByAccessibilityId(changeFloor);
    await floorBtnElement.click();

    const floorOption = await this.findByUiSelectorText(floorName);
    await floorOption.click();
  }
  async searchPlace(search: string, siteName: string) {
    const searchString = data.common.search;
    const searchElement = await this.findByUiSelectorText(
      `${searchString} in ${siteName}`,
    );
    await searchElement.click();
    await searchElement.setValue(search);
    const KEYCODE_ENTER = 66;
    await driver.pressKeyCode(KEYCODE_ENTER);
  }
  async selectFirstResult() {
    const index = 1;
    const firstResultElement = await this.findByXpath(
      `//android.widget.ScrollView/android.view.ViewGroup/android.view.ViewGroup[${index}]`,
    );

    await firstResultElement.click();
  }
}

export default new PlacesPage();
