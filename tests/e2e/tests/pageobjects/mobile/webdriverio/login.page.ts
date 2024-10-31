import data from '../../../strings/index';
import Driver from './driver';

class LoginPage extends Driver {
  async getUsername() {
    const usernameLabel = data.loginScreen.usernameLabel;
    return await this.findByUiSelectorText(`${usernameLabel}`);
  }
  async getUsernameByXpath() {
    const usernameLabelAccessibility =
      data.loginScreen.usernameLabelAccessibility;
    const xpathUsername = `//android.widget.EditText[@content-desc="${usernameLabelAccessibility}"]`;
    return await this.findByXpath(`${xpathUsername}`);
  }

  async getPassword() {
    const passwordLabel = data.loginScreen.passwordLabel;
    return await this.findByUiSelectorText(`${passwordLabel}`);
  }
  async getPasswordByXpath() {
    const passwordLabelAccessibility =
      data.loginScreen.passwordLabelAccessibility;
    const xpathPassword = `//android.widget.EditText[@content-desc="${passwordLabelAccessibility}"]`;
    return await this.findByXpath(`${xpathPassword}`);
  }
  async getLoginBtn() {
    const cta = data.loginScreen.cta;
    return await this.findByAccessibilityId(`${cta}`);
  }

  async login(user: string, pwd: string) {
    const loginBtn = await this.getLoginBtn();
    const username = await this.getUsername();
    const password = await this.getPassword();

    await username.setValue(user);
    await password.setValue(pwd);
    await loginBtn.click();
  }
  async clear() {
    const username = await this.getUsernameByXpath();
    const password = await this.getPasswordByXpath();

    await username.setValue('');
    await password.setValue('');
  }
}

export default new LoginPage();
