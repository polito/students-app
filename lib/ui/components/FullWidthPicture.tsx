import { useEffect, useState } from 'react';
import { Image, ImageProps, ImageURISource } from 'react-native';

type Props = ImageProps & {
  source: ImageURISource;
};

export const FullWidthPicture = ({ source, style, ...rest }: Props) => {
  const [ratio, setRatio] = useState(1);
  useEffect(() => {
    if (source.uri) {
      Image.getSize(source.uri, (width, height) => {
        setRatio(width / height);
      });
    }
  }, [source]);

  return (
    <Image
      style={[{ width: '100%', height: undefined, aspectRatio: ratio }, style]}
      resizeMode="contain"
      source={source}
      {...rest}
    />
  );
};
