import { TouchableHighlightProps } from 'react-native';

import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito/api-client';

import { formatFileDate } from '../../../utils/files';

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
      subtitle={formatFileDate(item.createdAt)}
      sizeInKiloBytes={item.sizeInKiloBytes}
      {...rest}
    />
  );
};
