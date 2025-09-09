import { ShapeSource, LineLayer } from '@rnmapbox/maps';
import { useContext, useEffect, useState } from 'react';
import { useGetPath } from '~/core/queries/placesHooks';
import { PreferencesContext } from '~/core/contexts/PreferencesContext';

export const PreViewPathLayer = () => {
  const pathFeatureCollection = useGetPath().features;      //da cambiare con la useMemo
  const courses = useContext(PreferencesContext)?.courses;
  const [colors, setColors] = useState<string[]>([]);

  useEffect(()=>{
    const courseColors = Object.values(courses || {}).map(c => c.color);

    if(colors.length < pathFeatureCollection.length){
      let counter = courseColors.length;
      while(courseColors.length < pathFeatureCollection.length){
        colors.push(courseColors[counter % courseColors.length]);
        counter++;
      }
    }

    setColors(courseColors);

  }, [courses]);
  
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
                style={{ lineColor: colors[index], lineWidth: 8, lineCap:'round', lineJoin: 'round', lineOpacity:  1  }}
            />
          </ShapeSource>
        );
    }))
    }
    </>
  );
};