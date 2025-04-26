import { useMemo, useState } from 'react';
import { PixelRatio, Platform, StyleSheet, View } from 'react-native';
import FastImage from 'react-native-fast-image';

import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useHeaderHeight } from '@react-navigation/elements';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SharedScreensParamList } from '../../../shared/navigation/SharedScreens';

type Props = NativeStackScreenProps<SharedScreensParamList, 'ImageScreen'>;

export const ImageScreen = ({ route }: Props) => {
  const { uri, width, height } = route.params;
  const styles = useStylesheet(createStyles);
  const [viewSize, setViewSize] = useState<
    { height: number; width: number } | undefined
  >();
  const headerHeight = useHeaderHeight();
  const bottomTabBarHeight = useBottomTabBarHeight();

  const imageProps = useMemo(() => {
    if (!viewSize) return;
    const pixelDensity = PixelRatio.get();
    const imageWidth = PixelRatio.roundToNearestPixel(width / pixelDensity);
    const imageHeight = PixelRatio.roundToNearestPixel(height / pixelDensity);
    const zoomRatioWidth = viewSize.width / imageWidth;
    const zoomRatioHeight = viewSize.height / imageHeight;
    // Calculate the smallest zoom ratio and use that for the image zoom ratio.
    let zoomRatio;
    if (zoomRatioHeight < zoomRatioWidth) {
      zoomRatio = zoomRatioHeight;
    } else {
      zoomRatio = zoomRatioWidth;
    }

    return { zoomRatio, imageWidth, imageHeight };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewSize]);

  return (
    <View
      style={{
        ...styles.container,
        paddingTop: Platform.OS === 'ios' ? headerHeight : 0,
        paddingBottom: bottomTabBarHeight,
      }}
    >
      <View style={styles.screenWrapper}>
        <View
          style={styles.zoomableViewContainer}
          onLayout={event => setViewSize(event.nativeEvent.layout)}
        >
          {imageProps && (
            <ReactNativeZoomableView
              maxZoom={30}
              minZoom={imageProps.zoomRatio}
              initialZoom={imageProps.zoomRatio}
              contentWidth={imageProps.imageWidth}
              contentHeight={imageProps.imageHeight}
            >
              <ImageLoader
                source={{ uri }}
                imageStyle={{
                  height: imageProps.imageHeight,
                  width: imageProps.imageWidth,
                }}
                resizeMode={FastImage.resizeMode.contain}
              />
            </ReactNativeZoomableView>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    screenWrapper: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    zoomableViewContainer: {
      flex: 1,
      flexGrow: 1,
    },
  });
