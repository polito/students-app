import { useRef } from 'react';
import { Keyboard } from 'react-native';

import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { BottomSheetFlatListProps } from '@gorhom/bottom-sheet/lib/typescript/components/bottomSheetScrollable/types';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { BottomSheet, BottomSheetProps } from '@lib/ui/components/BottomSheet';
import { Icon } from '@lib/ui/components/Icon';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { ListItem } from '@lib/ui/components/ListItem';
import {
  TranslucentTextField,
  TranslucentTextFieldProps,
} from '@lib/ui/components/TranslucentTextField';
import { useTheme } from '@lib/ui/hooks/useTheme';

export interface PlacesBottomSheetProps<T>
  extends Omit<BottomSheetProps, 'children'> {
  textFieldProps?: Partial<TranslucentTextFieldProps>;
  listProps?: Partial<BottomSheetFlatListProps<T>>;
}

export const PlacesBottomSheet = <
  T extends { title: string; subtitle?: string },
>({
  textFieldProps,
  listProps,
  ...props
}: PlacesBottomSheetProps<T>) => {
  const { fontSizes } = useTheme();
  const bottomSheetRef = useRef<BottomSheetMethods>(null);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      snapPoints={['10%', '30%', '100%']}
      onAnimate={(_, toIndex) => {
        if (toIndex !== 2) {
          Keyboard.dismiss();
        }
      }}
      {...props}
    >
      <TranslucentTextField
        label="Search"
        onFocus={() => bottomSheetRef.current?.expand()}
        onBlur={() => bottomSheetRef.current?.snapToIndex(1)}
        {...textFieldProps}
      />
      <BottomSheetFlatList
        data={[]}
        renderItem={({ item }) => (
          <ListItem
            title={item.title}
            subtitle={item.subtitle}
            leadingItem={<Icon icon={faLocationDot} size={fontSizes['2xl']} />}
            linkTo={{
              screen: 'Place',
              params: { placeId: 1 },
            }}
          />
        )}
        ItemSeparatorComponent={IndentedDivider}
        {...listProps}
      />
    </BottomSheet>
  );
};
