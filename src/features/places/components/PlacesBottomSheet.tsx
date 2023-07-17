import { useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
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

import { PlacesContext } from '../contexts/PlacesContext';

export interface PlacesBottomSheetProps<T>
  extends Omit<BottomSheetProps, 'children'> {
  textFieldProps?: Partial<TranslucentTextFieldProps>;
  searchFieldLabel?: string;
  listProps?: Partial<BottomSheetFlatListProps<T>>;
  isLoading?: boolean;
}

export const PlacesBottomSheet = <
  T extends { title: string; subtitle?: string },
>({
  textFieldProps,
  listProps,
  searchFieldLabel,
  isLoading = false,
  ...props
}: PlacesBottomSheetProps<T>) => {
  const { t } = useTranslation();
  const { fontSizes, spacing } = useTheme();
  const bottomSheetRef = useRef<BottomSheetMethods>(null);
  const { search, setSearch } = useContext(PlacesContext);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={[64, '30%', '100%']}
      android_keyboardInputMode="adjustResize"
      {...props}
    >
      <BottomSheetTextField
        label={searchFieldLabel ?? t('common.search')}
        onFocus={() => bottomSheetRef.current?.expand()}
        onBlur={() => bottomSheetRef.current?.snapToIndex(1)}
        value={search}
        onChangeText={text => setSearch(text)}
        {...textFieldProps}
      />
      <BottomSheetFlatList
        data={[]}
        renderItem={({ item }: { item: Partial<ListItemProps> }) => (
          <ListItem
            title={item.title ?? t('common.untitled')}
            subtitle={item.subtitle}
            leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
            linkTo={item.linkTo}
          />
        )}
        ItemSeparatorComponent={IndentedDivider}
        {...listProps}
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
};
