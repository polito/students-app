import { OfferingApi, OfferingClass } from '@polito/api-client';

import { expect as expectChai } from 'chai';
import { format } from 'date-fns';

import BottomBar from '../../pageobjects/mobile/webdriverio/bottombar.page';
import DegreePage from '../../pageobjects/mobile/webdriverio/offering/degree.page';
import OfferingPage from '../../pageobjects/mobile/webdriverio/offering/offering.page';
import ServicesPage from '../../pageobjects/mobile/webdriverio/services.page';
import data from '../../strings/index';

describe('Info degree use case', () => {
  const index = 0;
  let bachelor: OfferingClass;
  let master: OfferingClass;
  let location: string;
  let department: string;
  let faculty: string;
  let duration: string;
  let degreeClass: string;

  const offeringApi = new OfferingApi();
  const year = format(new Date(), 'yyyy');

  before(async () => {
    const offering = await offeringApi.getOffering();
    if (
      offering.data.bachelor !== undefined &&
      offering.data.master !== undefined
    ) {
      bachelor = offering.data.bachelor[index];
      master = offering.data.master[index];
    }

    ({ location, department, faculty, duration } = data.common);
    degreeClass = data.degreeScreen.degreeClass;
  });

  beforeEach(async () => {
    await BottomBar.navigateToServicesPage();
    await ServicesPage.navigateToOffering();
  });

  it('check first bachelor', async () => {
    const degreeName = bachelor.degrees[index].name;

    await OfferingPage.selectFirstBachelor(degreeName);

    const degreeNameElement = await DegreePage.findByUiSelectorText(degreeName);
    const degreeNameText = await degreeNameElement.getText();

    const info = data.degreeScreen.info;
    const infoElement = await DegreePage.findByUiSelectorText(info);
    const infoText = await infoElement.getText();

    const degreeId = await bachelor.degrees[index].id;
    const degree = await offeringApi.getOfferingDegree({
      degreeId,
      year,
    });
    const degreeData = await degree.data;

    const locationValue = await degreeData.location;
    const locationString = await `${location}: ${locationValue}`;
    const locationElement = await DegreePage.findByUiSelectorText(
      locationString,
    );
    const locationText = await locationElement.getText();

    const departmentValue = await degreeData.department.name;
    const departmentString = await `${department}: ${departmentValue}`;
    const deparmentElement = await DegreePage.findByUiSelectorText(
      departmentString,
    );
    const departmentText = await deparmentElement.getText();

    const facultyValue = await degreeData.faculty.name;
    const facultyString = await `${faculty}: ${facultyValue}`;
    const facultyElement = await DegreePage.findByUiSelectorText(facultyString);
    const facultyText = await facultyElement.getText();

    const durationValue = await degreeData.duration;
    const durationString = await `${duration}: ${durationValue}`;
    const durationElement = await DegreePage.findByUiSelectorText(
      durationString,
    );
    const durationText = await durationElement.getText();

    const className = await degreeData._class.name;
    const classCode = await degreeData._class.code;
    const codeString = await `${degreeClass}: ${className} (${classCode})`;
    const codeElement = await DegreePage.findByUiSelectorText(codeString);
    const codeText = await codeElement.getText();

    expectChai(degreeNameText).to.be.equal(degreeName);
    expectChai(infoText).to.be.equal(info);
    expectChai(locationText).to.be.equal(locationString);
    expectChai(departmentText).to.be.equal(departmentString);
    expectChai(facultyText).to.be.equal(facultyString);
    expectChai(durationText).to.be.equal(durationString);
    expectChai(codeText).to.be.equal(codeString);
  });

  it('check first master', async () => {
    const degreeName = master.degrees[index].name;

    await OfferingPage.selectMasterOption();
    await OfferingPage.selectFirstMaster(degreeName);

    const degreeNameElement = await DegreePage.findByUiSelectorText(degreeName);
    const degreeNameText = await degreeNameElement.getText();

    const info = data.degreeScreen.info;
    const infoElement = await DegreePage.findByUiSelectorText(info);
    const infoText = await infoElement.getText();

    const degreeId = await master.degrees[index].id;
    const degree = await offeringApi.getOfferingDegree({
      degreeId,
      year,
    });
    const degreeData = await degree.data;

    const locationValue = await degreeData.location;
    const locationString = await `${location}: ${locationValue}`;
    const locationElement = await DegreePage.findByUiSelectorText(
      locationString,
    );
    const locationText = await locationElement.getText();

    const departmentValue = await degreeData.department.name;
    const departmentString = await `${department}: ${departmentValue}`;
    const deparmentElement = await DegreePage.findByUiSelectorText(
      departmentString,
    );
    const departmentText = await deparmentElement.getText();

    const facultyValue = await degreeData.faculty.name;
    const facultyString = await `${faculty}: ${facultyValue}`;
    const facultyElement = await DegreePage.findByUiSelectorText(facultyString);
    const facultyText = await facultyElement.getText();

    const durationValue = await degreeData.duration;
    const durationString = await `${duration}: ${durationValue}`;
    const durationElement = await DegreePage.findByUiSelectorText(
      durationString,
    );
    const durationText = await durationElement.getText();

    const className = await degreeData._class.name;
    const classCode = await degreeData._class.code;
    const codeString = await `${degreeClass}: ${className} (${classCode})`;
    const codeElement = await DegreePage.findByUiSelectorText(codeString);
    const codeText = await codeElement.getText();

    expectChai(degreeNameText).to.be.equal(degreeName);
    expectChai(infoText).to.be.equal(info);
    expectChai(locationText).to.be.equal(locationString);
    expectChai(departmentText).to.be.equal(departmentString);
    expectChai(facultyText).to.be.equal(facultyString);
    expectChai(durationText).to.be.equal(durationString);
    expectChai(codeText).to.be.equal(codeString);
  });
});
