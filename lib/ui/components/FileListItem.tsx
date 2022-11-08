import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';

import { faCheck, faFile } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { ListItem } from '@lib/ui/components/ListItem';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { formatFileSize } from '../../../src/utils/files';

interface Props {
  title: string | JSX.Element;
  subtitle?: string;
  sizeInKiloBytes: number;
  trailingItem?: JSX.Element;
  isDownloaded: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FileListItem = ({
  isDownloaded,
  sizeInKiloBytes,
  subtitle,
  ...rest
}: TouchableHighlightProps & Props) => {
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <View>
          <FontAwesomeIcon icon={faFile} size={24} style={styles.fileIcon} />
          {isDownloaded && (
            <FontAwesomeIcon
              icon={faCheck}
              size={20}
              style={styles.downloadedIcon}
            />
          )}
        </View>
      }
      subtitle={
        <View style={styles.subtitleContainer}>
          <Text
            variant="secondaryText"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.subtitle}
          >
            {subtitle}
          </Text>
          <Text
            variant="secondaryText"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.fileSize}
          >
            {formatFileSize(sizeInKiloBytes)}
          </Text>
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
    fileSize: {
      paddingLeft: spacing[1],
    },
    downloadedIcon: {
      position: 'absolute',
      bottom: -10,
      right: 5,
      color: colors.secondary[600],
    },
    subtitle: {
      flexShrink: 1,
    },
    subtitleContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
  });
