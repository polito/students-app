import { useContext, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import MapView, { MapViewProps } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigatorProps } from 'react-native-screens/lib/typescript/native-stack/types';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import {
  Header,
  HeaderBackButton,
  HeaderBackContext,
  HeaderHeightContext,
  Screen,
  getHeaderTitle,
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

import { IS_IOS } from '../../../core/constants';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';

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
  const [headerHeight, setHeaderHeight] = useState(0);
  const safeAreaInsets = useSafeAreaInsets();
  const currentRoute = descriptors[state.routes[state.index].key];
  const mapOptions = currentRoute.options?.mapOptions ?? {};
  const previousKey = state.routes[state.index - 1]?.key;
  const previousDescriptor = previousKey ? descriptors[previousKey] : undefined;
  const parentHeaderBack = useContext(HeaderBackContext);
  const headerBack = previousDescriptor
    ? {
        title: getHeaderTitle(
          previousDescriptor.options,
          previousDescriptor.route.name,
        ),
      }
    : parentHeaderBack;
  const canGoBack = headerBack !== undefined;
  const tabBarHeight = useBottomTabBarHeight();
  const title = getHeaderTitle(
    currentRoute.options,
    state.routes[state.index].name,
  );
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
                                    style={[styles.backImage, { tintColor }]}
                                  />
                                )
                              : undefined
                          }
                          onPress={navigation.goBack}
                          canGoBack={canGoBack}
                          label={
                            headerBackTitle ?? previousDescriptor?.options.title
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
            style={GlobalStyles.grow}
            mapPadding={{
              top: headerHeight,
              bottom: tabBarHeight,
              left: safeAreaInsets.left,
              right: safeAreaInsets.right,
            }}
            {...mapOptions}
          >
            {currentRoute.options?.mapDefaultContent}
            {currentRoute.options?.mapContent}
          </MapView>

          <HeaderHeightContext.Consumer>
            {height => {
              if (height != null) {
                setHeaderHeight(height);
              }
              return (
                <View
                  style={{
                    position: 'absolute',
                    top: height,
                    bottom: tabBarHeight,
                    left: 0,
                    right: 0,
                  }}
                  pointerEvents="box-none"
                >
                  {currentRoute.render()}
                </View>
              );
            }}
          </HeaderHeightContext.Consumer>
        </HeaderBackContext.Provider>
      </Screen>
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

export type MapNavigationOptions = NativeStackNavigationOptions & {
  mapOptions?: Partial<Omit<MapViewProps, 'children'>>;
  mapContent?: JSX.Element;
  mapDefaultContent?: JSX.Element;
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
