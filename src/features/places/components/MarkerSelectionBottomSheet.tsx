import { CtaButton } from "@lib/ui/components/CtaButton";
import { useStylesheet } from "@lib/ui/hooks/useStylesheet";
import { useCallback, useContext, useMemo } from "react";
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from "react-native";
import { PlacesContext } from "../contexts/PlacesContext";
import { useTheme } from "@lib/ui/hooks/useTheme";
import { Theme } from '@lib/ui/types/Theme';
import { Text } from '@lib/ui/components/Text';
import { useTranslation } from "react-i18next";
import { useGetCurrentCampus } from "../hooks/useGetCurrentCampus";
import Mapbox from '@rnmapbox/maps';
import { MapNavigatorContext } from "../contexts/MapNavigatorContext";
import Animated, { useAnimatedStyle, useSharedValue } from "react-native-reanimated";
import { Row } from "@lib/ui/components/Row";
import { faChevronDown, faCrosshairs, faElevator, faExpand } from "@fortawesome/free-solid-svg-icons";
import { IconButton } from "@lib/ui/components/IconButton";
import { Divider } from "@lib/ui/components/Divider";
import { StatefulMenuView } from "@lib/ui/components/StatefulMenuView";
import { TranslucentCard } from "@lib/ui/components/TranslucentCard";
import { Icon } from "@lib/ui/components/Icon";
import { usePreferencesContext } from "~/core/contexts/PreferencesContext";
import { TranslucentView } from "~/core/components/TranslucentView.ios";

type Props = {
    action: () => void;
    handleRoom: (roomId: string) => void;
    handleSearch: (query: string) => void;
    clickMode: number;
};

