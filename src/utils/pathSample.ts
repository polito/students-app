import data from '../utils/pathFinale.json'

const createGeoJSONData = (data: any) => {
    const features = data.features.map((item: any) => {

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
                    build_id: item.fn_bl_id,
                    floor_id: item.fn_fl_id,
                    no_disab: item.no_disab,
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

export const myGeoJSONData = data;