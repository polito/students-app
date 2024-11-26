import { TicketsApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';

import { setup } from '../../../config/setup';
import { timeoutTest } from '../../helpers/date';
import BottomBar from '../../pageobjects/mobile/webdriverio/bottombar.page';
import ServicesPage from '../../pageobjects/mobile/webdriverio/services.page';
import CreateTicketPage from '../../pageobjects/mobile/webdriverio/ticket/createTicket.page';
import FaqsPage from '../../pageobjects/mobile/webdriverio/ticket/faqs.page';
import TicketPage from '../../pageobjects/mobile/webdriverio/ticket/ticket.page';

describe('Send ticket use case', () => {
  const ticketApi = new TicketsApi();

  beforeEach(async () => {
    await BottomBar.navigateToServicesPage();

    await ServicesPage.navigateToTicket();

    await TicketPage.navigateToFaqs();

    await FaqsPage.searchFaq('abc');

    await FaqsPage.navigateToWriteTicket();
  });
  it('successfully send ticket use case', async function (this: Mocha.Context) {
    const topics = await ticketApi.getTicketTopics();
    const topicData = await topics.data[0];

    // try to open second ticket with same topic and subtopic => skip test, because no subtopics
    if (topicData.subtopics.length === 0) {
      this.skip();
    }

    await driver.pause(timeoutTest);

    await CreateTicketPage.selectTopic(topicData.name);

    await CreateTicketPage.selectSubTopic(topicData.subtopics[0].name);

    const subject = `Test Ticket ${setup.timestamp}`;
    await CreateTicketPage.writeTicketSubject(subject);

    const text = `test write ticket ${setup.timestamp}`;
    await CreateTicketPage.writeTicket(text);

    await CreateTicketPage.sendTicket();

    const subjectTextElement = await TicketPage.findByUiSelectorText(subject);
    const subjectText = await subjectTextElement.getText();

    const textTicketElement = await TicketPage.findByUiSelectorText(text);
    const textTicket = await textTicketElement.getText();

    await driver.pause(timeoutTest);

    // CLOSE TICKET CREATED
    const tickets = await ticketApi.getTickets();
    const ticketId = tickets.data.filter(item => item.subject === subject)[0]
      .id;
    await ticketApi.markTicketAsClosed({ ticketId });

    expectChai(subjectText).to.be.equal(subject);
    expectChai(textTicket).to.be.equal(text);
  });
});
