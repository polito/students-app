import { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCreateBooking } from '../../../core/queries/bookingHooks';
import { setTimeoutAccessibilityInfoHelper } from '../../../utils/setTimeoutAccessibilityInfo';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type BookingSeatsCtaProps = PropsWithChildren<{
  seatId?: string;
  hasSeatSelection?: boolean;
  slotId: string;
  absolute: boolean;
  modal: boolean;
  style?: StyleProp<ViewStyle>;
  onCloseModal?: () => void;
}>;

export const BookingSeatsCta = ({
  absolute,
  seatId,
  slotId,
  modal,
  children,
  hasSeatSelection,
  style,
  onCloseModal,
}: BookingSeatsCtaProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const createBookingMutation = useCreateBooking();
  const navigation =
    useNavigation<NativeStackNavigationProp<ServiceStackParamList>>();

  const ctaEnabled = useMemo(
    () => (hasSeatSelection ? !!seatId : true),
    [hasSeatSelection, seatId],
  );

  return (
    <CtaButtonContainer
      absolute={absolute}
      modal={modal}
      style={StyleSheet.compose(styles.ctaButtonContainer, style)}
    >
      {children}
      <CtaButton
        title={t('bookingSeatScreen.confirm')}
        variant="filled"
        absolute={false}
        action={() =>
          createBookingMutation
            .mutateAsync({
              seatId: seatId ? Number(seatId) : undefined,
              slotId: Number(slotId),
            })
            .then(async () => {
              onCloseModal?.();
              await navigation.pop(2);
              setTimeoutAccessibilityInfoHelper(
                t('bookingSeatScreen.confirmSuccess'),
                2000,
              );
            })
        }
        disabled={!ctaEnabled}
        loading={createBookingMutation.isLoading}
        containerStyle={{ paddingTop: 0 }}
      />
    </CtaButtonContainer>
  );
};

const createStyles = ({
  shapes,
  spacing,
  colors,
  palettes,
  fontSizes,
}: Theme) =>
  StyleSheet.create({
    checkboxContainer: {
      paddingHorizontal: spacing[4],
    },
    checkbox: {
      height: 20,
      width: 20,
      borderWidth: 2,
      borderColor: palettes.primary['500'],
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: shapes.sm / 2,
      backgroundColor: colors.background,
    },
    acknowledgmentTextContainer: {
      marginLeft: spacing[3],
      maxWidth: '80%',
    },
    acknowledgmentText: {
      fontSize: fontSizes.xs,
    },
    underline: {
      textDecorationLine: 'underline',
    },
    icon: {
      marginLeft: spacing[1.5],
    },
    ctaButtonContainer: {
      paddingTop: spacing[2],
      backgroundColor: colors.surface,
      paddingBottom: spacing[2],
    },
  });
