import { Platform, StyleSheet } from 'react-native';

import { Row, RowProps } from '@lib/ui/components/Row';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export type HeaderAccessoryProps = RowProps;

export const HeaderAccessory = ({
  children,
  style,
  ...props
}: HeaderAccessoryProps) => {
  const styles = useStylesheet(createStyles);

  // With transparent headers and react-navigation, the navigation system
  // already handles safe area insets properly, so we don't need to add any
  return (
    <Row {...props} style={[styles.container, style]}>
      {children}
    </Row>
  );
};

const createStyles = ({ colors }: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: Platform.select({
        ios: colors.headersBackground,
        android: colors.surface,
      }),
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
      zIndex: 1,
    },
  });
