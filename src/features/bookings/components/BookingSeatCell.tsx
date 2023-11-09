import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, PressableProps, StyleSheet } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';
import { BookingSeatCell as BookingSeatCellType } from '@polito/api-client';

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

  const colors = useMemo(() => {
    if (isSelected) {
      return {
        backgroundColor: palettes.tertiary['100'],
        borderColor: palettes.tertiary['300'],
      };
    }
    if (seat.status === 'available') {
      return {
        backgroundColor: palettes.primary['50'],
        borderColor: palettes.primary['300'],
      };
    }
    if (seat.status === 'booked') {
      return {
        backgroundColor: palettes.danger['200'],
        borderColor: palettes.danger['400'],
      };
    }
    return {
      backgroundColor: palettes.danger['200'],
      borderColor: palettes.danger['400'],
    };
  }, [seat, palettes, isSelected]);

  return (
    <Pressable
      accessible
      accessibilityRole="button"
      accessibilityLabel={[seat.label, seatStatus].join(', ')}
      style={{
        height: size,
        width: size,
        backgroundColor: colors.backgroundColor,
        borderRadius: shapes.sm / 2,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: colors.borderColor,
      }}
      {...rest}
    />
  );
};
