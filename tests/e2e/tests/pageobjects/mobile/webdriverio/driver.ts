export default class Driver {
  public async findByAccessibilityId(accessibilityId: string) {
    return await $(`~${accessibilityId}`);
  }

  public async findById(id: string) {
    return await $(`id:${id}`);
  }

  public async findByUiSelector(uiSelector: string) {
    return await $(`android=${uiSelector}`);
  }

  public async findByXpath(xpath: string) {
    return await $(`${xpath}`);
  }
  async findByUiSelectorText(text: string) {
    const selector = `new UiSelector().text("${text}")`;
    const element = await this.findByUiSelector(`${selector}`);
    return element;
  }
}
