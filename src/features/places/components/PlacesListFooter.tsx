// PlacesListHeader.tsx
import React, { memo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { faLocationDot, faEllipsisV, faCircleDot, faSignsPost } from '@fortawesome/free-solid-svg-icons';
// Assumo che queste siano importazioni standard del tuo progetto
import { Icon } from '@lib/ui/components/Icon';
import { BottomSheetTextField } from '@lib/ui/components/BottomSheetTextField';
import { Checkbox } from '../../../core/components/Checkbox';
import { StatisticsContainer } from './StatisticsContainer';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { CtaButton } from '@lib/ui/components/CtaButton';

// Tipizzazione delle Props
interface PlacesListFooterProps {
    // STATI (VALORI DA LEGGERE - usiamo la lunghezza per stabilità)
    computeButtonState: number;
    startRoomLength: number;
    destinationRoomLength: number;

    // FUNZIONI (HANDLER STABILI TRAMITE useCallback)
    handleComputeButtonState: () => void;
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
    
    const isDisabled = startRoomLength === 0 || destinationRoomLength === 0;
    
    return (
        <View style={styles.ctaButtonContainer}>
            <CtaButton
                title={
                    computeButtonState === 0 ? "Calcola percorso" : "Mostra indicazioni"
                }
                action={() => {
                    handleComputeButtonState();
                    if(computeButtonState > 0 && !isDisabled){
                        showItinerary();
                    }
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