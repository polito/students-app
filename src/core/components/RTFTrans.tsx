import { ComponentProps, ReactNode } from 'react';
import { Trans } from 'react-i18next';
import { StyleProp, Text, TextStyle } from 'react-native';

export type RTFTransProps = ComponentProps<typeof Trans> & {
  children?: ReactNode;
  style?: StyleProp<TextStyle>;
};

export const RTFTrans = ({ children, style, ...props }: RTFTransProps) => (
  <Text style={style} key="t0">
    <Trans
      {...props}
      components={{
        b: <Text style={{ fontWeight: 'bold' }} key="b" />,
        i: <Text style={{ fontStyle: 'italic' }} key="i" />,
        u: <Text style={{ textDecorationLine: 'underline' }} key="u" />,
        br: <Text key="br">{'\n'}</Text>,
        ...props.components,
      }}
    >
      {children}
    </Trans>
  </Text>
);
