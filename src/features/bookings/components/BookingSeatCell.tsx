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
  const { palettes, shapes, dark } = useTheme();
  const seatStatus = t(`bookingSeatScreen.seatStatus.${seat.status}`);

  const colors = useMemo(() => {
    if (isSelected) {
      return {
        backgroundColor: palettes.tertiary[dark ? 700 : 100],
        borderColor: palettes.tertiary[dark ? 500 : 300],
      };
    }
    if (seat.status === 'available') {
      return {
        backgroundColor: palettes.primary[dark ? 500 : 50],
        borderColor: palettes.primary[dark ? 400 : 300],
      };
    }
    return {
      backgroundColor: dark
        ? palettes.danger[800] + 'CC'
        : palettes.danger[200],
      borderColor: palettes.danger[dark ? 600 : 400],
    };
  }, [
    isSelected,
    seat.status,
    palettes.danger,
    palettes.tertiary,
    palettes.primary,
    dark,
  ]);

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
