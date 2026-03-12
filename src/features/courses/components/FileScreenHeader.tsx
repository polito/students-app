import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  faChevronDown,
  faChevronUp,
  faEllipsisH,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
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
  isInsideFolder?: boolean;
  isSelectDisabled?: boolean;
}

export const FileScreenHeader = ({
  enableMultiSelect,
  allFilesSelected,
  activeSort,
  sortOptions,
  onPressSortOption,
  onPressOption,
  isDirectoryView = false,
  isInsideFolder = false,
  isSelectDisabled = false,
}: FileScreenHeaderProps) => {
  const { t } = useTranslation();
  const { palettes, fontSizes, spacing } = useTheme();
  const [isSortMenuOpen, setSortMenuOpen] = useState(false);
  const [isOptionsMenuPressed, setOptionsMenuPressed] = useState(false);
  const optionsPressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    if (!isOptionsMenuPressed) return;
    optionsPressTimeoutRef.current = setTimeout(() => {
      setOptionsMenuPressed(false);
      optionsPressTimeoutRef.current = null;
    }, 150);
    return () => {
      if (optionsPressTimeoutRef.current) {
        clearTimeout(optionsPressTimeoutRef.current);
        optionsPressTimeoutRef.current = null;
      }
    };
  }, [isOptionsMenuPressed]);

  const screenOptions = useMemo(
    () => [
      ...(!isSelectDisabled
        ? [
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
          ]
        : []),
      ...(!isSelectDisabled && !isInsideFolder
        ? [
            {
              id: MENU_ACTIONS.TOGGLE_FOLDERS,
              title: isDirectoryView
                ? t('common.hideFolders')
                : t('common.showFolders'),
            },
          ]
        : []),
    ],
    [
      t,
      enableMultiSelect,
      allFilesSelected,
      isDirectoryView,
      isInsideFolder,
      isSelectDisabled,
    ],
  );

  const headerContent = (
    <>
      <MenuView
        actions={isSelectDisabled ? [] : sortOptions}
        onPressAction={e => {
          onPressSortOption(e.nativeEvent.event);
        }}
        onCloseMenu={() => setSortMenuOpen(false)}
        onOpenMenu={() => setSortMenuOpen(true)}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextButton>{activeSort}</TextButton>
          <Icon
            icon={isSortMenuOpen ? faChevronUp : faChevronDown}
            size={fontSizes.md}
            color={palettes.primary[400]}
            style={{ marginLeft: 4 }}
          />
        </View>
      </MenuView>
      <MenuView
        actions={screenOptions}
        onPressAction={onPressOption}
        onOpenMenu={() => setOptionsMenuPressed(true)}
        onCloseMenu={() => {
          setOptionsMenuPressed(false);
          if (optionsPressTimeoutRef.current) {
            clearTimeout(optionsPressTimeoutRef.current);
            optionsPressTimeoutRef.current = null;
          }
        }}
      >
        <View
          style={{
            padding: spacing[3],
            marginLeft: -spacing[3],
            justifyContent: 'center',
            alignItems: 'center',
            opacity: isOptionsMenuPressed ? 0.6 : 1,
          }}
          hitSlop={{ left: spacing[3] }}
          accessibilityRole="button"
          accessibilityLabel={t('common.options')}
        >
          <Icon
            icon={faEllipsisH}
            color={palettes.primary[400]}
            size={fontSizes.lg}
          />
        </View>
      </MenuView>
    </>
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
      {isSelectDisabled ? (
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            alignSelf: 'stretch',
            opacity: 0.5,
          }}
          pointerEvents="none"
        >
          {headerContent}
        </View>
      ) : (
        headerContent
      )}
    </View>
  );
};
