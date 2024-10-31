import { JobOffersApi } from '@polito/api-client';

import { expect as expectChai } from 'chai';

import { convertToDateString } from '../../helpers/date';
import BottomBar from '../../pageobjects/mobile/webdriverio/bottombar.page';
import JobOfferPage from '../../pageobjects/mobile/webdriverio/jobOffers/jobOffer.page';
import JobOffersPage from '../../pageobjects/mobile/webdriverio/jobOffers/jobOffers.page';
import ServicesPage from '../../pageobjects/mobile/webdriverio/services.page';
import data from '../../strings/index';

describe('Info job offering use case', () => {
  let freePositions: string;
  let location: string;
  let contractType: string;
  let salary: string;

  const jobOffersApi = new JobOffersApi();

  beforeEach(async () => {
    await BottomBar.navigateToServicesPage();
    await ServicesPage.navigateToJobOffers();
  });

  it('check first job offer', async () => {
    const deadline: string = data.common.deadline;

    ({ freePositions, location, contractType, salary } = data.jobOfferScreen);

    const jobOffers = await jobOffersApi.getJobOffers();
    const jobOffersData = await jobOffers.data[0];
    const titleJob = jobOffersData.title;

    await JobOffersPage.selectFirstJobOffer(titleJob);

    const locationValue = jobOffersData.location;
    const companyName = jobOffersData.companyName;
    const expiration = convertToDateString(jobOffersData.endsAtDate);

    const jobOffer = await jobOffersApi.getJobOffer({
      jobOfferId: jobOffersData.id,
    });
    const contractTypeValue = await jobOffer.data.contractType;
    const salaryValue = await jobOffer.data.salary;
    const freePositionsValue = await jobOffer.data.freePositions;

    const titleJobOfferElement = await JobOfferPage.findByUiSelectorText(
      titleJob,
    );
    const titleJobOfferText = await titleJobOfferElement.getText();

    const companyNameElement = await JobOfferPage.findByUiSelectorText(
      companyName,
    );
    const companyNameText = await companyNameElement.getText();

    const contractTypeString = `${contractType}${contractTypeValue}`;
    const contractElement = await JobOfferPage.findByUiSelectorText(
      contractTypeString,
    );
    const contractText = await contractElement.getText();

    const salaryString = `${salary}${salaryValue}`;
    const salaryElement = await JobOfferPage.findByUiSelectorText(salaryString);
    const salaryText = await salaryElement.getText();

    const freePositionsString = `${freePositions}${freePositionsValue}`;
    const freePositionsElement = await JobOfferPage.findByUiSelectorText(
      freePositionsString,
    );
    const freePositionsText = await freePositionsElement.getText();

    const companyLocation = `${location}${locationValue}`;
    const locationJobOfferElement = await JobOfferPage.findByUiSelectorText(
      companyLocation,
    );
    const locationJobOfferText = await locationJobOfferElement.getText();

    const prefix = `${deadline.charAt(0).toUpperCase()}${deadline.slice(1)}`;
    const expirationString = `${prefix}: ${expiration}`;
    const expirationElement = await JobOfferPage.findByUiSelectorText(
      expirationString,
    );
    const expirationText = await expirationElement.getText();

    expectChai(titleJobOfferText).to.be.equal(titleJob);
    expectChai(companyNameText).to.be.equal(companyName);
    expectChai(contractText).to.be.equal(contractTypeString);
    expectChai(salaryText).to.be.equal(salaryString);
    expectChai(locationJobOfferText).to.be.equal(companyLocation);
    expectChai(expirationText).to.be.equal(expirationString);
    expectChai(freePositionsText).to.be.equal(freePositionsString);
  });
});
