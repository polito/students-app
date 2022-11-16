import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import { Pie as ProgressIndicator } from 'react-native-progress';

import { faFile } from '@fortawesome/pro-regular-svg-icons';
import { faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

interface Props {
  title: string | JSX.Element;
  subtitle?: string;
  sizeInKiloBytes?: number;
  trailingItem?: JSX.Element;
  isDownloaded?: boolean;
  downloadProgress?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const FileListItem = ({
  isDownloaded = false,
  downloadProgress,
  subtitle,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <View>
          <Icon icon={faFile} size={fontSizes['2xl']} style={styles.fileIcon} />
          {downloadProgress != null ? (
            <View style={styles.downloadedIconContainer}>
              <ProgressIndicator
                progress={downloadProgress}
                size={12}
                color={colors.secondary[600]}
              />
            </View>
          ) : (
            isDownloaded && (
              <View style={styles.downloadedIconContainer}>
                <Icon
                  icon={faCheckCircle}
                  size={12}
                  color={colors.secondary[600]}
                />
              </View>
            )
          )}
        </View>
      }
      subtitle={subtitle}
      {...rest}
    />
  );
};

const createItemStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    fileIcon: {
      color: colors.heading,
    },
    fileSize: {
      paddingLeft: spacing[1],
    },
    downloadedIconContainer: {
      padding: 2,
      borderRadius: 16,
      backgroundColor: colors.background,
      position: 'absolute',
      bottom: -5,
      right: -2,
    },
    subtitle: {
      flexShrink: 1,
    },
  });
