import { ComponentProps, useState } from 'react';
import {
  ImageStyle,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';

import { Image, ImageSource } from 'expo-image';

type Props = Omit<ComponentProps<typeof Image>, 'source' | 'style'> & {
  containerStyle?: StyleProp<ViewStyle>;
  source: ImageSource;
  resizeMode?: NonNullable<ComponentProps<typeof Image>['contentFit']>;
  imageStyle?: StyleProp<ImageStyle>;
};

export const ImageLoader = ({ resizeMode, imageStyle, ...rest }: Props) => {
  const [loading, setLoading] = useState(true);
  const [src, setSrc] = useState(rest.source);

  const onLoadEnd = () => setLoading(false);
  const onLoadStart = () => setLoading(true);

  return (
    <View style={rest.containerStyle} onLayout={() => setSrc(rest.source)}>
      <Image
        {...rest}
        style={imageStyle}
        contentFit={resizeMode}
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
