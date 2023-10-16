import { MarkerView } from '@rnmapbox/maps';

import { useGetPlace } from '../../../core/queries/placesHooks';

interface Props {
  placeId: string;
}

export const PlaceMarker = ({ placeId }: Props) => {
  const { data: place, isLoading } = useGetPlace(placeId);

  if (isLoading || !place?.data) {
    return null;
  }
  return (
    <MarkerView
      coordinate={[+place.data.latitude, +place.data.longitude]}
      // title={place.data.name}
      // description={place.data.type}
    />
  );
};
