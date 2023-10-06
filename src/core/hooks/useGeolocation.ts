import { useCallback, useEffect } from 'react';
import { Linking } from 'react-native';

import Geolocation from '@react-native-community/geolocation';

import GeoPoint from 'geopoint';

import { IS_ANDROID } from '../constants';
import { useFeedbackContext } from '../contexts/FeedbackContext';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

Geolocation.setRNConfiguration({
  skipPermissionRequests: false,
  authorizationLevel: 'whenInUse',
  enableBackgroundLocationUpdates: true,
  locationProvider: 'auto',
});

const openSettings = () => {
  if (IS_ANDROID) {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(
      console.error,
    );
  } else {
    Linking.openURL('app-settings:').catch(console.error);
  }
};

export const computeDistance = (a?: Coordinates, b?: Coordinates) => {
  if (!a || !b) return 0;

  const pointA = new GeoPoint(a.latitude, a.longitude);
  const pointB = new GeoPoint(b.latitude, b.longitude);

  return pointA.distanceTo(pointB, true); // output in kilometers
};

export const useGeolocation = () => {
  const { setFeedback } = useFeedbackContext();

  const getCurrentPosition = useCallback(() => {
    return new Promise<Coordinates>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          console.debug('Geolocation.getCurrentPosition success: ', {
            latitude,
            longitude,
          });
          resolve({ latitude, longitude });
        },
        error => {
          console.error('Geolocation.getCurrentPosition error: ', error);
          if (error.code === 2) {
            setFeedback({
              text: 'You need to enable location services to check in reservation.',
              isPersistent: false,
            });
          }
          reject(error);
        },
      );
    });
  }, []);

  useEffect(() => {
    console.debug('Geolocation permission request');
    Geolocation.requestAuthorization(
      () => console.debug('Geolocation permission granted'),
      error => {
        console.error('Geolocation request permission error: ', error);
        if (error.code === 1) {
          console.error('User denied access to location services.');
          setFeedback({
            text: 'You need to enable location services to check in reservation.',
            action: {
              label: 'Open settings',
              onPress: openSettings,
            },
            isPersistent: true,
          });
        }
      },
    );
  }, []);

  return {
    getCurrentPosition,
    computeDistance,
  };
};
