import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Platform,
  StyleSheet,
  TouchableHighlight,
  TouchableHighlightProps,
} from 'react-native';
import { open } from 'react-native-file-viewer';
import { TemporaryDirectoryPath, downloadFile } from 'react-native-fs';

import { faEllipsisVertical } from '@fortawesome/pro-regular-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { Icon } from '@lib/ui/components/Icon';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { CourseAssignment } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import {
  formatFileDate,
  formatFileSize,
  getUrlExtension,
} from '../../../utils/files';

interface Props {
  item: CourseAssignment;
}

const Menu = ({
  shouldOpenOnLongPress = false,
  children,
}: PropsWithChildren<{ shouldOpenOnLongPress?: boolean }>) => {
  const { t } = useTranslation();

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={t('words.file')}
      actions={[
        {
          id: 'delete',
          title: t('words.delete'),
          image: 'trash',
          attributes: {
            destructive: true,
          },
        },
      ]}
      onPressAction={({ nativeEvent }) => {
        switch (nativeEvent.event) {
          case 'delete':
            // TODO delete assignment
            break;
          default:
        }
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseAssignmentListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const styles = useStylesheet(createItemStyles);
  const { colors } = useTheme();

  return (
    <Menu shouldOpenOnLongPress={true}>
      <FileListItem
        onPress={async () => {
          const tmpFile = [
            TemporaryDirectoryPath,
            `${item.id}.${getUrlExtension(item.url)}`,
          ].join('/');
          // TODO show loading
          try {
            await downloadFile({
              fromUrl: item.url,
              toFile: tmpFile,
            }).promise;
          } catch (e) {
            // TODO show error message
          }
          open(tmpFile);
        }}
        title={item.description}
        subtitle={`${formatFileSize(item.sizeInKiloBytes)} - ${formatFileDate(
          item.uploadedAt,
        )}`}
        trailingItem={Platform.select({
          android: (
            <Menu>
              <TouchableHighlight
                style={styles.trailingHighlight}
                underlayColor={colors.touchableHighlight}
              >
                <Icon icon={faEllipsisVertical} size={24} />
              </TouchableHighlight>
            </Menu>
          ),
        })}
        {...rest}
      />
    </Menu>
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
