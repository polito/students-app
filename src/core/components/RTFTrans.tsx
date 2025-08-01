import { Trans } from 'react-i18next';
import { StyleProp, Text, TextStyle } from 'react-native';

export type RTFTransProps = React.ComponentProps<typeof Trans> & {
  children?: React.ReactNode;
  style?: StyleProp<TextStyle>;
};

export const RTFTrans = ({ children, style, ...props }: RTFTransProps) => {
  return (
    <Text style={style}>
      <Trans
        {...props}
        components={{
          b: <Text style={{ fontWeight: 'bold' }} />,
          i: <Text style={{ fontStyle: 'italic' }} />,
          u: <Text style={{ textDecorationLine: 'underline' }} />,
          br: <Text>{'\n'}</Text>,
          ...props.components,
        }}
      >
        {children}
      </Trans>
    </Text>
  );
};
