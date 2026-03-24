import { useState } from 'react';
import { View } from 'react-native';

import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { TextButton } from '@lib/ui/components/TextButton';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';

import { ToggleFilter } from './ToggleFilter';

interface FileScreenHeaderProps {
  activeSort: string;
  sortOptions: Array<{ id: string; title: string }>;
  onPressSortOption: (event: string) => void;
  isDirectoryView: boolean;
  onToggleView: () => void;
  isInsideFolder?: boolean;
  isSelectDisabled?: boolean;
}

export const FileScreenHeader = ({
  activeSort,
  sortOptions,
  onPressSortOption,
  isDirectoryView,
  onToggleView,
  isInsideFolder = false,
  isSelectDisabled = false,
}: FileScreenHeaderProps) => {
  const { palettes, fontSizes, spacing } = useTheme();
  const [isSortMenuOpen, setSortMenuOpen] = useState(false);

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
      {!isInsideFolder && (
        <View style={{ marginRight: spacing[3] }}>
          <ToggleFilter
            isDirectoryView={isDirectoryView}
            onToggle={onToggleView}
            disabled={isSelectDisabled}
          />
        </View>
      )}
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
