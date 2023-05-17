import { useLayoutEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { Geojson, Marker } from 'react-native-maps';

import { faDiamondTurnRight } from '@fortawesome/free-solid-svg-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { BottomSheet } from '@lib/ui/components/BottomSheet';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapScreenProps } from '../components/MapNavigator';
import { PlacesStackParamList } from '../components/PlacesNavigator';

type Props = MapScreenProps<PlacesStackParamList, 'Place'>;

export const PlaceScreen = ({ navigation }: Props) => {
  const styles = useStylesheet(createStyles);
  const { palettes, fontSizes } = useTheme();
  const coordinates = {
    latitude: 45.06238763859395,
    longitude: 7.661483461842376,
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      mapOptions: {
        region: {
          latitude: coordinates.latitude - 0.0002,
          longitude: coordinates.longitude,
          latitudeDelta: 0.0007,
          longitudeDelta: 0.0007,
        },
      },
      mapContent: (
        <>
          <Marker coordinate={coordinates} />
          <Geojson
            strokeColor={palettes.secondary[600]}
            fillColor={`${palettes.secondary[600]}33`}
            geojson={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {
                    SubClasses: 'AcDbEntity:AcDbPolyline',
                    ExtendedEn:
                      '1         1 LOC 0753334441303100      3 rm { TO_CEN03 XPTE D001 } TO_CEN03_XPTE 694F2 L200_PLUS 15.24 0.0      1 { 0 }',
                    EntityHand: '2C2',
                  },
                  geometry: {
                    type: 'Polygon',
                    coordinates: [
                      [
                        [7.6615471, 45.0624532],
                        [7.6615436, 45.0624734],
                        [7.6615231, 45.0624805],
                        [7.6615278, 45.0624869],
                        [7.6615128, 45.0624921],
                        [7.6615081, 45.0624857],
                        [7.6614807, 45.0624952],
                        [7.6613724, 45.0623475],
                        [7.6613754, 45.0623465],
                        [7.6613739, 45.0623444],
                        [7.6613981, 45.0623361],
                        [7.6614034, 45.0623013],
                        [7.661482, 45.0622741],
                        [7.6615258, 45.0622919],
                        [7.6615505, 45.0622834],
                        [7.6615523, 45.0622857],
                        [7.6615552, 45.0622847],
                        [7.6616632, 45.062432],
                        [7.6616278, 45.0624443],
                        [7.6616325, 45.0624507],
                        [7.6616175, 45.0624558],
                        [7.6616128, 45.0624495],
                        [7.6615992, 45.0624542],
                        [7.6615735, 45.062444],
                        [7.6615471, 45.0624532],
                      ],
                    ],
                  },
                },
              ],
            }}
          />
        </>
      ),
    });
  }, [navigation]);

  return (
    <View style={GlobalStyles.grow} pointerEvents="box-none">
      <BottomSheet middleSnapPoint={50}>
        <BottomSheetScrollView>
          <Col ph={5} mb={5}>
            <Text variant="title" style={styles.title}>
              Aula 1
            </Text>
            <Text>Sede Centrale - Cittadella Politecnica</Text>
            <Text variant="caption">Classroom</Text>
          </Col>

          <Section>
            <SectionHeader title="Aula 1 in your agenda" separator={false} />
            <SectionList translucent>
              <Col p={5}>
                <Text>Coming soon</Text>
              </Col>
            </SectionList>
          </Section>

          <Section>
            <SectionHeader title="Location" separator={false} />
            <SectionList translucent>
              <ListItem
                inverted
                titleProps={{
                  numberOfLines: undefined,
                  ellipsizeMode: undefined,
                }}
                title={'Corso Duca degli Abruzzi, 24\n10129, Torino'}
                subtitle="Address"
                trailingItem={
                  <Icon icon={faDiamondTurnRight} size={fontSizes.xl} />
                }
              />
              <ListItem inverted title="Aule T" subtitle="Building" isAction />
              <ListItem inverted title="0 - Ground floor" subtitle="Floor" />
              <ListItem
                inverted
                isAction
                titleProps={{
                  numberOfLines: undefined,
                  ellipsizeMode: undefined,
                }}
                title="Dipartimento di Ingegneria Strutturale, Edile e Geotecnica"
                subtitle="Structure"
              />
              {/* <ListItem*/}
              {/*  inverted*/}
              {/*  isAction*/}
              {/*  titleProps={{*/}
              {/*    numberOfLines: undefined,*/}
              {/*    ellipsizeMode: undefined,*/}
              {/*  }}*/}
              {/*  title="Sede Centrale - Cittadella Politecnica"*/}
              {/*  subtitle="Campus"*/}
              {/*/ >*/}
            </SectionList>
          </Section>

          <Section>
            <SectionHeader title="Facilities" separator={false} />
            <SectionList translucent>
              <ListItem inverted title="300 seats" subtitle="Capacity" />
              <ListItem
                inverted
                title="Yes"
                subtitle="Accessible to users with disabilities"
              />
            </SectionList>
          </Section>
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const createStyles = ({ fontSizes }: Theme) =>
  StyleSheet.create({
    title: {
      fontSize: fontSizes['2xl'],
    },
  });
