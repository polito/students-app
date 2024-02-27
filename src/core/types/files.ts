import { CourseFileOverview } from '@polito/api-client';
import type { CourseDirectory } from '@polito/api-client/models/CourseDirectory';

export type CourseFileOverviewWithLocation = CourseFileOverview & {
  location: string;
};

export type CourseDirectoryContentWithLocations =
  | ({ type: 'directory' } & CourseDirectory & {
        files: CourseDirectoryContentWithLocations[];
      })
  | ({ type: 'file' } & CourseFileOverviewWithLocation);
