import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

import { faMapPin } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheetFlatListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { BottomSheet, BottomSheetProps } from '@lib/ui/components/BottomSheet';
import { BottomSheetTextField } from '@lib/ui/components/BottomSheetTextField';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { TranslucentTextFieldProps } from '@lib/ui/components/TranslucentTextField';
import { useTheme } from '@lib/ui/hooks/useTheme';

export interface PlacesBottomSheetProps
  extends Omit<BottomSheetProps, 'children'> {
  textFieldProps?: Partial<TranslucentTextFieldProps>;
  searchFieldLabel?: string;
  listProps?: Partial<BottomSheetFlatListProps<ListItemProps>>;
  isLoading?: boolean;
  search?: string;
  showSearchBar?: boolean;
  onSearchChange?: (newSearch: string) => void;
  onSearchClear?: () => void;
  onSearchTrigger?: () => void;
}

export const PlacesBottomSheet = forwardRef<
  BottomSheetMethods,
  PlacesBottomSheetProps
>(
  (
    {
      textFieldProps,
      listProps,
      searchFieldLabel,
      isLoading = false,
      search,
      onSearchChange,
      onSearchTrigger,
      onSearchClear,
      showSearchBar = true,
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const { fontSizes, spacing } = useTheme();
    const innerRef = useRef<BottomSheetMethods>(null);

    useImperativeHandle(ref, () => innerRef.current!);

    const listItems = useMemo(() => listProps?.data ?? [], [listProps?.data]);

    const isSearching = !!search?.trim();

    const snapPoints = useMemo(() => {
      if (isSearching) {
        return [
          Array.isArray(listItems) && listItems.length > 1 ? 120 : 160,
          Array.isArray(listItems) && listItems.length > 4 ? '75%' : '50%',
        ];
      }
      return [
        Array.isArray(listItems) && listItems.length > 1 ? 58 : 100,
        Array.isArray(listItems) && listItems.length > 4 ? '50%' : '30%',
      ];
    }, [isSearching, listItems]);

    return (
      <BottomSheet
        ref={innerRef}
        snapPoints={snapPoints}
        enableBlurKeyboardOnGesture={Platform.OS === 'ios'}
        enableAndroidKeyboardHandling={Platform.OS === 'android'}
        {...props}
      >
        {showSearchBar && (
          <BottomSheetTextField
            label={searchFieldLabel ?? t('common.search')}
            returnKeyType="search"
            onSubmitEditing={() => {
              onSearchTrigger?.();
            }}
            value={search}
            isClearable={!!search}
            onChangeText={onSearchChange}
            onClear={onSearchClear}
            {...textFieldProps}
          />
        )}
        <BottomSheetFlatList
          renderItem={({ item }) => (
            <ListItem
              leadingItem={<Icon icon={faMapPin} size={fontSizes['2xl']} />}
              {...item}
              title={item.title ?? t('common.untitled')}
            />
          )}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={IndentedDivider}
          {...listProps}
          data={listItems}
          ListEmptyComponent={
            isLoading ? (
              <ActivityIndicator style={{ marginVertical: spacing[8] }} />
            ) : (
              listProps?.ListEmptyComponent
            )
          }
        />
      </BottomSheet>
    );
  },
);
