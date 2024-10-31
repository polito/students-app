import { timeoutTest } from '../../../helpers/date';
import data from '../../../strings/index';
import Driver from './driver';

class WhatsNewPage extends Driver {
  async close() {
    await driver.pause(timeoutTest);

    const close: string = data.common.close;
    const closeBtn = await this.findByAccessibilityId(close);
    await closeBtn.click();
  }
  async completeClose() {
    const next: string = data.common.next;
    const guide: string = data.guideScreen.title;
    const back: string = `Torna ${data.common.back.toLowerCase()}`;
    const steps: number = 3;

    const nextBtn = await this.findByAccessibilityId(next);

    for (let i = 0; i < steps; i++) {
      await nextBtn.click();
      await driver.pause(timeoutTest);
    }
    const guideBtn = await this.findByAccessibilityId(guide);
    await guideBtn.click();

    const backBtn = await this.findByAccessibilityId(back);
    await backBtn.click();
  }
}

export default new WhatsNewPage();
