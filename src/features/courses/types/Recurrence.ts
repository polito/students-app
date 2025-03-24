export type HiddenRecurrence = {
  day: number;
  start: string;
  end: string;
  room: string;
};

export type CourseHiddenRecurrence = HiddenRecurrence & {
  restoreVisibility: boolean;
};
