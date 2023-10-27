import { StyleSheet, useWindowDimensions } from 'react-native';
import RenderHTML, { RenderHTMLProps } from 'react-native-render-html';

import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

export const HtmlView = (props: RenderHTMLProps) => {
  const { colors, palettes, spacing, fontSizes } = useTheme();
  const { width } = useWindowDimensions();
  const styles = useStylesheet(createStyles);

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
      }}
      tagsStyles={{
        p: styles.paragraph,
        b: styles.bold,
      }}
      ignoredStyles={[
        'fontFamily',
        'color',
        'backgroundColor',
        'width',
        'height',
      ]}
    />
  );
};

const createStyles = ({ spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    paragraph: { marginBottom: spacing[0], marginTop: spacing[3] },
    bold: { fontWeight: fontWeights.semibold },
  });
