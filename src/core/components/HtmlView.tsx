import { Dimensions } from 'react-native';
import RenderHTML, { RenderHTMLProps } from 'react-native-render-html';

import { useTheme } from '@lib/ui/hooks/useTheme';

export const HtmlView = (props: RenderHTMLProps) => {
  const { colors, spacing } = useTheme();

  return (
    <RenderHTML
      contentWidth={Dimensions.get('window').width}
      defaultTextProps={{
        selectable: true,
        selectionColor: colors.secondary[600],
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
