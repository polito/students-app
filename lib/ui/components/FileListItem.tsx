import {
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  View,
  ViewStyle,
} from 'react-native';
import { Pie as ProgressIndicator } from 'react-native-progress';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faFile,
  faFileAudio,
  faFileCode,
  faFileCsv,
  faFileExcel,
  faFileImage,
  faFilePdf,
  faFilePowerpoint,
  faFileVideo,
  faFileWord,
  faFileZipper,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

type IconType = string;

const mimeTypeIcons: Record<IconType, IconDefinition> = {
  pdf: faFilePdf,
  image: faFileImage,
  word: faFileWord,
  excel: faFileExcel,
  zip: faFileZipper,
  tar: faFileZipper,
  gz: faFileZipper,
  rar: faFileZipper,
  video: faFileVideo,
  powerpoint: faFilePowerpoint,
  csv: faFileCsv,
  xml: faFileCode,
  audio: faFileAudio,
  html: faFileCode,
  javascript: faFileCode,
  json: faFileCode,
  iso: faFileZipper,
  '7z': faFileZipper,
};

const getIconFromMimeType = (mimeType?: string) => {
  if (!mimeType) return faFile;
  const keywords = new RegExp(Object.keys(mimeTypeIcons).join('|'), 'i');
  const match = mimeType.match(keywords);
  const type: IconType = match?.[0];
  if (type && type in mimeTypeIcons) {
    return mimeTypeIcons[type];
  }
  return faFile;
};

interface Props {
  title: string | JSX.Element;
  subtitle?: string;
  sizeInKiloBytes?: number;
  trailingItem?: JSX.Element;
  isDownloaded?: boolean;
  downloadProgress?: number;
  containerStyle?: StyleProp<ViewStyle>;
  mimeType?: string;
}

export const FileListItem = ({
  isDownloaded = false,
  downloadProgress,
  subtitle,
  mimeType,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createItemStyles);

  return (
    <ListItem
      leadingItem={
        <View>
          <Icon
            icon={getIconFromMimeType(mimeType)}
            size={fontSizes['2xl']}
            style={styles.fileIcon}
          />
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
