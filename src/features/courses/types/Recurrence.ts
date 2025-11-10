export type HiddenRecurrence = {
  day: number;
  start: string;
  end: string;
  room: string;
};

export type CourseHiddenRecurrence = HiddenRecurrence & {
  restoreVisibility: boolean;
};

export type SingleEvent = {
  day: string;
  start: string;
  end: string;
  room: string;
};

export type CourseSingleEvent = SingleEvent & {
  restoreVisibility: boolean;
};

export type HiddenEvent =
  | ({ type: 'recurrence' } & HiddenRecurrence)
  | ({ type: 'single' } & SingleEvent);

export type CourseHiddenEvent =
  | ({ type: 'recurrence' } & CourseHiddenRecurrence)
  | ({ type: 'single' } & CourseSingleEvent);
