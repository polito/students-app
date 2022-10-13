import { TouchableHighlightProps } from 'react-native';

import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito-it/api-client';

import { formatFileDate, formatFileSize } from '../../../utils/files';

interface Props {
  item: CourseFileOverview;
  isDownloaded: boolean;
}

export const CourseFileListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  return (
    <FileListItem
      onPress={() => {}}
      title={item.name}
      subtitle={`Uploaded on ${formatFileDate(
        item.createdAt,
      )} - ${formatFileSize(item.sizeInKiloBytes)}`}
      {...rest}
    />
  );
};
