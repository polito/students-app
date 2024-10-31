import { PlacesApi, Site } from '@polito/api-client';

import { expect as expectChai } from 'chai';

import { setup } from '../../config/setup';
import { timeoutTest } from '../helpers/date';
import { Gestures } from '../helpers/gestures';
import BottomBar from '../pageobjects/mobile/webdriverio/bottombar.page';
import PlacesPage from '../pageobjects/mobile/webdriverio/places.page';
import data from '../strings/index';

describe('Search place use case', () => {
  let location: string;
  let campus: string;
  let building: string;
  let floor: string;
  let structure: string;
  let capacity: string;
  let centralSite: Site;

  const PACKAGE_NAME = process.env.PACKAGE_NAME!;
  const LANGUAGE = setup.language;

  const DEFAULT_SITE = LANGUAGE === 'en' ? 'Central Site' : 'Sede Centrale';
  const DEFAULT_FLOOR = LANGUAGE === 'en' ? 'Ground floor' : 'Piano Terra';

  const placesApi = new PlacesApi();

  before(async () => {
    ({ location, campus, building, floor, structure, capacity } = data.common);
    const sites = await placesApi.getSites(); // results in eng
    centralSite = sites.data.filter(site => site.name === DEFAULT_SITE)[0];
  });
  beforeEach(async () => {
    const statusApp = await driver.queryAppState(PACKAGE_NAME);

    if (statusApp === 1) {
      await driver.activateApp(PACKAGE_NAME);
    }
    await BottomBar.navigateToPlacesPage();
    await driver.pause(timeoutTest * 5);
  });
  afterEach(async () => {
    await driver.terminateApp(PACKAGE_NAME);
  });
  it('successfully search place', async function (this: Mocha.Context) {
    if (LANGUAGE === 'it') {
      // Test skipped because ENG API results and IT GUI text
      this.skip();
    }
    await PlacesPage.selectSite(DEFAULT_SITE);
    await PlacesPage.selectFloor(DEFAULT_FLOOR);

    const search: string = 'Lab';

    await PlacesPage.searchPlace(search, DEFAULT_SITE);
    await driver.pause(timeoutTest);

    await PlacesPage.selectFirstResult(); // CLICK FIRST SEARCH RESULT

    const siteId = await centralSite.id;
    const places = await placesApi.getPlaces({ search, siteId });
    const placeId: string = places.data
      .filter(item => item.room.name === roomName)
      .map(item => item.id.toString())[0];

    const place = await placesApi.getPlace({ placeId });

    await driver.pause(timeoutTest * 2);
    await Gestures.swipeUp();

    const roomName = await place.data.room.name;
    const placeNameElement = await PlacesPage.findByUiSelectorText(roomName);
    const placeNameText = await placeNameElement.getText();

    const locationElement = await PlacesPage.findByUiSelectorText(location);
    const locationText = await locationElement.getText();

    const campusLabelElement = await PlacesPage.findByUiSelectorText(campus);
    const campusLabelText = await campusLabelElement.getText();

    const buildingLabelElement = await PlacesPage.findByUiSelectorText(
      building,
    );
    const buildingLabelText = await buildingLabelElement.getText();

    const buildingName = place.data.building.name;
    const buildingElement = await PlacesPage.findByUiSelectorText(buildingName);
    const buildingText = await buildingElement.getText();

    const floorLabelElement = await PlacesPage.findByUiSelectorText(floor);
    const floorLabelText = await floorLabelElement.getText();

    const structureLabelElement = await PlacesPage.findByUiSelectorText(
      structure,
    );
    const structureLabelText = await structureLabelElement.getText();

    const capacityLabelElement = await PlacesPage.findByUiSelectorText(
      capacity,
    );
    const capacityLabelText = await capacityLabelElement.getText();

    const seats = data.placeScreen.capacity_plural.split(' ')[1];
    const capacityString = `${place.data.capacity} ${seats}`;
    const capacityElement = await PlacesPage.findByUiSelectorText(
      capacityString,
    );
    const capacityText = await capacityElement.getText();

    expectChai(placeNameText).to.be.equal(roomName);
    expectChai(locationText).to.be.equal(location);

    expectChai(campusLabelText).to.be.equal(campus);

    expectChai(buildingLabelText).to.be.equal(building);
    expectChai(buildingText).to.be.equal(buildingName);

    expectChai(floorLabelText).to.be.equal(floor);

    expectChai(structureLabelText).to.be.equal(structure);

    expectChai(capacityLabelText).to.be.equal(capacity);
    expectChai(capacityText).to.be.equal(capacityString);
  });

  it('no place found', async () => {
    const wrongSearch = 'abc';
    await PlacesPage.searchPlace(wrongSearch, DEFAULT_SITE);
    const wrongSiteId = 'wrongSiteId';
    const places = await placesApi.getPlaces({
      search: wrongSearch,
      siteId: wrongSiteId,
    });

    if (places.data.length === 0) {
      const noPlaceFound = data.placesScreen.noPlacesFound;
      const noPlaceFoundElement = await PlacesPage.findByUiSelectorText(
        noPlaceFound,
      );
      const noPlaceFoundText = await noPlaceFoundElement.getText();
      expectChai(noPlaceFoundText).to.be.equal(noPlaceFound);
    }
  });
});
