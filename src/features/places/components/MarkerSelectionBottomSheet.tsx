import { CtaButton } from "@lib/ui/components/CtaButton";
import { useStylesheet } from "@lib/ui/hooks/useStylesheet";
import { useContext } from "react";
import { View, StyleSheet } from "react-native";
import { PlacesContext } from "../contexts/PlacesContext";
import { useTheme } from "@lib/ui/hooks/useTheme";
import { Text } from '@lib/ui/components/Text';
import { useTranslation } from "react-i18next";

type Props = {
    action: () => void;
    clickMode: number;
};

export const MarkerSelectionBottomSheet = ({ action, clickMode }: Props) => {
    const styles = useStylesheet(createStyles);
    const { selectedPlace } = useContext(PlacesContext);
    const { fontSizes, dark , palettes } = useTheme();

    const { t } = useTranslation();

    return(
        <View style={styles.markerSelectorContainer}>
            <View style={styles.textContainer}>
                <View style={styles.textGrid}>
                    {
                        selectedPlace ? (
                            <>
                                <Text style={[styles.text, { fontSize: fontSizes.lg, color: palettes.gray[dark ? 300 : 600] }]}>
                                    {
                                        clickMode == 1 ? t('Punto di partenza selezionato:') : (clickMode == 2 ? t('Punto di arrivo selezionato:') : t('Luogo selezionato:'))
                                    }
                                </Text>
                                <Text style={[styles.text, { fontSize: fontSizes.md, color: palettes.gray[dark ? 300 : 600] }]}>
                                    {`${selectedPlace?.room.name ? selectedPlace.room.name : selectedPlace?.category.name} - ${selectedPlace?.floor.name}`}
                                </Text>
                            </>
                        )
                        :
                        <Text style={[styles.text, { fontSize: fontSizes.md, color: palettes.gray[dark ? 300 : 600] }]}>
                            {t('Seleziona un punto di interesse dalla mappa')}
                        </Text>
                    }
                </View>
            </View>
            {selectedPlace && (
                <View style={styles.ctaButtonContainer}>
                    <CtaButton
                        absolute={false}
                        title={t("Conferma selezione")}
                        action={() => {
                            action();
                        }}
                    />
                </View>
            )}
        </View>
    );
};

const createStyles = () => 
    StyleSheet.create({
    markerSelectorContainer: {
        display: 'flex',
        width: '100%',
        paddingHorizontal: 18,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    textContainer: {
        display: 'flex',
        paddingVertical: 8,
        paddingHorizontal: 8,
        flexDirection: 'column',
        alignItems: 'flex-start',
        alignSelf: 'stretch',
    },
    textGrid: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        gap: 9,
        alignSelf: 'stretch',
    },
    text: {
        overflow: 'hidden',
        //text-overflow: ellipsis;
        fontFamily: 'Montserrat',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 21,
    },
    ctaButtonContainer: {
        display: 'flex',
        paddingHorizontal: 21,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
});
