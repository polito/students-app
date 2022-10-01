import * as Constants from 'expo-constants';

import {
  AuthApi,
  BASE_PATH,
  BookingsApi,
  Configuration,
  ConfigurationParameters,
  CoursesApi,
  ExamsApi,
  LecturesApi,
  PeopleApi,
  PlacesApi,
  StudentApi,
} from '@polito-it/api-client';

import { ApiContextClientsProps } from '../core/contexts/ApiContext';
import { language } from '../i18n';

export const apiBasePath = (() => {
  if (process.env.NODE_ENV === 'development') {
    const ipRegex = /exp:\/\/(.*):[0-9]*/g;
    const ipAddress = ipRegex.exec(Constants.default.linkingUri)[1];

    const apiHost = `http://${ipAddress}:4010`;
    console.log(
      `Expecting a running (fake) API on your computer at ${apiHost}`,
    );

    return apiHost;
  }
  return BASE_PATH;
})();

export const createApiConfiguration = (token?: string) => {
  const configurationParameters: ConfigurationParameters = {
    basePath: apiBasePath,
    headers: {
      'Accept-Language': language,
    },
  };

  if (token) {
    configurationParameters.accessToken = token;
  }

  return new Configuration(configurationParameters);
};

export const createApiClients = (token?: string) => {
  const configuration = createApiConfiguration(token);

  let clients: Partial<ApiContextClientsProps> = {
    auth: new AuthApi(configuration),
  };

  if (token) {
    clients = {
      ...clients,
      bookings: new BookingsApi(configuration),
      courses: new CoursesApi(configuration),
      exams: new ExamsApi(configuration),
      lectures: new LecturesApi(configuration),
      people: new PeopleApi(configuration),
      places: new PlacesApi(configuration),
      student: new StudentApi(configuration),
    };
  }

  return clients;
};
