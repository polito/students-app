import data from '../utils/pathCostant.json'

const createGeoJSONData = (data: any) => {
    const features = data.paths.map((item: any) => {

        if(item.edge != -1){
            const lineString = item.geom;
            const coordinates = lineString?.substring(lineString.indexOf('(') + 1, lineString.indexOf(')'))
                .split(', ')
                .map((point: any) => point.split(' ').map(Number));

            return {
                type: 'Feature',
                properties: {
                    link_typ: item.link_typ,
                    vals: item.vals,
                },                         //to add the several informations such as stairs, elevators, disab ecc
                geometry: {
                    type: 'LineString',
                    coordinates: coordinates?.map((coord: any) => [coord[0], coord[1]])
                },
            };
        }
  });

  return features;
};

export const myGeoJSONData = createGeoJSONData(data);