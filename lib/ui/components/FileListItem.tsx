import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  title: string | JSX.Element;
  subtitle?: string | JSX.Element;
  trailingItem?: JSX.Element;
  isDownloaded: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FileListItem = ({
  isDownloaded,
  ...rest
}: TouchableHighlightProps & Props) => {
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <View>
          <Icon name="document-outline" size={24} style={styles.fileIcon} />
          {isDownloaded && (
            <Icon
              name="checkmark-circle"
              size={20}
              style={styles.downloadedIcon}
            />
          )}
        </View>
      }
      {...rest}
    />
  );
};

const createItemStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    fileIcon: {
      color: colors.heading,
      marginRight: spacing[3],
    },
    downloadedIcon: {
      position: 'absolute',
      bottom: -10,
      right: 5,
      color: colors.secondary[600],
    },
  });
