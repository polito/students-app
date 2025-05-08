import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML, {
  InternalRendererProps,
  RenderHTMLProps,
  useInternalRenderer,
} from 'react-native-render-html';

import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { Text } from '@lib/ui/components/Text';
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

const CustomTextRenderer = (props: InternalRendererProps<any>) => {
  const { accessibility } = usePreferencesContext();
  const { fontSizes } = useTheme();
  const [styledText, setStyledText] = useState('');
  const [dynamicStyle, setDynamicStyle] = useState({});

  const addWordSpacing = (text: string, spacing: number) => {
    if (accessibility?.wordSpacing) {
      return text.split(' ').join(' '.repeat(spacing));
    }
    return text;
  };

  useEffect(() => {
    let originalText = props.tnode?.data ?? '';

    originalText += ' ';

    setStyledText(addWordSpacing(originalText, fontSizes.md * 0.16));

    setDynamicStyle({
      fontSize: fontSizes.md,
      ...(accessibility?.letterSpacing && {
        letterSpacing: fontSizes.md * 0.12,
      }),
      ...(accessibility?.lineHeight && { lineHeight: fontSizes.md * 1.5 }),
      ...(accessibility?.paragraphSpacing && {
        marginBottom: fontSizes.md * 2,
      }),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.tnode?.data,
    props.tnode?.parent?.children,
    accessibility,
    fontSizes,
  ]);

  return (
    <Text selectable style={[props.style, dynamicStyle]}>
      {styledText}
    </Text>
  );
};

const renderers = {
  img: CustomImageRenderer,
  span: CustomTextRenderer,
};

type HtmlViewProps = {
  props: RenderHTMLProps;
  variant: string;
};

export const HtmlView = ({ variant, props }: HtmlViewProps) => {
  const { colors, palettes, spacing, fontSizes } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useStylesheet(createStyles);

  const wrapText = (html: string): string => {
    if (!html) return '';

    html = html.replace(
      /(^|>)([^<>\n]+)($|<)/g,
      (match, before, text, after) => {
        const trimmedText = text.trim();
        if (!trimmedText) return match;
        return `${before}<span>${trimmedText}</span>${after}`;
      },
    );

    return html;
  };
  const processedSource =
    variant === 'longProse'
      ? {
          ...props.source,
          html:
            'html' in props.source && props.source.html
              ? wrapText(props.source.html)
              : '',
        }
      : undefined;

  return (
    <RenderHTML
      contentWidth={width}
      defaultTextProps={{
        selectable: true,
        selectionColor: palettes.secondary[600],
      }}
      systemFonts={['Montserrat']}
      {...props}
      source={processedSource ?? props.source}
      baseStyle={{
        padding: spacing[4],
        color: colors.prose,
        fontFamily: 'Montserrat',
        fontSize: fontSizes.md,
        ...(props.baseStyle ?? {}),
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

const createStyles = ({ spacing, fontWeights, colors, dark }: Theme) =>
  StyleSheet.create({
    paragraph: { marginBottom: spacing[0], marginTop: spacing[3] },
    bold: { fontWeight: fontWeights.semibold },
    image: {
      width: '50%',
      justifyContent: 'flex-start',
    },
    link: {
      color: dark ? colors.white : colors.black,
      textDecorationColor: dark ? colors.white : colors.black,
    },
  });
