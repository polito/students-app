import {
  CourseFileListItem,
  Props as CourseFileListItemProps,
} from './CourseFileListItem';

export const CourseRecentFileListItem = (props: CourseFileListItemProps) => {
  return (
    <CourseFileListItem showLocation={true} showCreatedDate={true} {...props} />
  );
};
