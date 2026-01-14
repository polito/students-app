import type { CourseDirectory, CourseFileOverview } from '@polito/api-client';

export type CourseFileOverviewWithLocation = CourseFileOverview & {
  location: string;
};

export type CourseDirectoryContentWithLocations =
  | ({ type: 'directory' } & CourseDirectory & {
        files: CourseDirectoryContentWithLocations[];
      })
  | ({ type: 'file' } & CourseFileOverviewWithLocation);
