import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { TextButton } from '@lib/ui/components/TextButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView, NativeActionEvent } from '@react-native-menu/menu';

import { MENU_ACTIONS } from '../constants';

interface FileScreenHeaderProps {
  enableMultiSelect: boolean;
  allFilesSelected: boolean;
  activeSort: string;
  sortOptions: Array<{ id: string; title: string }>;
  onPressSortOption: (event: string) => void;
  onPressOption: (event: NativeActionEvent) => void;
  isDirectoryView?: boolean;
}

export const FileScreenHeader = ({
  enableMultiSelect,
  allFilesSelected,
  activeSort,
  sortOptions,
  onPressSortOption,
  onPressOption,
  isDirectoryView = false,
}: FileScreenHeaderProps) => {
  const { t } = useTranslation();
  const { palettes, fontSizes } = useTheme();

  const screenOptions = useMemo(
    () => [
      {
        id: MENU_ACTIONS.SELECT,
        title: enableMultiSelect
          ? t('common.cancelSelection')
          : t('common.select'),
      },
      ...(enableMultiSelect
        ? [
            {
              id: MENU_ACTIONS.SELECT_ALL,
              title: allFilesSelected
                ? t('common.deselectAll')
                : t('common.selectAll'),
            },
          ]
        : []),
      {
        id: MENU_ACTIONS.TOGGLE_FOLDERS,
        title: isDirectoryView
          ? t('common.hideFolders')
          : t('common.showFolders'),
      },
    ],
    [t, enableMultiSelect, allFilesSelected, isDirectoryView],
  );

  return (
    <View
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        alignSelf: 'stretch',
        flexDirection: 'row',
      }}
    >
      <MenuView
        actions={sortOptions}
        onPressAction={e => {
          onPressSortOption(e.nativeEvent.event);
        }}
      >
        <TextButton>{activeSort}</TextButton>
      </MenuView>
      <MenuView actions={screenOptions} onPressAction={onPressOption}>
        <IconButton
          icon={faEllipsisH}
          color={palettes.primary[400]}
          size={fontSizes.lg}
          adjustSpacing="left"
          accessibilityLabel={t('common.options')}
        />
      </MenuView>
    </View>
  );
};
