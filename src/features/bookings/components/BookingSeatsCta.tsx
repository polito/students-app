import { PropsWithChildren, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  StyleProp,
  StyleSheet,
  ViewStyle,
} from 'react-native';

import { faFilePdf } from '@fortawesome/free-regular-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { CtaButtonContainer } from '@lib/ui/components/CtaButtonContainer';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useCreateBooking } from '../../../core/queries/bookingHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type BookingSeatsCtaProps = PropsWithChildren<{
  seatId?: string;
  hasSeats?: boolean;
  slotId: string;
  absolute: boolean;
  modal: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export const BookingSeatsCta = ({
  absolute,
  seatId,
  slotId,
  modal,
  children,
  hasSeats,
  style,
}: BookingSeatsCtaProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const createBookingMutation = useCreateBooking();
  const [informationAcknowledgment, setInformationAcknowledgment] =
    useState(false);
  const navigation =
    useNavigation<NativeStackNavigationProp<ServiceStackParamList>>();
  const ctaEnabled = useMemo(() => {
    if (hasSeats) {
      return !!seatId && informationAcknowledgment;
    }
    return informationAcknowledgment;
  }, [hasSeats, informationAcknowledgment, seatId]);

  return (
    <CtaButtonContainer
      absolute={absolute}
      modal={modal}
      style={StyleSheet.compose(styles.ctaButtonContainer, style)}
    >
      {children}
      <Row style={styles.checkboxContainer} align="center">
        <Pressable
          accessible
          accessibilityRole="checkbox"
          accessibilityLabel={`${t(
            'bookingSeatScreen.informationAcknowledgment',
          )} ${t('bookingSeatScreen.informationAcknowledgmentLink')}`}
          style={styles.checkbox}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          onPress={() =>
            setInformationAcknowledgment(!informationAcknowledgment)
          }
        >
          {informationAcknowledgment && (
            <Icon icon={faCheck} size={14} color={palettes.primary['500']} />
          )}
        </Pressable>
        <Text style={styles.acknowledgmentTextContainer}>
          <Text style={styles.acknowledgmentText}>
            {t('bookingSeatScreen.informationAcknowledgment')}
          </Text>
          <Text
            onPress={async () => {
              await Linking.openURL(
                'https://didattica.polito.it/pdf/informativa_covid.pdf',
              );
            }}
            style={StyleSheet.compose(
              styles.acknowledgmentText,
              styles.underline,
            )}
            variant="link"
          >
            {t('bookingSeatScreen.informationAcknowledgmentLink')}
          </Text>
        </Text>
        <Row align="flex-end" style={{ height: '100%' }}>
          <Icon
            icon={faFilePdf}
            size={12}
            color={palettes.primary['500']}
            style={styles.icon}
          />
        </Row>
      </Row>
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
            .then(() => {
              navigation.navigate('Services');
              navigation.navigate('Bookings');
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
