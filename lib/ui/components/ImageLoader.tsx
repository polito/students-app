import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

interface Props {
  imageStyle?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  source: { uri: string };
}

export const ImageLoader = ({ source, containerStyle, imageStyle }: Props) => {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(source);

  const onLoadEnd = () => setLoading(false);
  const onLoadStart = () => setLoading(true);

  return (
    <View style={containerStyle} onLayout={() => setSrc(source)}>
      <Image
        resizeMode="contain"
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
