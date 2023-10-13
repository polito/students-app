/* eslint-disable @typescript-eslint/naming-convention */
import { CategoryData } from './types';

export const INTERIORS_MIN_ZOOM = 18.6;
export const MAX_ZOOM = 24;
export const MARKERS_MIN_ZOOM = 15;
export const UPCOMING_COMMITMENT_HOURS_OFFSET = 80;
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
      SCALA: {},
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
    color: 'red',
    priority: 100,
    children: {},
  },
  SERV: {
    icon: 'pin',
    color: 'gray',
    priority: 90,
    children: {
      'PUNTO H2O': { icon: 'water', color: 'lightBlue', priority: 20 },
      WC: { icon: 'restroom', color: 'green', shade: 600 },
      WC_F: { icon: 'restroom', color: 'green', shade: 600 },
      WC_H: { icon: 'restroom', color: 'green', shade: 600 },
      WC_M: { icon: 'restroom', color: 'green', shade: 600 },
    },
  },
  FONTANELLA: { icon: 'water', color: 'lightBlue', priority: 20, children: {} },
  SUPP: {
    icon: 'pin',
    color: 'gray',
    priority: 100,
    children: {
      S_CONFEREN: { icon: 'conference' },
    },
  },
  UFF: {
    icon: 'pin',
    color: 'gray',
    priority: 60,
    children: {},
  },
  AULA: {
    icon: 'classroom',
    color: 'navy',
    priority: 40,
    children: {
      AULA: {},
      AULA_DIS: {},
      AULA_INF: {},
      AULA_LAB: {},
    },
  },
  LAIB: {
    icon: 'lab',
    color: 'navy',
    priority: 60,
    children: {},
  },
  INGRESSO: {
    icon: 'door',
    color: 'gray',
    priority: 60,
    children: {},
  },
  UFF_PUBB: {
    icon: 'office',
    color: 'gray',
    priority: 60,
    children: {},
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
      BIBLIO: { icon: 'library' },
      STUD_EST_A: {},
      STUD_EST_P: {},
      S_STUD: {},
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
    color: 'red',
    priority: 60,
    children: {
      BAR: { icon: 'bar' },
      SALA_BAR: { icon: 'bar' },
      MENSA: { icon: 'restaurant' },
      RISTORA: { icon: 'restaurant' },
      Z_RIST: { icon: 'restaurant' },
      INFERM: { icon: 'medical' },
      POSTA: { icon: 'post' },
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
      PARK_BIKE: { icon: 'bike' },
    },
  },
};
