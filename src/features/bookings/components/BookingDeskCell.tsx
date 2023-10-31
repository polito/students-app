import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '@lib/ui/hooks/useTheme';

type BookingDeskCellProps = {
  seatSize: number;
};

export const BookingDeskCell = ({ seatSize }: BookingDeskCellProps) => {
  const { t } = useTranslation();
  const { shapes, spacing, palettes } = useTheme();
  return (
    <View
      accessible={true}
      accessibilityLabel={t('common.desk')}
      style={{
        width: seatSize * 2 + spacing[2],
        height: seatSize,
        backgroundColor: palettes.orange['800'],
        borderColor: palettes.orange['900'],
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: shapes.sm / 2,
      }}
    />
  );
};
