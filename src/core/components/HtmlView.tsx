import { useEffect, useState } from 'react';
import { Image, StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML, {
  InternalRendererProps,
  RenderHTMLProps,
  TNodeChildrenRenderer,
  useInternalRenderer,
} from 'react-native-render-html';

import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { Text, calculateValueOfPercentage } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { render as domToHtml } from 'dom-serializer';
import { ChildNode, Document, Element, hasChildren } from 'domhandler';
import { Text as domText } from 'domhandler';
import { replaceElement } from 'domutils';
import { parseDocument } from 'htmlparser2';

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

const createCustomTextRenderer = (variant: string) => {
  return (props: InternalRendererProps<any>) => {
    const { accessibility } = usePreferencesContext();
    const { fontSizes } = useTheme();
    const tnode = props.tnode;

    const isTextNode = tnode.type === 'text';
    const originalText = isTextNode ? (tnode.data ?? '') : null;

    const spacedText =
      isTextNode && accessibility?.wordSpacing
        ? originalText.split(' ').join(' '.repeat(fontSizes.md * 0.16))
        : originalText;

    const dynamicStyle = {
      fontSize: fontSizes.md,
      ...(accessibility?.letterSpacing &&
        accessibility.fontSize && {
          letterSpacing:
            calculateValueOfPercentage(accessibility.fontSize, fontSizes.md) *
            0.12,
        }),
      ...(accessibility?.lineHeight &&
        accessibility.fontSize && {
          lineHeight:
            calculateValueOfPercentage(accessibility.fontSize, fontSizes.md) *
            1.5,
        }),
      ...(accessibility?.paragraphSpacing &&
        accessibility.fontSize &&
        variant !== 'cta' && {
          marginBottom:
            calculateValueOfPercentage(accessibility.fontSize, fontSizes.md) *
            2,
        }),
    };

    return (
      <Text selectable style={[props.style, dynamicStyle]}>
        {isTextNode ? spacedText : <TNodeChildrenRenderer tnode={tnode} />}
      </Text>
    );
  };
};

type HtmlViewProps = {
  props: RenderHTMLProps;
  variant: string;
};

export const wrapText = (html: string): string => {
  if (!html) return '';

  const dom = parseDocument(html);

  const INLINE_TAGS = new Set(['span', 'b', 'strong', 'i', 'em', 'a']);

  const walk = (nodes: ChildNode[], parentTag: string | null = null) => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];

      if (node.type === 'text') {
        const content = (node as domText).data?.trim();
        const isSafeToWrap = content && !INLINE_TAGS.has(parentTag ?? '');

        if (isSafeToWrap) {
          const span = new Element('span', {});
          span.children = [new domText(content)];
          replaceElement(node, span);
        }
      } else if (
        node.type === 'tag' &&
        (node as Element).name &&
        (node as Element).name.match(/^(strong|b)$/)
      ) {
        const el = node as Element;
        const siblings = (el.parent as Element)?.children ?? [];

        const prev = siblings[i - 1];
        const next = siblings[i + 1];

        const isTextNode = (n: ChildNode) => n?.type === 'text';
        const isInlineTag = (n: ChildNode) =>
          n?.type === 'tag' && INLINE_TAGS.has((n as Element).name);

        if (isTextNode(prev) || isInlineTag(prev)) {
          const firstChild = el.children[0];
          if (firstChild?.type === 'text') {
            const txt = firstChild as domText;
            if (!txt.data.startsWith(' ')) {
              txt.data = ' ' + txt.data;
            }
          }
        }

        if (isTextNode(next) || isInlineTag(next)) {
          const lastChild = el.children[el.children.length - 1];
          if (lastChild?.type === 'text') {
            const txt = lastChild as domText;
            if (!txt.data.endsWith(' ')) {
              txt.data = txt.data + ' ';
            }
          }
        }
      }

      if (hasChildren(node)) {
        const currentTag = (node as Element).name ?? null;
        walk((node as Element).children as ChildNode[], currentTag);
      }
    }
  };

  walk((dom as Document).children as ChildNode[]);
  return domToHtml(dom);
};

export const HtmlView = ({ variant, props }: HtmlViewProps) => {
  const { colors, palettes, spacing, fontSizes } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useStylesheet(createStyles);
  const { accessibility } = usePreferencesContext();

  const processedSource =
    variant === 'longProse' ||
    (variant === 'cta' && Number(accessibility?.fontSize) >= 150)
      ? {
          ...props.source,
          html:
            'html' in props.source && props.source.html
              ? wrapText(props.source.html)
              : '',
        }
      : undefined;

  const renderers = {
    text: createCustomTextRenderer(variant),
    span: createCustomTextRenderer(variant),
    b: createCustomTextRenderer(variant),
    strong: createCustomTextRenderer(variant),
    i: createCustomTextRenderer(variant),
    em: createCustomTextRenderer(variant),
    p: createCustomTextRenderer(variant),
    img: CustomImageRenderer,
  };
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

const createStyles = ({ spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    paragraph: { marginBottom: spacing[0], marginTop: spacing[3] },
    bold: { fontWeight: fontWeights.semibold },
    image: {
      width: '50%',
      justifyContent: 'flex-start',
    },
    link: {
      textDecorationLine: 'underline',
    },
  });
