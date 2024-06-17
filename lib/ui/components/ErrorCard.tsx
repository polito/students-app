import { PropsWithChildren } from 'react';
import { Platform, ViewProps } from 'react-native';

import { Card } from '@lib/ui/components/Card';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

type Props = PropsWithChildren<
  ViewProps & {
    text: string;
  }
>;

export const ErrorCard = ({ text, ...rest }: Props) => {
  const { spacing, fontSizes, colors } = useTheme();
  return (
    <Card
      accessible={Platform.select({ android: true, ios: false })}
      rounded
      // rounded={rounded ?? Platform.select({ android: false })}
      spaced
      translucent={false}
      style={{
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: colors.errorCardBorder,
      }}
      {...rest}
    >
      <Text
        style={{
          padding: spacing[5],
          color: colors.errorCardText,
          fontSize: fontSizes.sm,
        }}
      >
        {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
      </Text>
    </Card>
  );
};
