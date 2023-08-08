import { createContext, useContext } from 'react';

import {
  AuthApi,
  BookingsApi,
  CoursesApi,
  ExamsApi,
  JobOffersApi,
  LecturesApi,
  NewsApi,
  OfferingApi,
  PeopleApi,
  PlacesApi,
  StudentApi,
  TicketsApi,
} from '@polito/api-client';

export interface Credentials {
  username: string;
  token: string;
}

export interface ApiContextProps extends Credentials {
  isLogged: boolean;
  refreshContext: (credentials?: Credentials) => void;
  clients: Partial<ApiContextClientsProps>;
}

export interface ApiContextClientsProps {
  auth: AuthApi;
  bookings: BookingsApi;
  courses: CoursesApi;
  exams: ExamsApi;
  lectures: LecturesApi;
  people: PeopleApi;
  places: PlacesApi;
  student: StudentApi;
  tickets: TicketsApi;
  news: NewsApi;
  jobOffers: JobOffersApi;
  offering: OfferingApi;
}

export const ApiContext = createContext<ApiContextProps | undefined>(undefined);

export const useApiContext = () => {
  const apiContext = useContext(ApiContext);
  if (!apiContext)
    throw new Error('No ApiContext.Provider found when calling useApiContext.');
  return apiContext;
};
