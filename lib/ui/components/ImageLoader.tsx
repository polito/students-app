import { useState } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import FastImage, { ImageStyle, ResizeMode } from 'react-native-fast-image';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';

interface Props {
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode: ResizeMode;
  source: { uri: string };
}

export const ImageLoader = ({
  source,
  containerStyle,
  imageStyle,
  resizeMode = FastImage.resizeMode.contain,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(source);

  const onLoadEnd = () => setLoading(false);
  const onLoadStart = () => setLoading(true);

  return (
    <View style={containerStyle} onLayout={() => setSrc(source)}>
      <FastImage
        resizeMode={resizeMode}
        style={imageStyle}
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
