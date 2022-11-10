import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito/api-client';

import { formatFileSize } from '../../../utils/files';

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
      subtitle={`${formatFileSize(item.sizeInKiloBytes)} - ${item.location}`}
      {...rest}
    />
  );
};
