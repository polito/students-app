import { useWindowDimensions } from 'react-native';
import RenderHTML, { RenderHTMLProps } from 'react-native-render-html';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const HtmlView = (props: RenderHTMLProps) => {
  const { colors, palettes, spacing } = useTheme();
  const { width } = useWindowDimensions();

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
        ...(props.baseStyle ?? {}),
      }}
    />
  );
};
