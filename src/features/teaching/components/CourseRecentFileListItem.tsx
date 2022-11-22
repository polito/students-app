import { CourseFileOverview } from '@polito/api-client';

import {
  CourseFileListItem,
  Props as CourseFileListItemProps,
} from './CourseFileListItem';

export type CourseRecentFile = CourseFileOverview & {
  location: string;
};

export const CourseRecentFileListItem = (props: CourseFileListItemProps) => {
  return (
    <CourseFileListItem
      showLocation={true}
      showCreatedDate={false}
      {...props}
    />
  );
};
