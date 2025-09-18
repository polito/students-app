import { useGetPath } from '../../../core/queries/placesHooks';
import { ShapeSource, LineLayer, LineJoin } from '@rnmapbox/maps';
import { useContext, useEffect, useState } from 'react';
import { PlacesContext } from '../contexts/PlacesContext';

export const PathLayer = () => {
  const [groupedFeatures, setGroupedFeatures] = useState<any[][]>([]);
  const [selectedFloor, setSelectedFloor] = useState<string | undefined>(undefined);

  const { floorId: mapFloorId, setFloorId: setMapFloorId } =        //useful to set the map tot the corrrect floor whenever the user click to that portion of the path
    useContext(PlacesContext);
    
  const { selectedLine: line, setSelectedLine: setLine } = useContext(PlacesContext);

  const featureCollection = useGetPath();

  const handlePressSegment = async(label: string, floor: string) => {
    let lineLayer = label;

    if(line === lineLayer){
      setLine(undefined);
    }
    else{
      setLine(lineLayer);
      setSelectedFloor(floor);
    }
  }

  useEffect(() => {
    if(line){
      setMapFloorId(selectedFloor);
    }
    else
      setMapFloorId('XPTE');
  }, [line]);

  function getRandomColor(): string {
    const randomInt = Math.floor(Math.random() * 16777215);

    let hexString = randomInt.toString(16);

    while (hexString.length < 6) {
      hexString = '0' + hexString;
    }
    return `#${hexString}`;
  }

  return (
    <>
      {featureCollection.features.length > 0 && featureCollection.features.map((featuresArray: any, index: number) => {
        return (
          <ShapeSource id={`line-source-${index.toString()}`} shape={featuresArray.json_build_object}
            key={`line-source-${index.toString()}`}
            onPress={() => {
              handlePressSegment(`line-layer-${index.toString()}`, featuresArray.json_build_object.features[0].properties.fn_fl_id);
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