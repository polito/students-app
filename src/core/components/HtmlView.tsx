import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import RenderHTML, {
  HTMLContentModel,
  HTMLElementModel,
  InternalRendererProps,
  RenderHTMLProps,
  TNodeChildrenRenderer,
  useInternalRenderer,
} from 'react-native-render-html';
import Video from 'react-native-video';
import { WebView } from 'react-native-webview';

import { ActivityIndicator } from '@lib/ui/components/ActivityIndicator';
import { ImageLoader } from '@lib/ui/components/ImageLoader';
import { Text, calculateValueOfPercentage } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import TableRenderer, { tableModel } from '@native-html/table-plugin';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { render as domToHtml } from 'dom-serializer';
import { ChildNode, Document, Element, hasChildren } from 'domhandler';
import { Text as domText } from 'domhandler';
import { replaceElement } from 'domutils';
import { parseDocument } from 'htmlparser2';

import { usePreferencesContext } from '../contexts/PreferencesContext';

const createCustomImageRenderer = (variant: string) => {
  return (props: InternalRendererProps<any>) => {
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const { rendererProps } = useInternalRenderer('img', props);
    const uri = rendererProps.source.uri ?? '';
    const [naturalSize, setNaturalSize] = useState<{
      width: number;
      height: number;
    }>();
    const { spacing } = useTheme();
    const { width: screenWidth } = useWindowDimensions();
    const onImageLoad = useCallback((e: any) => {
      const { width: w, height: h } = e.nativeEvent ?? {};
      if (w && h) {
        setNaturalSize({ width: w, height: h });
      }
    }, []);

    const onPress = () => {
      if (naturalSize) {
        navigation.navigate('ImageScreen', { ...naturalSize, uri });
      }
    };

    if (variant === 'onboarding') {
      const tnodeStyle = props.tnode.styles?.nativeBlockRet ?? {};
      const contentWidth = screenWidth - spacing[5] * 2;
      const rawWidth = tnodeStyle.width;
      const resolvedWidth =
        typeof rawWidth === 'string' && rawWidth.endsWith('%')
          ? (parseFloat(rawWidth) / 100) * contentWidth
          : typeof rawWidth === 'number'
            ? rawWidth
            : contentWidth;
      const naturalAspectRatio =
        naturalSize && naturalSize.height > 0
          ? naturalSize.width / naturalSize.height
          : undefined;
      const resolvedHeight =
        typeof tnodeStyle.height === 'number'
          ? tnodeStyle.height
          : naturalAspectRatio
            ? resolvedWidth / naturalAspectRatio
            : undefined;
      const imgStyle = {
        ...tnodeStyle,
        width: resolvedWidth,
        ...(resolvedHeight != null && { height: resolvedHeight }),
      };

      return (
        <ImageLoader
          source={{ uri }}
          onLoad={onImageLoad}
          imageStyle={imgStyle}
          containerStyle={{
            ...imgStyle,
            alignSelf: 'center',
            marginVertical: spacing[3],
          }}
          resizeMode="contain"
        />
      );
    }

    return (
      <ImageLoader
        source={{ uri }}
        onLoad={onImageLoad}
        imageStyle={{ height: 200 }}
        containerStyle={{ height: 200 }}
        resizeMode="cover"
        onTouchStart={onPress}
      />
    );
  };
};

const customHTMLElementModels = {
  video: HTMLElementModel.fromCustomModel({
    tagName: 'video',
    contentModel: HTMLContentModel.block,
    isVoid: true,
  }),
  table: tableModel,
};

