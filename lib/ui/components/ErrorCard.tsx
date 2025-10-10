import { PropsWithChildren, ReactElement } from 'react';
import { Platform, TextStyle, ViewProps, ViewStyle } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = PropsWithChildren<
  ViewProps & {
    text?: string;
    style?: ViewStyle;
    testStyle?: TextStyle;
    children?: ReactElement;
    spaced?: boolean;
  }
>;

export const ErrorCard = ({
  text,
  style,
  testStyle,
  children,
  spaced = true,
  ...rest
}: Props) => {
  // TODO aggiungere possibilità di utilizzo tramite enum che inidichi il tipo, fatto il fix con inserimento card nei modal della ESC da valutare se inserire qua tutto

  const { spacing, fontSizes, colors } = useTheme();
  return (
    <Card
      accessible={Platform.select({ android: true, ios: false })}
      accessibilityRole="alert"
      accessibilityLabel={text}
      rounded
      spaced={spaced}
      // rounded={rounded ?? Platform.select({ android: false })}
      translucent={false}
      style={[
        {
          borderStyle: 'solid',
          borderWidth: 1,
          borderColor: colors.errorCardBorder,
        },
        style,
      ]}
      {...rest}
    >
      {!children ? (
        <Text
          style={[
            {
              padding: spacing[5],
              color: colors.errorCardText,
              fontSize: fontSizes.sm,
            },
            testStyle,
          ]}
        >
          {text && text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
        </Text>
      ) : (
        children
      )}
    </Card>
  );
};