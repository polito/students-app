import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, TouchableHighlightProps, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { FileListItem } from '@lib/ui/components/FileListItem';
import { IconButton } from '@lib/ui/components/IconButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseAssignment } from '@polito/api-client';

import { IS_ANDROID } from '~/core/constants';

import { formatDateTime } from '../../../utils/dates';
import { formatFileSize } from '../../../utils/files';

interface Props {
  item: CourseAssignment;
}

const Menu = ({ children }: PropsWithChildren) => {
  const { t } = useTranslation();
  const { dark, colors } = useTheme();

  return (
    <ContextMenu
      dropdownMenuMode={IS_ANDROID}
      actions={[
        {
          title: t('common.retract'),
          titleColor: dark ? colors.white : colors.black,
          destructive: true,
        },
      ]}
      onPress={({ nativeEvent: { index } }) => {
        switch (index) {
          case 0:
            // TODO retract assignment
            break;
          default:
        }
      }}
    >
      {children}
    </ContextMenu>
  );
};

export const CourseAssignmentListItem = ({
  item,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();
  const subTitle = `${formatFileSize(item.sizeInKiloBytes)} - ${formatDateTime(
    item.uploadedAt,
  )}`;
  const listItem = useMemo(
    () => (
      <FileListItem
        onPress={async () => {
          await Linking.openURL(item.url);
        }}
        title={item.description}
        titleStyle={{
          textDecorationLine:
            item.deletedAt != null ? 'line-through' : undefined,
        }}
        subtitle={subTitle}
        mimeType={item.mimeType}
        trailingItem={
          item.deletedAt == null
            ? Platform.select({
                android: (
                  <View
                    accessible
                    accessibilityRole="button"
                    accessibilityLabel={t('courseAssignmentsTab.menuInfo')}
                  >
                    <Menu>
                      <IconButton
                        accessible={false}
                        style={{
                          padding: spacing[3],
                        }}
                        icon={faEllipsisVertical}
                        color={colors.secondaryText}
                        size={fontSizes.xl}
                        hitSlop={{
                          right: +spacing[2],
                          left: +spacing[2],
                        }}
                      />
                    </Menu>
                  </View>
                ),
              })
            : undefined
        }
        {...rest}
      />
    ),
    [item, subTitle, spacing, colors.secondaryText, fontSizes.xl, rest, t],
  );

  if (Platform.OS === 'ios') {
    return <Menu>{listItem}</Menu>;
  }
  return listItem;
};
