import { LinkingOptions } from '@react-navigation/native';

export const setDeepLink = () => {
  const linking: LinkingOptions<any> = {
    prefixes: ['polito://'],
    config: {
      screens: {
        PlacesTab: {
          screens: {
            Place: {
              path: 'placesTab/place/:placeId',
            },
          },
        },
        Login: {
          path: 'login',
          parse: {
            uid: (uid: string) => uid,
            key: (key: string) => key,
          },
        },
      },
    },
  };
  return linking;
};
