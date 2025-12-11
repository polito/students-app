import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';

import { usePostHog } from 'posthog-react-native';

interface PlacesListFooterProps {
  computeButtonState: number;
  startRoomLength: number;
  destinationRoomLength: number;
  isLoading: boolean;
  handleComputeButtonState: (num: number) => void;
  showItinerary: () => void;
}

const PlacesListFooterComponent = ({
  computeButtonState,
  startRoomLength,
  destinationRoomLength,
  handleComputeButtonState,
  isLoading,
  showItinerary,
}: PlacesListFooterProps) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const isDisabled = startRoomLength === 0 || destinationRoomLength === 0;
  const posthog = usePostHog();

  return (
    <View style={styles.ctaButtonContainer}>
      <CtaButton
        title={
          computeButtonState === 0
            ? t('indicationsScreen.computePath')
            : isLoading
              ? t('')
              : t('indicationsScreen.showIndications')
        }
        action={() => {
          if (computeButtonState > 0 && !isDisabled) {
            showItinerary();
          } else if (computeButtonState === 0 && !isLoading) {
            posthog.capture('Compute Path Button Pressed');
            handleComputeButtonState(1);
          }
        }}
        disabled={isDisabled}
        loading={isLoading}
        style={styles.button}
      />
    </View>
  );
};

export const PlacesListFooter = PlacesListFooterComponent;

const createStyles = () =>
  StyleSheet.create({
    ctaButtonContainer: {
      display: 'flex',
      paddingHorizontal: 18,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 10,
      alignSelf: 'stretch',
      marginTop: '20%',
    },
    button: {
      width: '100%',
    },
  });
