import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, Platform, TouchableHighlightProps } from 'react-native';
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
  accessibilityListLabel?: string;
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
  accessibilityListLabel,
  ...rest
}: Omit<TouchableHighlightProps, 'onPress'> & Props) => {
  const { colors, spacing, fontSizes } = useTheme();
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
        accessibilityLabel={`${accessibilityListLabel}. ${item.description}, ${subTitle}`}
        mimeType={item.mimeType}
        trailingItem={
          item.deletedAt == null
            ? Platform.select({
                android: (
                  <Menu>
                    <IconButton
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
                ),
              })
            : undefined
        }
        {...rest}
      />
    ),
    [
      item,
      subTitle,
      accessibilityListLabel,
      spacing,
      colors.secondaryText,
      fontSizes.xl,
      rest,
    ],
  );

  if (Platform.OS === 'ios') {
    return <Menu>{listItem}</Menu>;
  }
  return listItem;
};
