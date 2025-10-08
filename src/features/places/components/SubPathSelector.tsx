import { StyleSheet, View } from 'react-native';
import { IconButton } from '@lib/ui/components/IconButton';
import {
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Text } from '@lib/ui/components/Text';
import { useContext, useState } from 'react';
import { PlacesContext } from '~/features/places/contexts/PlacesContext';
import { useGetPath, useGetSite } from '~/core/queries/placesHooks';

type Props = {
  lineId?: number;
};

export const SubPathSelector = (props: Props) => {
    const styles = useStylesheet(createStyles);

    const { handleSelectSegment } = useContext(PlacesContext);
    const pathFeatureCollection = useGetPath().features;
    const numSegments = pathFeatureCollection ? pathFeatureCollection.length - 1 : 0;

    const floorMapNames = useGetSite('TO_CENCIT')?.floors;

    const [currentId, setCurrentId] = useState<number>(props.lineId || 0);
    const { colors, palettes, spacing } = useTheme();

    return (
        <View style={[styles.subPathSelector, {backgroundColor: colors.background, opacity: 0.9}]} >
                <IconButton
                  icon={faChevronLeft}
                  size={spacing[6]}
                  style={styles.icon}
                  disabled={currentId === 0}
                  onPress={() => {setCurrentId((prev) => prev - 1);
                    handleSelectSegment?.(`line-layer-${(currentId-1).toString()}`, pathFeatureCollection?.[currentId-1].features.properties.fn_fl_id);
                  }}
                />
                  <View style={styles.container}>
                    <Text style={[styles.floorIndicator, { color: palettes.text[900] }]} numberOfLines={2} ellipsizeMode='tail'>
                      {floorMapNames?.find((floor) => floor.id === pathFeatureCollection?.[currentId].features.properties.fn_fl_id)?.name}
                    </Text>
                    <Text style={[styles.instruction, { color: palettes.text[500] }]} numberOfLines={2} ellipsizeMode='tail'>
                      {currentId < numSegments ? `prosegui al ${floorMapNames?.find((floor) => floor.id === pathFeatureCollection?.[currentId + 1].features.properties.fn_fl_id)?.name}` : 'prosegui fino alla destinazione'}
                    </Text>
                  </View>
                <IconButton
                  icon={faChevronRight}
                  size={spacing[6]}
                  style={styles.icon}
                  disabled={currentId === numSegments} 
                  onPress={() => {setCurrentId((prev) => numSegments ? prev + 1 : prev);
                    handleSelectSegment?.(`line-layer-${(currentId+1).toString()}`, pathFeatureCollection?.[currentId+1].features.properties.fn_fl_id);
                  }}
                />
        </View>
      );
};

const createStyles = () =>
  StyleSheet.create({
    subPathSelector: {
      display: 'flex',
      flexDirection: 'row',
      paddingHorizontal: 18,
      paddingVertical: 12,
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: 12,
      height: 'auto',
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      maxWidth: '60%',
    },
    floorIndicator: {
      textAlign: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 600,
    },
    instruction: {
      alignSelf: 'stretch',
      textAlign: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 400,
    },
    icon: {
      display: 'flex',
      padding: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
      backgroundColor: '#ffffff',
    },
  });
