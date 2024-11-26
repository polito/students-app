import { getDate, getYear, parse } from 'date-fns';

import { getFullMonthString } from '../../../helpers/date';
import data from '../../../strings/index';
import Driver from './driver';

class AgendaPage extends Driver {
  async openDatePicker() {
    const selectDate = data.agendaScreen.selectDate;
    const selectDateBtn = await this.findByAccessibilityId(selectDate);
    await selectDateBtn.click();
  }
  async showLectures() {
    const events = data.common.event_plural;
    const eventsBtn = await this.findByUiSelectorText(`${events}:`);
    await eventsBtn.click();
    const lectures = data.common.lecture_plural;
    const lecturesOption = await this.findByUiSelectorText(`${lectures}`);
    await lecturesOption.click();
  }

  async selectDayOrYear(start: number, end: number) {
    const diff = Math.abs(start - end);

    if (diff === 0) return;

    for (let i = 0; i < diff; i++) {
      const selector = end > start ? start + (i + 1) : start - (i + 1);
      const monthBtnElement = await this.findByUiSelectorText(`${selector}`);
      await monthBtnElement.click();
    }
  }
  async selectMonth(startMonth: number, endMonth: number) {
    const diffMonth = Math.abs(startMonth - endMonth);

    if (diffMonth === 0) return;

    for (let i = 0; i < diffMonth; i++) {
      // const monthNumber =
      //   endMonth > startMonth ? startMonth + (i + 1) : startMonth - (i + 1);

      const monthString = getFullMonthString();

      const monthBtnElement = await this.findByUiSelectorText(`${monthString}`);
      await monthBtnElement.click();
    }
  }

  async selectDate(endDate: string) {
    const now = new Date();
    const startDay = getDate(now);
    const startMonth = now.getMonth();
    const startYear = getYear(now);

    const parsedDate = parse(endDate, 'yyyy-MM-dd', new Date());

    const endDay = parsedDate.getDate();
    const endMonth = parsedDate.getMonth();
    const endYear = parsedDate.getFullYear();

    await this.selectDayOrYear(startDay, endDay);
    await this.selectMonth(startMonth, endMonth);
    await this.selectDayOrYear(startYear, endYear);

    const confirmBtn = await this.findById('android:id/button1');
    await confirmBtn.click();
  }
  async selectWeeklyLayout() {
    const weeklyLayout = data.agendaScreen.weeklyLayout;
    const options = data.common.options;

    const optionsBtn = await this.findByAccessibilityId(`${options}`);
    await optionsBtn.click();

    const weeklyLayoutElement = await this.findByUiSelectorText(
      `${weeklyLayout}`,
    );

    await weeklyLayoutElement.click();
  }
}
export default new AgendaPage();
