import { createContext, useContext } from 'react';

import {
  AuthApi,
  BookingsApi,
  CoursesApi,
  ExamsApi,
  LecturesApi,
  PeopleApi,
  PlacesApi,
  StudentApi,
} from '@polito/api-client';

export interface ApiContextProps {
  isLogged: boolean;
  refreshContext: (token?: string) => void;
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
}

export const ApiContext = createContext<ApiContextProps | undefined>(undefined);

export const useApiContext = () => {
  const apiContext = useContext(ApiContext);
  if (!apiContext)
    throw new Error('No ApiContext.Provider found when calling useApiContext.');
  return apiContext;
};
