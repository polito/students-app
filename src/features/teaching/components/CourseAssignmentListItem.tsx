import { useTranslation } from 'react-i18next';
import {
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { FileListItem } from '@lib/ui/components/FileListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CourseAssignment } from '@polito/api-client';


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
      subtitle={''}
      containerStyle={styles.listItemContainer}
      trailingItem={
        <TouchableHighlight
          onPress={() => {}}
          style={styles.trailingHighlight}
          underlayColor={colors.touchableHighlight}
        >
          <Icon name="ellipsis-vertical" size={24} />
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
