import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';

import { faEllipsisVertical } from '@fortawesome/pro-regular-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CourseAssignment } from '@polito/api-client';

import { formatFileDate, formatFileSize } from '../../../utils/files';

interface Props {
  item: CourseAssignment;
}

export const CourseAssignmentListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const styles = useStylesheet(createItemStyles);
  const { colors } = useTheme();

  return (
    <FileListItem
      onPress={() => {}}
      title={item.description}
      subtitle={`${formatFileSize(item.sizeInKiloBytes)} - ${formatFileDate(
        item.uploadedAt,
      )}`}
      trailingItem={Platform.select({
        android: (
          <TouchableHighlight
            onPress={() => {}}
            style={styles.trailingHighlight}
            underlayColor={colors.touchableHighlight}
          >
            <Icon icon={faEllipsisVertical} size={24} />
          </TouchableHighlight>
        ),
      })}
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
      marginRight: -spacing[5],
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
    },
  });
