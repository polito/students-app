import { PropsWithChildren } from 'react';
import { Platform, ViewProps } from 'react-native';

import { Col } from '@lib/ui/components/Col';

export const Section = ({
  style,
  children,
  ...rest
}: PropsWithChildren<ViewProps>) => {
  return (
    <Col
      mb={5}
      style={style}
      accessible={Platform.select({
        android: true,
        ios: false,
      })}
      {...rest}
    >
      {children}
    </Col>
  );
};
