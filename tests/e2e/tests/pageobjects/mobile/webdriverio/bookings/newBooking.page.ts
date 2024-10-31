import Driver from '../driver';

class NewBookingPage extends Driver {
  async navigateToStudyRoom(topicTitle: string, subTopicTitle: string) {
    const specialNeedsBtn = await this.findByUiSelectorText(topicTitle);
    await specialNeedsBtn.click();

    const studyRoomBtn = await this.findByUiSelectorText(subTopicTitle);
    await studyRoomBtn.click();
  }
}

export default new NewBookingPage();
