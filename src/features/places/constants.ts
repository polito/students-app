/* eslint-disable @typescript-eslint/naming-convention */
import { CategoryData } from './types';

export const INTERIORS_MIN_ZOOM = 18.6;
export const MAX_ZOOM = 24;
export const MARKERS_MIN_ZOOM = 15;
export const UPCOMING_COMMITMENT_HOURS_OFFSET = 24;
export const FREE_ROOMS_TIME_WINDOW_SIZE_HOURS = 3;
export const CATEGORIES_DATA: Record<string, CategoryData> = {
  default: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {},
  },
  VERT: {
    icon: 'stairs',
    color: 'gray',
    priority: 100,
    children: {
      SCALA: {
        showInitially: true,
      },
      ASCENSORE: {
        icon: 'elevator',
        color: 'gray',
        priority: 100,
        showInitially: true,
      },
    },
  },
  PARK: {
    icon: 'car',
    color: 'gray',
    priority: 100,
    children: {},
  },
  RESIDENCE: {
    icon: 'bed',
    color: 'orange',
    priority: 100,
    children: {},
  },
  SERV: {
    icon: 'pin',
    color: 'gray',
    priority: 90,
    children: {
      'PUNTO H2O': {
        icon: 'water',
        color: 'lightBlue',
        priority: 20,
        showInitially: true,
      },
      FONTANELLA: {
        icon: 'water',
        color: 'lightBlue',
        priority: 20,
        showInitially: true,
      },
      DIST_ACQUA: {
        icon: 'water',
        color: 'lightBlue',
        priority: 20,
        showInitially: true,
      },
      WC: { icon: 'restroom', color: 'green', shade: 600, showInitially: true },
      WC_F: {
        icon: 'restroom',
        color: 'green',
        shade: 600,
        showInitially: true,
      },
      WC_H: {
        icon: 'restroom',
        color: 'green',
        shade: 600,
        showInitially: true,
      },
      WC_M: {
        icon: 'restroom',
        color: 'green',
        shade: 600,
        showInitially: true,
      },
      INGRESSO: {
        icon: 'microscope',
        color: 'gray',
        priority: 60,
        children: {},
        showInitially: true,
      },
      AREA_BICI: { icon: 'bike' },
    },
  },
  SUPP: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {
      S_CONFEREN: { icon: 'conference', showInitially: true },
    },
  },
  UFF: {
    icon: 'office',
    color: 'red',
    priority: 60,
    children: {
      UFF_PUBB: {
        icon: 'office',
        color: 'red',
        priority: 60,
        children: {},
        showInitially: true,
      },
    },
  },
  AULA: {
    icon: 'classroom',
    color: 'navy',
    priority: 40,
    children: {
      AULA: {
        showInitially: true,
      },
      LAIB: {
        icon: 'lab',
        showInitially: true,
      },
    },
  },
  LAB: {
    icon: 'classroom',
    color: 'navy',
    priority: 60,
    children: {},
  },
  STUD: {
    icon: 'study',
    color: 'navy',
    priority: 40,
    children: {
      S_STUD: { showInitially: true },
      BIBLIO: { icon: 'library', showInitially: true },
      BIBLIO_DIP: { icon: 'library', showInitially: true },
    },
  },
  TECN: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {},
  },
  SPEC: {
    icon: 'service',
    color: 'orange',
    priority: 60,
    children: {
      BAR: { icon: 'bar', showInitially: true },
      SALA_BAR: { icon: 'bar', showInitially: true },
      MENSA: { icon: 'restaurant', showInitially: true },
      RISTORA: { icon: 'restaurant', showInitially: true },
      Z_RIST: { icon: 'restaurant', showInitially: true },
      INFERM: { icon: 'medical', color: 'red', showInitially: true },
      POSTA: { icon: 'post', showInitially: true },
    },
  },
  TBD: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {},
  },
  EST: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {
      PARK_BIKE: {
        icon: 'bike',
        showInitially: true,
      },
      SCALA_EST: {
        icon: 'stairs',
        color: 'gray',
        priority: 100,
        showInitially: true,
      },
      STUD_EST_A: {
        icon: 'study',
        color: 'navy',
        priority: 40,
        showInitially: true,
      },
      STUD_EST_P: {
        icon: 'study',
        color: 'navy',
        priority: 40,
        showInitially: true,
      },
      ISOLA_ECO: {
        icon: 'recycle',
        showInitially: true,
      },
    },
  },
};
export const SUBCATEGORIES_INITIALLY_SHOWN = Object.entries(
  CATEGORIES_DATA,
).flatMap(([, catData]) =>
  Object.entries(catData.children)
    .filter(([, v]) => v.showInitially)
    .map(([k]) => k),
);
