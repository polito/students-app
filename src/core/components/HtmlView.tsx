import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML, {
  InternalRendererProps,
  RenderHTMLProps,
  useInternalRenderer,
} from 'react-native-render-html';

import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../contexts/PreferencesContext';

type ImageData = {
  width: number;
  height: number;
  uri: string;
};
const CustomImageRenderer = (props: InternalRendererProps<any>) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { rendererProps } = useInternalRenderer('img', props);
  const uri = rendererProps.source.uri ?? '';
  const [imageData, setImageData] = useState<ImageData>();

  const onPress = () => {
    if (imageData) {
      navigation.navigate('ImageScreen', {
        ...imageData,
      });
    }
  };

  useEffect(() => {
    Image.getSize(uri, (width, height) => {
      setImageData({ width, height, uri });
    });
  }, [uri]);

  return (
    <ImageLoader
      source={{ uri: uri ?? '' }}
      imageStyle={{ height: 200 }}
      containerStyle={{ height: 200 }}
      resizeMode="cover"
      onTouchStart={onPress}
    />
  );
};

const renderers = {
  img: CustomImageRenderer,
};
type HtmlViewProps = {
  props: RenderHTMLProps;
  variant: string;
};
export const HtmlView = ({ variant, props }: HtmlViewProps) => {
  const { colors, palettes, spacing, fontSizes } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useStylesheet(createStyles);
  const [styless, setStyless] = useState({});
  const { accessibility } = usePreferencesContext();
  useEffect(() => {
    const changeStyle = () => {
      if (variant === 'longProse')
        setStyless(() => {
          return {
            lineHeight:
              accessibility?.fontPlacement === 'long-text' &&
              accessibility?.lineHeight
                ? fontSizes.sm * 1.5
                : undefined,
            letterSpacing:
              accessibility?.fontPlacement === 'long-text'
                ? fontSizes.sm * 0.12
                : undefined,
            marginBottom:
              accessibility?.fontPlacement === 'long-text' &&
              accessibility?.paragraphSpacing
                ? fontSizes.sm * 2
                : 0,
          };
        });
    };
    changeStyle();
  }, [accessibility, variant, fontSizes]);
  return (
    <RenderHTML
      contentWidth={width}
      defaultTextProps={{
        selectable: true,
        selectionColor: palettes.secondary[600],
      }}
      systemFonts={['Montserrat']}
      {...props}
      baseStyle={{
        padding: spacing[4],
        color: colors.prose,
        fontFamily: 'Montserrat',
        fontSize: fontSizes.md,
        ...(props.baseStyle ?? {}),
        ...styless,
      }}
      tagsStyles={{
        p: styles.paragraph,
        b: styles.bold,
        img: styles.image,
        a: styles.link,
      }}
      ignoredStyles={[
        'fontFamily',
        'color',
        'backgroundColor',
        'width',
        'height',
      ]}
      renderers={renderers}
    />
  );
};

const createStyles = ({ spacing, fontWeights, colors }: Theme) =>
  StyleSheet.create({
    paragraph: { marginBottom: spacing[0], marginTop: spacing[3] },
    bold: { fontWeight: fontWeights.semibold },
    image: {
      width: '50%',
      justifyContent: 'flex-start',
    },
    link: {
      color: colors.white,
      textDecorationColor: colors.white,
    },
  });
