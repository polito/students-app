import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';

//import * as Clarity from '@microsoft/react-native-clarity';

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

  return (
    <View style={styles.ctaButtonContainer}>
      <CtaButton
        absolute={!isLoading}
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
            //Clarity.sendCustomEvent('ComputePathButton Clicked');
            handleComputeButtonState(1);
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
      alignItems: 'stretch',
      gap: 10,
      alignSelf: 'stretch',
      marginTop: '20%',
      marginBottom: Platform.OS === 'android' ? '20%' : 0,
    },
    button: {
      width: '100%',
    },
  });
