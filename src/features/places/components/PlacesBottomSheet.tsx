import {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

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

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useSearchPlaceToListItem } from '../hooks/useSearchPlaceToListItem';

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
    const [typing, setTyping] = useState(false);
    const { placesSearched } = usePreferencesContext();
    const searchPlaceToListItem = useSearchPlaceToListItem();

    useImperativeHandle(ref, () => innerRef.current!);

    const listItems = useMemo(
      () =>
        typing && !isLoading
          ? placesSearched.map(p => searchPlaceToListItem(p, true)) ?? []
          : listProps?.data ?? [],
      [
        isLoading,
        listProps?.data,
        placesSearched,
        searchPlaceToListItem,
        typing,
      ],
    );

    return (
      <BottomSheet
        ref={innerRef}
        snapPoints={[64, '30%', '100%']}
        android_keyboardInputMode="adjustResize"
        {...props}
      >
        {showSearchBar && (
          <BottomSheetTextField
            label={searchFieldLabel ?? t('common.search')}
            onFocus={() => {
              setTyping(true);
              innerRef.current?.expand();
            }}
            onBlur={() => {
              setTyping(false);
              onSearchTrigger?.();
              innerRef.current?.snapToIndex(1);
            }}
            returnKeyType="search"
            onSubmitEditing={onSearchTrigger}
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
