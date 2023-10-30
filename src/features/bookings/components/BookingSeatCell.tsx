import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BookingSeatCell as BookingSeatCellType } from '@polito/api-client';

import { getSeatColorPaletteKey } from '../../../utils/bookings';

export type BookingSeatProps = PressableProps & {
  seat: BookingSeatCellType;
  size: number;
  isSelected: boolean;
};

export const BookingSeatCell = ({
  seat,
  size,
  isSelected,
  ...rest
}: BookingSeatProps) => {
  const { palettes, shapes } = useTheme();
  return (
    <Pressable
      style={{
        height: size,
        width: size,
        backgroundColor: isSelected
          ? palettes.green['100']
          : palettes[getSeatColorPaletteKey(seat)]['100'],
        borderRadius: shapes.sm / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: isSelected
          ? palettes.green['300']
          : palettes[getSeatColorPaletteKey(seat)]['300'],
      }}
      {...rest}
    />
  );
};
