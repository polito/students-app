import {
  AuthApi,
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

export const createApiConfiguration = (token?: string) => {
  const basePath = 'http://192.168.8.100:4010';
  console.log({ basePath });
  console.log(`Expecting a running API at ${basePath}`);

  const configurationParameters: ConfigurationParameters = {
    basePath,
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
