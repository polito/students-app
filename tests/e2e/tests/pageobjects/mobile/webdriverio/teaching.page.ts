import { setup } from '../../../../config/setup';
import data from '../../../strings/index';
import Driver from './driver';

class TeachingPage extends Driver {
  async navigateToCourse(courseName: string, courseCfu: number) {
    const credits = setup.language === 'it' ? 'crediti' : 'Credits';
    const desc = await `${courseName}, ${courseCfu} ${credits}`;

    const courseElement = await this.findByUiSelector(
      `new UiSelector().descriptionContains("${desc}")`,
    );
    await courseElement.click();
  }

  async seeAllExamCall() {
    const seeAll = data.sectionHeader.cta;
    const seeAllElements = await $$(
      `android=new UiSelector().textContains("${seeAll}")`,
    );

    const seeAllExam = await seeAllElements[1];
    await seeAllExam.click();
  }

  async getExamCallByString(examCallString: string) {
    const examCall = await this.findByUiSelector(
      `new UiSelector().descriptionContains("${examCallString}")`,
    );
    return examCall;
  }
}

export default new TeachingPage();
