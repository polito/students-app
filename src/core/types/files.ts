import type {
  CourseDirectory,
  CourseFileOverview,
} from '@polito/student-api-client';

export type CourseFileOverviewWithLocation = CourseFileOverview & {
  location: string;
};

export type CourseDirectoryContentWithLocations =
  | ({ type: 'directory' } & CourseDirectory & {
        location?: string;
        files: CourseDirectoryContentWithLocations[];
      })
  | ({ type: 'file' } & CourseFileOverviewWithLocation);
