import { Colors } from '@lib/ui/types/theme';
import { Lecture } from '@polito/api-client';

import _ from 'lodash';
import { DateTime } from 'luxon';

import { AgendaDayInterface, AgendaItemInterface } from '../../utils/types';
import { PreferencesContextProps } from '../contexts/PreferencesContext';

export const mapAgendaItem = (lectures?: Lecture[], colors?: Colors) => {
  const agendaDays: AgendaDayInterface[] = [];
  console.log({ colors });
  const pushItemToList = (item: AgendaItemInterface, ISODate: string) => {
    const currentAgendaDayIndex = agendaDays.findIndex(ad => ad.id === ISODate);
    if (currentAgendaDayIndex === -1) {
      agendaDays.push({
        id: ISODate,
        items: [item],
      });
    } else {
      agendaDays[currentAgendaDayIndex].items.push(item);
    }
  };

  lectures.forEach(lecture => {
    const fromDate = lecture.startsAt.toISOString();
    const toDate = lecture.endsAt.toISOString();
    const ISODate = DateTime.fromISO(fromDate).toISODate();
    const item: AgendaItemInterface = {
      fromDate: fromDate,
      toDate: toDate,
      title: lecture?.type,
      content: lecture,
      type: 'Lecture',
      classroom: lecture.roomName || ' - ',
    };
    pushItemToList(item, ISODate);
  });

  return agendaDays.sort(function (a, b) {
    return DateTime.fromISO(a.id) < DateTime.fromISO(b.id) ? -1 : 1;
  });
};

const agendaMonthPagination = 2;

export const getFromToDateFromPage = (page: number) => {
  // get two months at a "page", starting now - 1 month
  const fromDateIndex = -1 + agendaMonthPagination * page;
  const toDataIndex = 1 + agendaMonthPagination * page;
  const fromDate = DateTime.now().plus({ month: fromDateIndex }).toJSDate();
  const toDate = DateTime.now().plus({ month: toDataIndex }).toJSDate();
  return { fromDate, toDate };
};

export const getAgendaItemColorFromPreferences = (
  preferences: PreferencesContextProps,
  colors: Colors,
  item: AgendaItemInterface,
) => {
  if (item.type === 'Lecture') {
    const lecture = item.content as Lecture;
    return preferences.courses[lecture.courseId].color;
  }
  return preferences.types[item.type]?.color || colors.primary[500];
};

export const filterAgendaItem = (
  toFilterAgendaDays: AgendaDayInterface[],
  filters: string[],
) => {
  if (_.isEmpty(filters)) {
    return toFilterAgendaDays;
  }
  return _.chain(toFilterAgendaDays)
    .map(agendaDay => {
      const agendaDayItems = _.filter(agendaDay.items, item =>
        filters.includes(_.toLower(item.type)),
      );
      if (agendaDayItems.length) {
        return {
          ...agendaDay,
          items: agendaDayItems,
        };
      }
    })
    .compact()
    .value();
};
