import data from '../../../../strings/index';
import Driver from '../driver';

class CreateTicketPage extends Driver {
  async selectTopic(topicName: string) {
    const topic = data.createTicketScreen.topicDropdownLabel;
    const topicElement = await this.findByUiSelectorText(topic);
    await topicElement.click();

    const topicOptionElement = await this.findByUiSelectorText(topicName);
    await topicOptionElement.click();
  }
  async selectSubTopic(subTopicName: string) {
    const subTopic = data.createTicketScreen.subtopicDropdownLabel;
    const subTopicElement = await this.findByUiSelectorText(subTopic);
    await subTopicElement.click();

    const subTopicOptionElement = await this.findByUiSelectorText(subTopicName);
    await subTopicOptionElement.click();
  }
  async writeTicketSubject(subject: string) {
    const subjectTicket = data.createTicketScreen.subjectLabel;
    const subjectTicketElement = await this.findByUiSelectorText(subjectTicket);
    await subjectTicketElement.setValue(subject);
  }
  async writeTicket(text: string) {
    const reply = data.ticketScreen.reply;
    const replyTicket = await this.findByUiSelectorText(reply);
    await replyTicket.setValue(text);
  }
  async sendTicket() {
    const sendTicket = data.createTicketScreen.sendTicket;
    const sendTicketBtn = await this.findByAccessibilityId(sendTicket);
    await sendTicketBtn.click();
  }
}

export default new CreateTicketPage();
