import { GestureHandlerRootView } from 'react-native-gesture-handler';

import {
  ComponentProps,
  ComponentType,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Image, SafeAreaView, StyleSheet, View } from 'react-native';
import { NativeStackNavigatorProps } from 'react-native-screens/lib/typescript/native-stack/types';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Header,
  HeaderBackButton,
  HeaderBackContext,
  Screen,
  getHeaderTitle,
  useHeaderHeight,
} from '@react-navigation/elements';
import {
  DefaultRouterOptions,
  NavigationProp,
  ParamListBase,
  RouteProp,
  StackActionHelpers,
  StackNavigationState,
  StackRouter,
  createNavigatorFactory,
  useNavigationBuilder,
} from '@react-navigation/native';
import {
  NativeStackNavigationEventMap,
  NativeStackNavigationOptions,
} from '@react-navigation/native-stack';
import { BackgroundLayer, Camera, MapView } from '@rnmapbox/maps';

import { IS_ANDROID, IS_IOS } from '../../../core/constants';
import { useDeviceOrientation } from '../../../core/hooks/useDeviceOrientation';
import { useKeyboardVisibile } from '../../../core/hooks/useKeyboardVisibile';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { MapNavigatorContext } from '../contexts/MapNavigatorContext';

interface Insets {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface RouteProps {
  renderRoute: (...args: unknown[]) => ReactNode;
}

const Route = ({ renderRoute }: RouteProps) => {
  const headerHeight = useHeaderHeight();
  const keyboardVisible = useKeyboardVisibile();
  const tabBarHeight = useBottomTabBarHeight();
  return (
    <SafeAreaView
      style={{
        position: 'absolute',
        top: headerHeight,
        bottom: IS_ANDROID && keyboardVisible ? 0 : tabBarHeight,
        left: 0,
        right: 0,
      }}
      pointerEvents="box-none"
    >
      {renderRoute()}
    </SafeAreaView>
  );
};

export const MapNavigator = ({
  initialRouteName,
  children,
  screenOptions,
}: NativeStackNavigatorProps) => {
  const { state, navigation, descriptors, NavigationContent } =
    useNavigationBuilder<
      StackNavigationState<ParamListBase>,
      DefaultRouterOptions,
      StackActionHelpers<any>,
      MapNavigationOptions,
      NativeStackNavigationEventMap
    >(StackRouter, {
      children,
      screenOptions,
      initialRouteName,
    });
  const mapRef = useRef<MapView>(null);
  const cameraRef = useRef<Camera>(null);
  const currentRoute = descriptors[state.routes[state.index].key];
  const mapDefaultOptions = currentRoute.options?.mapDefaultOptions ?? {};
  const mapOptions = currentRoute.options?.mapOptions ?? {};
  const previousKey = state.routes[state.index - 1]?.key;
  const previousDescriptor = previousKey ? descriptors[previousKey] : undefined;
  const parentHeaderBack = useContext(HeaderBackContext);
  const { dark } = useTheme();
  const headerBack = previousDescriptor
    ? {
        title: getHeaderTitle(
          previousDescriptor.options,
          previousDescriptor.route.name,
        ),
      }
    : parentHeaderBack;
  const canGoBack = headerBack !== undefined;
  const title = getHeaderTitle(
    currentRoute.options,
    state.routes[state.index].name,
  );
  const orientation = useDeviceOrientation();
  const [rotating, setRotating] = useState(false);
  const MapDefaultContent = currentRoute.options?.mapDefaultContent;
  const MapContent = currentRoute.options?.mapContent;

  useEffect(() => {
    if (IS_IOS) {
      setRotating(true);
      setTimeout(() => {
        setRotating(false);
      }, 1500);
    }
  }, [orientation]);

  const {
    header,
    headerShown,
    headerTintColor,
    headerBackImageSource,
    headerLeft,
    headerRight,
    headerTitle,
    headerTitleAlign,
    headerTitleStyle,
    headerStyle,
    headerShadowVisible,
    headerTransparent,
    headerBackground,
    headerBackTitle,
    headerBackTitleStyle,
    headerBackVisible,
    headerBackTitleVisible,
  } = currentRoute.options;

  return (
    <NavigationContent>
      <GestureHandlerRootView style={GlobalStyles.grow}>
        <BottomSheetModalProvider>
          <Screen
            focused={true}
            navigation={currentRoute.navigation}
            route={currentRoute.route}
            headerShown={headerShown}
            headerTransparent={headerTransparent}
            header={
              header !== undefined ? (
                header({
                  back: headerBack,
                  options: currentRoute.options,
                  route: currentRoute.route,
                  navigation: currentRoute.navigation,
                })
              ) : (
                <Header
                  title={title}
                  headerTintColor={headerTintColor}
                  headerLeft={
                    headerBackVisible !== false
                      ? typeof headerLeft === 'function'
                        ? ({ tintColor }) =>
                            headerLeft({
                              tintColor,
                              canGoBack,
                              label: headerBackTitle,
                            })
                        : headerLeft === undefined && canGoBack
                        ? ({ tintColor }) => (
                            <HeaderBackButton
                              tintColor={tintColor}
                              backImage={
                                headerBackImageSource !== undefined
                                  ? () => (
                                      <Image
                                        source={headerBackImageSource}
                                        style={[
                                          styles.backImage,
                                          { tintColor },
                                        ]}
                                      />
                                    )
                                  : undefined
                              }
                              onPress={navigation.goBack}
                              canGoBack={canGoBack}
                              label={
                                headerBackTitle ??
                                previousDescriptor?.options.title
                              }
                              labelVisible={IS_IOS && headerBackTitleVisible}
                              labelStyle={headerBackTitleStyle}
                            />
                          )
                        : headerLeft
                      : undefined
                  }
                  headerRight={
                    typeof headerRight === 'function'
                      ? ({ tintColor }) => headerRight({ tintColor, canGoBack })
                      : headerRight
                  }
                  headerTitle={
                    typeof headerTitle === 'function'
                      ? ({ children: titleChildren, tintColor }) =>
                          headerTitle({ children: titleChildren, tintColor })
                      : headerTitle
                  }
                  headerTitleAlign={headerTitleAlign}
                  headerTitleStyle={headerTitleStyle}
                  headerTransparent={headerTransparent}
                  headerShadowVisible={headerShadowVisible}
                  headerBackground={headerBackground}
                  headerStyle={headerStyle}
                />
              )
            }
          >
            <HeaderBackContext.Provider value={headerBack}>
              <MapView
                ref={mapRef}
                style={[GlobalStyles.grow, rotating && { display: 'none' }]}
                {...mapDefaultOptions}
                {...mapOptions}
              >
                <BackgroundLayer
                  id="background"
                  // eslint-disable-next-line react-native/no-color-literals
                  style={{ backgroundColor: dark ? 'black' : 'white' }}
                />
                <Camera
                  ref={cameraRef}
                  {...(mapDefaultOptions?.camera ?? {})}
                  {...(mapOptions?.camera ?? {})}
                />
                {MapDefaultContent && <MapDefaultContent />}
                {MapContent && <MapContent />}
              </MapView>

              <MapNavigatorContext.Provider value={{ mapRef, cameraRef }}>
                {!rotating ? (
                  <Route renderRoute={currentRoute.render} />
                ) : (
                  <View
                    style={[
                      StyleSheet.absoluteFill,
                      { alignItems: 'center', justifyContent: 'center' },
                    ]}
                  >
                    <ActivityIndicator />
                  </View>
                )}
              </MapNavigatorContext.Provider>
            </HeaderBackContext.Provider>
          </Screen>
        </BottomSheetModalProvider>
      </GestureHandlerRootView>
    </NavigationContent>
  );
};

const styles = StyleSheet.create({
  backImage: {
    height: 24,
    width: 24,
    margin: 3,
    resizeMode: 'contain',
  },
});

type MapViewProps = ComponentProps<typeof MapView>;

type MapOptions = Partial<
  Omit<MapViewProps, 'children'> & {
    camera: Partial<Parameters<typeof Camera>[0]>;
    insets?: Insets;
  }
>;

export type MapNavigationOptions = NativeStackNavigationOptions & {
  mapOptions?: MapOptions;
  mapDefaultOptions?: MapOptions;
  mapContent?: ComponentType;
  mapDefaultContent?: ComponentType;
};

export const createMapNavigator = createNavigatorFactory<
  StackNavigationState<ParamListBase>,
  MapNavigationOptions,
  NativeStackNavigationEventMap,
  typeof MapNavigator
>(MapNavigator);

export type MapNavigationProp<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string,
  NavigatorID extends string | undefined = undefined,
> = NavigationProp<
  ParamList,
  RouteName,
  NavigatorID,
  StackNavigationState<ParamList>,
  MapNavigationOptions,
  NativeStackNavigationEventMap
> &
  StackActionHelpers<ParamList>;

export type MapScreenProps<
  ParamList extends ParamListBase,
  RouteName extends keyof ParamList = string,
  NavigatorID extends string | undefined = undefined,
> = {
  navigation: MapNavigationProp<ParamList, RouteName, NavigatorID>;
  route: RouteProp<ParamList, RouteName>;
};
