import { memo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { useTranslation } from 'react-i18next';
interface PlacesListFooterProps {
    computeButtonState: number;
    startRoomLength: number;
    destinationRoomLength: number;
    handleComputeButtonState: (num: number) => void;
    showItinerary: () => void;
}

const PlacesListFooterComponent = ({
    computeButtonState,
    startRoomLength,
    destinationRoomLength,
    handleComputeButtonState,
    showItinerary,
}: PlacesListFooterProps) => {
    const styles = useStylesheet(createStyles);
    const { t } = useTranslation();
    const isDisabled = startRoomLength === 0 || destinationRoomLength === 0;
    
    return (
        <View style={styles.ctaButtonContainer}>
            <CtaButton
                title={
                    computeButtonState === 0 ? t('indicationsScreen.computePath') : t('indicationsScreen.showIndications')
                }
                action={() => {
                    if(computeButtonState > 0 && !isDisabled){
                        showItinerary();
                    }
                    else
                        handleComputeButtonState(1);
                }}
                disabled={isDisabled}
                style={{ width: '100%' }}
            />
        </View>
    );
};

export const PlacesListFooter = memo(PlacesListFooterComponent);

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
});