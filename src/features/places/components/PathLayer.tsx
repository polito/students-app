import { Feature, LineString } from 'geojson';
import { useGetPath } from '../../../core/queries/placesHooks';
import { ShapeSource, LineLayer, LineJoin } from '@rnmapbox/maps';
import { useContext, useEffect, useState } from 'react';
import { PlacesContext } from '../contexts/PlacesContext';
import { get, set } from 'lodash';
import { Path } from 'react-native-svg';

export const PathLayer = () => {
  const [groupedFeatures, setGroupedFeatures] = useState<any[][]>([]);

  const { floorId: mapFloorId, setFloorId: setMapFloorId } =        //useful to set the map tot the corrrect floor whenever the user click to that portion of the path
    useContext(PlacesContext);

  const { setLines: setLines } = useContext(PlacesContext);
  const { selectedLine: line, setSelectedLine: setLine } = useContext(PlacesContext);

  const featureCollection = useGetPath();
   if (!featureCollection || featureCollection.length === 0) {
    return null;
  }

  const handlePressSegment = async(label: string) => {
    let lineLayer = label;
    console.log("Pressed segment: " + lineLayer);

    if(line === lineLayer){
      setLine(undefined);
    }
    else{
      setLine(lineLayer);
    }
  }

  function getRandomColor(): string {
    const randomInt = Math.floor(Math.random() * 16777215);

    let hexString = randomInt.toString(16);

    while (hexString.length < 6) {
      hexString = '0' + hexString;
    }
    return `#${hexString}`;
  }

/*
  const extractFloorId = (vals: string) => {
    const valOut: string[] = [];

    const regex = /x[a-zA-Z](\w+)/g;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(vals)) !== null) {
      valOut.push(match[0]);
    }

    return valOut;
  };
  */

  const getGroupedFeatures = (data: any) => {
    const groupedFeatures: any[][] = [];
    let array: any[] = [];
    let counter = 0;

    data.forEach((item: any) => {
      if(item?.properties.link_typ === null)
        array.push(item);
      else{
        setLines(`line-layer-${counter.toString()}`);
        groupedFeatures.push(array);
        array = [];
        counter++;
      }
    });

    return groupedFeatures;
  }
  
  useEffect(() => {
    setGroupedFeatures(getGroupedFeatures(featureCollection));
  }, [featureCollection]);

  return (
    <>
      {groupedFeatures.length > 0 && groupedFeatures.map((featuresArray: any[], index: number) => {
        const allCoordinates = featuresArray.flatMap((feature: any) => {
          if (feature?.geometry && feature?.geometry.type === 'LineString') {
            return feature.geometry.coordinates;
          }
          return [];
        });

        const lineFeature: Feature<LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: allCoordinates,
          },
        };

        return (
          <ShapeSource id={`line-source-${index.toString()}`} shape={{
            type: 'FeatureCollection',
            features: [lineFeature],
            }}
            onPress={() => {
              handlePressSegment(`line-layer-${index.toString()}`);
            }}
          >
            {
              line ? (
                  <LineLayer
                    id={`line-layer-${index.toString()}`}
                    style={{ lineColor: line === `line-layer-${index.toString()}` ? "#ef7b00" : getRandomColor(), lineWidth: 8, lineCap: LineJoin.Round, lineOpacity: line === `line-layer-${index.toString()}` ? 1 : 0.3 }}
                  />
              ) : (
                  <LineLayer
                    id={`line-layer-${index.toString()}`}
                    style={{ lineColor: getRandomColor(), lineWidth: 8, lineCap: LineJoin.Round, lineOpacity: 1 }}
                  />
              )
            }
          </ShapeSource>
        );
    })}
    </>
  );
};