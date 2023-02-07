import React, { useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';

interface Props {
  imageStyle?: any;
  source: { uri: string };
}

export const ImageLoader = ({ source, imageStyle }: Props) => {
  const [loading, setLoading] = useState(true);

  const onLoadEnd = () => setLoading(() => false);

  return (
    <View style={styles.container}>
      <Image
        resizeMode={'contain'}
        style={imageStyle}
        onLoadEnd={onLoadEnd}
        source={source}
      />
      <ActivityIndicator style={styles.activityIndicator} animating={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  activityIndicator: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});
