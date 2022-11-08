import {
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';

import { faEllipsisVertical } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CourseAssignment } from '@polito/api-client';

import { formatFileDate } from '../../../utils/files';

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

  return (
    <FileListItem
      onPress={() => {}}
      title={item.description}
      subtitle={formatFileDate(item.uploadedAt)}
      sizeInKiloBytes={item.sizeInKiloBytes}
      containerStyle={styles.listItemContainer}
      trailingItem={
        <TouchableHighlight
          onPress={() => {}}
          style={styles.trailingHighlight}
          underlayColor={colors.touchableHighlight}
        >
          <FontAwesomeIcon icon={faEllipsisVertical} size={24} />
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
