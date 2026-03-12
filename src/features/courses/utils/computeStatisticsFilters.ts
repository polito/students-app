import { CourseStatistics, Teacher } from '@polito/api-client';
import { MenuAction } from '@react-native-menu/menu';

const teachersToMenuAction = (
  teachers: Teacher[],
  currentTeacherId?: string,
): MenuAction[] =>
  teachers.map(t => {
    return {
      id: String(t.id),
      title: `${t.lastName || ''} ${t.firstName || ''}`.trim(),
      state: currentTeacherId === t.id.toString() ? 'on' : 'off',
    };
  });

export const formatYearPeriod = (year: number) => {
  const formattedYear = String(year).slice(-2);
  return `${year - 1}/${formattedYear}`;
};

const yearsToMenuAction = (
  years: number[],
  selectedYear?: string,
): MenuAction[] => {
  if (selectedYear && years.indexOf(parseInt(selectedYear, 10)) !== -1) {
    return years.map(y => {
      return {
        id: String(y),
        title: formatYearPeriod(y),
        state: selectedYear && parseInt(selectedYear, 10) === y ? 'on' : 'off',
      };
    });
  }
  return [
    {
      id: selectedYear ?? '',
      title: selectedYear ? formatYearPeriod(parseInt(selectedYear, 10)) : '',
      state: selectedYear === undefined ? 'off' : 'on',
    },
  ];
};

export type StatisticsFilters = {
  currentTeacher?: MenuAction;
  teachers: MenuAction[];
  currentYear?: MenuAction;
  years: MenuAction[];
};

export const computeStatisticsFilters = (
  statistics: undefined | CourseStatistics,
  year: undefined | string,
  teacherId: undefined | string,
): StatisticsFilters => {
  const teachers = teachersToMenuAction(statistics?.teachers ?? [], teacherId);
  const years = yearsToMenuAction(statistics?.years ?? [], year);
  const currentTeacher = teachers.find(it => it.state === 'on');
  const currentYear = years.find(it => it.state === 'on');

  return {
    currentTeacher,
    teachers,
    currentYear,
    years,
  };
};
