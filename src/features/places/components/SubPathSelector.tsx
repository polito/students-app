import { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, View } from 'react-native';

import {
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NavigationResponseFeature } from '@polito/api-client';

import { TranslucentView } from '~/core/components/TranslucentView';
import { useGetSite } from '~/core/queries/placesHooks';
import { PlacesContext } from '~/features/places/contexts/PlacesContext';

import { usePostHog } from 'posthog-react-native';

type Props = {
  lineId?: number;
  pathFeatureCollection: NavigationResponseFeature[];
};

export const SubPathSelector = (props: Props) => {
  const styles = useStylesheet(createStyles);

  const { handleSelectSegment } = useContext(PlacesContext);
  const numSegments = props.pathFeatureCollection
    ? props.pathFeatureCollection.length - 1
    : 0;

  const floorMapNames = useGetSite('TO_CENCIT')?.floors;

  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(
    props.lineId || 0,
  );
  const { colors, palettes, spacing, dark } = useTheme();
  const { t } = useTranslation();
  const posthog = usePostHog();

  return (
    <>
      <TranslucentView
        fallbackOpacity={1}
        style={[
          styles.subPathTransView,
          { backgroundColor: Platform.select({ android: colors.background }) },
        ]}
      />
      <View style={styles.subPathSelector}>
        <IconButton
          icon={faChevronLeft}
          size={spacing[6]}
          style={[styles.icon, { backgroundColor: colors.background }]}
          disabled={currentSegmentIndex === 0}
          onPress={() => {
            posthog.capture('Previous Segment Button Clicked');
            setCurrentSegmentIndex(prev => prev - 1);
            handleSelectSegment?.(
              currentSegmentIndex - 1,
              props.pathFeatureCollection[currentSegmentIndex - 1].features
                .properties.fnFlId || '',
            );
          }}
        />
        <View style={styles.container}>
          <Text
            style={[
              styles.floorIndicator,
              { color: dark ? palettes.text[200] : palettes.text[900] },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {
              floorMapNames?.find(
                floor =>
                  floor.id ===
                  props.pathFeatureCollection[currentSegmentIndex].features
                    .properties.fnFlId,
              )?.name
            }
          </Text>
          <Text
            style={[
              styles.instruction,
              { color: dark ? palettes.text[400] : palettes.text[700] },
            ]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {currentSegmentIndex < numSegments
              ? t('itineraryScreen.continueTo') +
                `${floorMapNames?.find(floor => floor.id === props.pathFeatureCollection[currentSegmentIndex + 1].features.properties.fnFlId)?.name}`
              : t('itineraryScreen.continuteToDestination')}
          </Text>
        </View>
        <IconButton
          icon={faChevronRight}
          size={spacing[6]}
          style={[styles.icon, { backgroundColor: colors.background }]}
          disabled={currentSegmentIndex === numSegments}
          onPress={() => {
            posthog.capture('Next Segment Button Clicked');
            setCurrentSegmentIndex(prev => prev + 1);
            handleSelectSegment?.(
              currentSegmentIndex + 1,
              props.pathFeatureCollection[currentSegmentIndex + 1].features
                .properties.fnFlId || '',
            );
          }}
        />
      </View>
    </>
  );
};

const createStyles = () =>
  StyleSheet.create({
    subPathTransView: {
      position: 'absolute',
      borderRadius: 12,
      top: '35%',
    },
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
    },
  });
