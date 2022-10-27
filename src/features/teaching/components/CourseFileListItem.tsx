import { useTranslation } from 'react-i18next';
import { TouchableHighlightProps } from 'react-native';

import { FileListItem } from '@lib/ui/components/FileListItem';
import { CourseFileOverview } from '@polito/api-client';

interface Props {
  item: CourseFileOverview;
  isDownloaded: boolean;
}
export const CourseFileListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const { t } = useTranslation();
  return (
    <FileListItem onPress={() => {}} title={item.name} subtitle="" {...rest} />
  );
};
