import { expect as expectChai } from 'chai';

import { timeoutTest } from '../helpers/date';
import LoginPage from '../pageobjects/mobile/webdriverio/login.page';
import ServicesPage from '../pageobjects/mobile/webdriverio/services.page';
import WhatsNewPage from '../pageobjects/mobile/webdriverio/whatsnew.page';
import data from '../strings/index';

describe('Login success use case', () => {
  it('successfully login', async () => {
    await driver.pause(timeoutTest * 4);

    const use_playstore = process.env.USE_PLAYSTORE!;
    await LoginPage.login(
      process.env.STUDENTID_TEST!,
      process.env.PASSWORD_TEST!,
    );

    // NO GOOGLE APIs => close popup
    if (use_playstore === 'false') {
      const okBtn = await $(
        `android=new UiSelector().className("android.widget.Button").text("OK")`,
      );
      await okBtn.click();
    }

    await WhatsNewPage.completeClose();

    const title = data.servicesScreen.title;
    const servicesElement = await ServicesPage.findByUiSelectorText(title);
    const servicesTitle = await servicesElement.getText();
    expectChai(servicesTitle).to.be.equal(title);
  });
});