export const MarkerSelectionBottomSheet = ({ action, clickMode, handleRoom, handleSearch }: Props) => {
    const { t } = useTranslation();
    const styles = useStylesheet(createStyles);
    const { selectedPlace, setSelectedPlace } = useContext(PlacesContext);
    const { floorId: floorId, setFloorId: setFloorId } = useContext(PlacesContext);
    const { fontSizes, dark , palettes, spacing, colors } = useTheme();
    const campus = useGetCurrentCampus();
    const { cameraRef } = useContext(MapNavigatorContext);
    const bottomSheetPosition = useSharedValue(0);
    const screenHeight = Dimensions.get('window').height;
    const { accessibility } = usePreferencesContext();

    const floorActions = useMemo(() => {
        if (!campus?.floors) return [];
        return [...campus.floors] // copia per non mutare l’originale
            .sort((a, b) => a.level - b.level)
            .map(f => ({
            id: f.id,
            title: f.name,
            }));
    }, [campus?.floors]);

    const centerToUserLocation = useCallback(async () => {
          const location = await Mapbox.locationManager.getLastKnownLocation();
          if (location) {
            const { latitude, longitude } = location.coords;
            cameraRef.current?.flyTo([longitude, latitude]);
          }
        }, [cameraRef]);
    
    const centerToCurrentCampus = useCallback(async () => {
        if (!campus || !cameraRef.current) {
            return;
        }
        const { latitude, longitude, extent } = campus;
        cameraRef.current.fitBounds(
            [longitude - extent, latitude - extent],
            [longitude + extent, latitude + extent],
            undefined,
            2000,
        );
    }, [cameraRef, campus]);

    const floorSelectorButton = (
        <TranslucentCard
            {...(accessibility?.fontSize && Number(accessibility?.fontSize) >= 150
            ? { style: { height: 55 } }
            : {})}
        >
            <TouchableOpacity
                accessibilityLabel={t('placesScreen.changeFloor')}
                disabled={floorId != null}
            >
                <Row ph={3} pv={2.5} gap={1} align="center">
                    {accessibility?.fontSize && Number(accessibility?.fontSize) < 150 && (
                        <Icon icon={faElevator} />
                    )}
                    <Text
                        ellipsizeMode="tail"
                        numberOfLines={1}
                        {...(accessibility?.fontSize &&
                        Number(accessibility?.fontSize) >= 150
                            ? { style: { height: 75, marginVertical: -20, maxWidth: 250 } }
                            : {
                                flexShrink: 1,
                                flexGrow: 1,
                                marginRight: 20,
                        })}
                    >
                        {campus?.floors.find(f => f.id === floorId)?.name}
                    </Text>
                    <Icon
                        icon={faChevronDown}
                        size={fontSizes.xs}
                        style={{ position: 'absolute', right: 15 }}
                    />
                </Row>
            </TouchableOpacity>
        </TranslucentCard>
    );
    
    const controlsAnimatedStyle = useAnimatedStyle(() => {
        return {
        opacity: 1,
        transform: [
            {
            translateY: Math.max(0.53 * screenHeight, bottomSheetPosition.value),
            },
        ],
        };
    });

    return(
        <>
        <TranslucentView style={{ backgroundColor: Platform.select({ android: colors.background }), top: '75%'}} />
            <Animated.View style={[styles.controls, controlsAnimatedStyle]}>
                <Row style={styles.rowControls} align="stretch" justify="space-between">
                    <TranslucentCard>
                        <IconButton
                            icon={faCrosshairs}
                            size={spacing[6]}
                            style={styles.icon}
                            accessibilityLabel={t('placesScreen.goToMyPosition')}
                            onPress={centerToUserLocation}
                        />
                        <Divider style={styles.divider} size={1} />
                        <IconButton
                            icon={faExpand}
                            size={spacing[6]}
                            style={styles.icon}
                            accessibilityLabel={t('placesScreen.viewWholeCampus')}
                            onPress={centerToCurrentCampus}
                        />
                    </TranslucentCard>
                    <StatefulMenuView
                        style={{
                            maxWidth: '60%',
                        }}
                        onPressAction={({ nativeEvent: { event: selectedFloorId } }) => {
                            setFloorId(selectedFloorId);
                        }}
                        actions={floorActions}
                    >
                        {floorSelectorButton}
                    </StatefulMenuView>
                </Row>
            </Animated.View>
            <View style={styles.markerSelectorContainer}>
                <View style={styles.textContainer}>
                    <View style={styles.textGrid}>
                        {
                            selectedPlace ? (
                                <>
                                    <Text style={[styles.text, { fontSize: fontSizes.lg, color: palettes.gray[dark ? 300 : 600] }]} numberOfLines={1} ellipsizeMode='tail'>
                                        {
                                            clickMode === 1 ? t('Punto di partenza selezionato:') : (clickMode === 2 ? t('Punto di arrivo selezionato:') : t('Luogo selezionato:'))
                                        }
                                    </Text>
                                    <Text style={[styles.textSelected, { fontSize: fontSizes.md, color: palettes.gray[dark ? 300 : 600] }]} numberOfLines={1} ellipsizeMode='tail'>
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
                <View style={styles.ctaButtonContainer}>
                    <CtaButton
                        absolute={false}
                        title={t("Conferma selezione")}
                        disabled={selectedPlace ? false : true}
                        action={() => {
                            if(selectedPlace){
                                handleRoom(selectedPlace.room.name);
                                handleSearch(selectedPlace.room.name);
                            }
                            action();
                            setSelectedPlace(null);
                        }}
                    />
                </View>
            </View>
        </>
    );
};

const createStyles = ({ spacing }: Theme) => 
    StyleSheet.create({
    controls: {
      position: 'absolute',
      left: spacing[5],
      right: spacing[5],
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: 12,
      alignSelf: 'stretch',
    },
    divider: {
      alignSelf: 'stretch',
    },
    rowControls: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
    },
    markerSelectorContainer: {
        position: 'absolute',
        bottom: 0,
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
        fontFamily: 'Montserrat',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 400,
        lineHeight: 21,
    },
    textSelected: {
        overflow: 'hidden',
        fontFamily: 'Montserrat',
        fontSize: 16,
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 21,
    },
    icon: {
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
    },
    ctaButtonContainer: {
        display: 'flex',
        paddingHorizontal: 21,
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
    },
});
