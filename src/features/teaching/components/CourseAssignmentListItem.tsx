import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CourseAssignment } from '@polito-it/api-client';

import { formatFileDate, formatFileSize } from '../../../utils/files';

interface Props {
  item: CourseAssignment;
  isDownloaded: boolean;
}

export const CourseAssignmentListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const styles = useStylesheet(createItemStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <FileListItem
      onPress={() => {}}
      title={item.description}
      subtitle={t('CourseFileListItem.Subtitle', {
        date: formatFileDate(item.uploadedAt),
        size: formatFileSize(item.sizeInKiloBytes),
      })}
      containerStyle={styles.listItemContainer}
      trailingItem={
        <TouchableHighlight
          onPress={() => {}}
          style={styles.trailingHighlight}
          underlayColor={colors.touchableHighlight}
        >
          <Ionicons name="ellipsis-vertical" size={24} />
        </TouchableHighlight>
      }
      {...rest}
    />
  );
};

const createItemStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    listItemContainer: {
      paddingRight: 0,
    },
    trailingHighlight: {
      paddingHorizontal: spacing[5],
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
    },
  });