const createCustomVideoRenderer = (variant: string) => {
  return (props: InternalRendererProps<any>) => {
    const { width: screenWidth } = useWindowDimensions();
    const uri = props.tnode.attributes.src ?? '';
    const [isLoading, setIsLoading] = useState(true);
    const [aspectRatio, setAspectRatio] = useState<number>();
    const { spacing } = useTheme();
    const onBuffer = useCallback(
      ({ isBuffering }: { isBuffering: boolean }) => {
        setIsLoading(isBuffering);
      },
      [],
    );

    const onLoad = useCallback((data: any) => {
      setIsLoading(false);
      const { width: w, height: h } = data.naturalSize ?? {};
      if (w && h) {
        setAspectRatio(w / h);
      }
    }, []);

    if (variant === 'onboarding') {
      const tnodeStyle = props.tnode.styles?.nativeBlockRet ?? {};
      const contentWidth = screenWidth - spacing[5] * 2;
      const rawWidth = tnodeStyle.width;
      const resolvedWidth =
        typeof rawWidth === 'string' && rawWidth.endsWith('%')
          ? (parseFloat(rawWidth) / 100) * contentWidth
          : typeof rawWidth === 'number'
            ? rawWidth
            : contentWidth;
      const resolvedHeight =
        typeof tnodeStyle.height === 'number'
          ? tnodeStyle.height
          : resolvedWidth / (aspectRatio ?? 16 / 9);
      const videoStyle = {
        ...tnodeStyle,
        width: resolvedWidth,
        height: resolvedHeight,
      };

      return (
        <View style={{ alignSelf: 'center', padding: spacing[3] }}>
          <Video
            source={{ uri }}
            controls={false}
            muted={true}
            resizeMode="contain"
            paused={false}
            repeat={true}
            onBuffer={onBuffer}
            onLoad={onLoad}
            style={videoStyle}
          />
          {isLoading && (
            <ActivityIndicator
              style={{
                position: 'absolute',
                alignSelf: 'center',
                top: '45%',
              }}
            />
          )}
        </View>
      );
    }

    return (
      <Video
        source={{ uri }}
        controls={false}
        resizeMode="contain"
        paused={false}
        style={{
          width: '100%',
          minHeight: (screenWidth / 16) * 9,
        }}
      />
    );
  };
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
      <Text
        selectable={variant !== 'onboarding'}
        style={[props.style, dynamicStyle]}
      >
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

  const renderers = useMemo(
    () => ({
      text: createCustomTextRenderer(variant),
      span: createCustomTextRenderer(variant),
      b: createCustomTextRenderer(variant),
      strong: createCustomTextRenderer(variant),
      i: createCustomTextRenderer(variant),
      em: createCustomTextRenderer(variant),
      p: createCustomTextRenderer(variant),
      img: createCustomImageRenderer(variant),
      video: createCustomVideoRenderer(variant),
      table: TableRenderer,
    }),
    [variant],
  );

  return (
    <RenderHTML
      contentWidth={width}
      defaultTextProps={{
        selectable: variant !== 'onboarding',
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
        h1: styles.h1,
        h2: styles.h2,
        h3: styles.h3,
        h4: styles.h4,
        h5: styles.h5,
        h6: styles.h6,
      }}
      ignoredStyles={
        variant === 'onboarding'
          ? ['fontFamily', 'color', 'backgroundColor']
          : ['fontFamily', 'color', 'backgroundColor', 'width', 'height']
      }
      enableExperimentalBRCollapsing
      enableExperimentalGhostLinesPrevention
      enableCSSInlineProcessing
      WebView={WebView}
      renderers={renderers}
      customHTMLElementModels={customHTMLElementModels}
    />
  );
};

const createStyles = ({ spacing, fontWeights, fontSizes }: Theme) =>
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
    h1: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.bold,
      marginTop: spacing[4],
      marginBottom: spacing[2],
    },
    h2: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.bold,
      marginTop: spacing[4],
      marginBottom: spacing[2],
    },
    h3: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[3],
      marginBottom: spacing[1],
    },
    h4: {
      fontSize: fontSizes.md,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[3],
      marginBottom: spacing[1],
    },
    h5: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[2],
      marginBottom: spacing[1],
    },
    h6: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.semibold,
      marginTop: spacing[2],
      marginBottom: spacing[1],
    },
  });
