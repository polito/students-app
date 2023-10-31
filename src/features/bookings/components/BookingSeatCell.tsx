import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const { palettes, shapes } = useTheme();
  const seatStatus = t(`bookingSeatScreen.seatStatus.${seat.status}`);

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={[seat.label, seatStatus].join(', ')}
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
