import { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Pie as ProgressIndicator } from 'react-native-progress';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCheckCircle,
  faExclamationCircle,
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
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { useOfflineDisabled } from '../../../src/core/hooks/useOfflineDisabled';

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
  // eslint-disable-next-line @typescript-eslint/naming-convention
  '7z': faFileZipper,
};

const getIconFromMimeType = (mimeType?: string) => {
  if (!mimeType) return faFile;
  const keywords = new RegExp(Object.keys(mimeTypeIcons).join('|'), 'i');
  const match = mimeType.match(keywords);
  const type = match?.[0];
  if (type && type in mimeTypeIcons) {
    return mimeTypeIcons[type];
  }
  return faFile;
};

interface Props {
  title: string | ReactElement;
  subtitle?: string;
  sizeInKiloBytes?: number;
  trailingItem?: ReactElement;
  isDownloaded?: boolean;
  downloadProgress?: number;
  containerStyle?: StyleProp<ViewStyle>;
  mimeType?: string;
  isCorrupted?: boolean;
}

export const FileListItem = ({
  isDownloaded = false,
  downloadProgress,
  subtitle,
  mimeType,
  isCorrupted = false,
  ...rest
}: ListItemProps & Props) => {
  const { palettes, fontSizes } = useTheme();
  const styles = useStylesheet(createItemStyles);
  const { t } = useTranslation();

  const downloadLabel = t(`common.downloadStatus.${isDownloaded}`);

  const isDisabled = useOfflineDisabled(() => !isDownloaded);
  return (
    <ListItem
      accessible={true}
      accessibilityLabel={`${rest.title} ${subtitle}.${mimeType} ${downloadLabel}`}
      leadingItem={
        <View>
          <Icon icon={getIconFromMimeType(mimeType)} size={fontSizes['2xl']} />
          {downloadProgress != null ? (
            <View style={styles.downloadedIconContainer}>
              <ProgressIndicator
                progress={downloadProgress}
                size={12}
                color={palettes.secondary[600]}
              />
            </View>
          ) : (
            isDownloaded &&
            (!isCorrupted ? (
              <View style={styles.downloadedIconContainer}>
                <Icon
                  icon={faCheckCircle}
                  size={12}
                  color={palettes.secondary[600]}
                />
              </View>
            ) : (
              <View style={styles.downloadedIconContainer}>
                <Icon
                  icon={faExclamationCircle}
                  size={12}
                  color={palettes.danger[600]}
                />
              </View>
            ))
          )}
        </View>
      }
      subtitle={subtitle}
      disabled={isDisabled}
      {...rest}
    />
  );
};

const createItemStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    fileSize: {
      paddingLeft: spacing[1],
    },
    downloadedIconContainer: {
      padding: 2,
      borderRadius: 16,
      backgroundColor: colors.background,
      position: 'absolute',
      top: -5,
      left: -8,
    },
    subtitle: {
      flexShrink: 1,
    },
  });
