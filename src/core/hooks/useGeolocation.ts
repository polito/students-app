import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  return pointA.distanceTo(pointB, true);
};

export const useGeolocation = () => {
  const { setFeedback } = useFeedbackContext();
  const { t } = useTranslation();

  const getCurrentPosition = useCallback(() => {
    return new Promise<Coordinates>((resolve, reject) => {
      Geolocation.getCurrentPosition(
        ({ coords: { latitude, longitude } }) => {
          resolve({ latitude, longitude });
        },
        error => {
          if (error.code === 2) {
            setFeedback({
              text: t('common.enableLocationServiceFeedback'),
              isPersistent: false,
            });
          }
          reject(error);
        },
      );
    });
  }, [t, setFeedback]);

  useEffect(() => {
    Geolocation.requestAuthorization(
      () => console.debug('Geolocation permission granted'),
      error => {
        if (error.code === 1) {
          setFeedback({
            text: t('common.enableLocationPermissionFeedback'),
            action: {
              label: t('common.openSettings'),
              onPress: openSettings,
            },
            isPersistent: true,
          });
        }
      },
    );
  }, [t, setFeedback]);

  return {
    getCurrentPosition,
    computeDistance,
  };
};
