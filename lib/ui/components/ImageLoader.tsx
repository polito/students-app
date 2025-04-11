import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FastImage, {
  FastImageProps,
  FastImageStaticProperties,
  ImageStyle,
  ResizeMode,
} from 'react-native-fast-image';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';

type Props = Partial<Omit<FastImageStaticProperties, 'resizeMode'>> &
  FastImageProps & {
    containerStyle?: StyleProp<ViewStyle>;
    source: { uri: string };
    resizeMode: ResizeMode;
    imageStyle?: StyleProp<ImageStyle>;
  };

export const ImageLoader = ({ resizeMode, imageStyle, ...rest }: Props) => {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(rest.source);

  const onLoadEnd = () => setLoading(false);
  const onLoadStart = () => setLoading(true);

  return (
    <View style={rest.containerStyle} onLayout={() => setSrc(rest.source)}>
      <FastImage
        {...rest}
        style={imageStyle}
        resizeMode={resizeMode}
        onLoadEnd={onLoadEnd}
        onLoadStart={onLoadStart}
        source={src}
      />
      {loading && <ActivityIndicator style={styles.activityIndicator} />}
    </View>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
