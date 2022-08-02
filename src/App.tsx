import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
} from 'react-native';
import { registerRootComponent } from 'expo';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { TabBar } from './core/components/TabBar';
import { colors } from './core/constants/colors';
import * as themes from './core/constants/themes';
import './core/services/i18n';

export const App = () => {
  const colorScheme = useColorScheme();
  let theme, statusBarProps;

  if (colorScheme === 'dark') {
    theme = themes.DarkTheme;
    statusBarProps = {
      style: 'light',
      backgroundColor: colors.surfaceDark,
    };
  } else {
    theme = themes.LightTheme;
    statusBarProps = {
      style: 'dark',
      backgroundColor: colors.surfaceLight,
    };
  }

  return (
    <>
      <ExpoStatusBar {...statusBarProps} />
      <SafeAreaView style={styles.container}>
        <NavigationContainer theme={theme}>
          <TabBar />
        </NavigationContainer>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
});

export default App;
registerRootComponent(App);
