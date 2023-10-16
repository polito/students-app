import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
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

export interface PlacesBottomSheetProps
  extends Omit<BottomSheetProps, 'children'> {
  textFieldProps?: Partial<TranslucentTextFieldProps>;
  searchFieldLabel?: string;
  listProps?: Partial<BottomSheetFlatListProps<ListItemProps>>;
  isLoading?: boolean;
  search?: string;
  onSearchChange?: (newSearch: string) => void;
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
      ...props
    },
    ref,
  ) => {
    const { t } = useTranslation();
    const { fontSizes, spacing } = useTheme();
    const innerRef = useRef<BottomSheetMethods>(null);
    const [typing, setTyping] = useState(false);
    const [recentSearches, setRecentSearches] = useState([]);

    useImperativeHandle(ref, () => innerRef.current!);

    return (
      <BottomSheet
        ref={innerRef}
        snapPoints={[64, '30%', '100%']}
        android_keyboardInputMode="adjustResize"
        {...props}
      >
        <BottomSheetTextField
          label={searchFieldLabel ?? t('common.search')}
          onFocus={() => {
            setTyping(true);
            innerRef.current?.expand();
          }}
          onBlur={() => {
            setTyping(false);
            innerRef.current?.snapToIndex(1);
          }}
          value={search}
          onChangeText={onSearchChange}
          {...textFieldProps}
        />
        <BottomSheetFlatList
          renderItem={({ item }) => (
            <ListItem
              leadingItem={<Icon icon={faMapPin} size={fontSizes['2xl']} />}
              {...item}
              title={item.title ?? t('common.untitled')}
            />
          )}
          ItemSeparatorComponent={IndentedDivider}
          {...listProps}
          data={
            typing && !(listProps?.data as any[])?.length
              ? recentSearches
              : listProps?.data ?? []
          }
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
