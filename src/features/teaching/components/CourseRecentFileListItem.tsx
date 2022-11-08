import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito-it/api-client';

export type CourseRecentFile = CourseFileOverview & {
  location: string;
};

interface Props {
  item: CourseRecentFile;
  isDownloaded: boolean;
}

export const CourseRecentFileListItem = ({ item, ...rest }: Props) => {
  return (
    <FileListItem
      onPress={() => {}}
      title={item.name}
      subtitle={item.location}
      sizeInKiloBytes={item.sizeInKiloBytes}
      {...rest}
    />
  );
};
