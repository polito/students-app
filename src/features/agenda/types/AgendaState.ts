export interface AgendaState {
  contentHeight: number;
  currentOffset: number;
  isRefreshing: boolean;
  shouldLoadNext: boolean;
  shouldLoadPrevious: boolean;
  dayOffsetInWeek: number;
  dayOffsetOverall: number;
}
