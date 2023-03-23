import { API_BASE_PATH } from '@env';
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
  TicketsApi,
} from '@polito/api-client';

import { ApiContextClientsProps } from '../core/contexts/ApiContext';
import { deviceLanguage } from '../utils/device';

export const createApiConfiguration = (token?: string) => {
  const basePath = API_BASE_PATH ?? BASE_PATH;
  console.debug(`Expecting a running API at ${basePath}`);

  const configurationParameters: ConfigurationParameters = {
    basePath,
    headers: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Accept-Language': deviceLanguage, // TODO refactor
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
      tickets: new TicketsApi(configuration),
    };
  }

  return clients;
};
