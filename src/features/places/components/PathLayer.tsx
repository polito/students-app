import { ShapeSource, LineLayer, LineJoin } from '@rnmapbox/maps';
import { useContext, useEffect, useState } from 'react';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetPath } from '~/core/queries/placesHooks';

export const PathLayer = () => {
  const [ selectedFloor ] = useState<string | undefined>(undefined);

  const { setFloorId: setMapFloorId } =        //useful to set the map tot the corrrect floor whenever the user click to that portion of the path
    useContext(PlacesContext);
    
  const { selectedLine: line } = useContext(PlacesContext);
  const pathFeatureCollection = useGetPath().features;

  /*
  const featureCollection = useGetPath();

  useEffect(() => {
    if (featureCollection) {
      setPathFeatureCollection(featureCollection.features);
    }
  }, [featureCollection]);
  */

  useEffect(() => {
    if(line){
      setMapFloorId(selectedFloor);
    }
    else
      setMapFloorId('XPTE');
  }, [line]);

  function getRandomColor(): string {         //da sostituire col design system adeguato
    const randomInt = Math.floor(Math.random() * 16777215);

    let hexString = randomInt.toString(16);

    while (hexString.length < 6) {
      hexString = '0' + hexString;
    }
    return `#${hexString}`;
  }

  return (
    <>
    {pathFeatureCollection && pathFeatureCollection.length > 0 && (
       pathFeatureCollection.map((featuresArray: any, index: number) => {
        return (
          <ShapeSource id={`line-source-${index.toString()}`} shape={featuresArray.features}
            key={`line-source-${index.toString()}`}
            //onPress={() => {
              //handleSelectSegment?.(`line-layer-${index.toString()}`, featuresArray.json_build_object.features[0].properties.fn_fl_id);   //da vedere bene
            //}}
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
    }))
    }
    </>
  );
};