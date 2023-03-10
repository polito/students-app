export interface AgendaState {
  contentHeight: number;
  currentOffset: number;
  isRefreshing: boolean;
  shouldLoadNext: boolean;
  shouldLoadPrevious: boolean;
  todayOffsetInWeek: number;
  todayOffsetOverall: number;
}
