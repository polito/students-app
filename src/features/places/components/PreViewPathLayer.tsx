import { ShapeSource, LineLayer, LineJoin } from '@rnmapbox/maps';
import { useContext } from 'react';
import { PlacesContext } from '../contexts/PlacesContext';
import { useGetPath } from '~/core/queries/placesHooks';

export const PreViewPathLayer = () => {
  const pathFeatureCollection = useGetPath().features;      //da cambiare con la useMemo

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
    {pathFeatureCollection && pathFeatureCollection.length > 0 && (
       pathFeatureCollection.map((featuresArray: any, index: number) => {
        return (
          <ShapeSource id={`line-source-${index.toString()}`} shape={featuresArray.features}
            key={`line-source-${index.toString()}`}
          >
            <LineLayer
                id={`line-layer-${index.toString()}`}
                style={{ lineColor: getRandomColor(), lineWidth: 8, lineCap: LineJoin.Round, lineOpacity:  1  }}
            />
          </ShapeSource>
        );
    }))
    }
    </>
  );
};