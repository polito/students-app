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
} from '@polito/api-client';

import { ApiContextClientsProps } from '../core/contexts/ApiContext';
import { language } from '../i18n';

export const createApiConfiguration = (token?: string) => {
  const basePath = BASE_PATH;
  // const basePath = 'http://192.168.178.36:4010';

  console.debug(`Expecting a running API at ${basePath}, token: ${token}`);

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
