import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { WebView as RNWebView } from 'react-native-webview';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { displayTabBar, hideTabBar } from '../../../utils/tab-bar.tsx';
import { ServiceStackParamList } from '../components/ServicesNavigator.tsx';

type Props = NativeStackScreenProps<ServiceStackParamList, 'WebView'>;

export const WebView = ({ navigation, route }: Props) => {
  const { uri, title } = route.params;
  navigation.setOptions({ title: title ?? 'WebView' });
  const styles = useStylesheet(createStyles);

  useEffect(() => {
    const rootNav = navigation.getParent()!;
    hideTabBar(rootNav);
    return () => displayTabBar(rootNav);
  }, [navigation]);

  return (
    <RNWebView
      source={{ uri: uri }}
      style={{ flex: 1 }}
      startInLoadingState={true}
      renderLoading={() => (
        <ActivityIndicator size="large" style={styles.centeredContainer} />
      )}
    />
  );
};

const createStyles = () =>
  StyleSheet.create({
    centeredContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  });
