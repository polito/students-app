import { StyleSheet } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Icon } from '@lib/ui/components/Icon';
import { PillButton, PillButtonProps } from '@lib/ui/components/PillButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../../../src/core/contexts/PreferencesContext';

export interface PillIconButtonProps extends PillButtonProps {
  icon?: IconDefinition;
}

export const PillIconButton = ({
  children,
  icon,
  ...props
}: PillIconButtonProps) => {
  const styles = useStylesheet(createStyles);
  const { accessibility } = usePreferencesContext();
  return (
    <PillButton
      {...props}
      {...(accessibility?.fontSize && accessibility.fontSize >= 150
        ? { style: { paddingVertical: 0 } }
        : {})}
    >
      <Row align="center" gap={1.5}>
        {icon && <Icon icon={icon} color="white" />}
        <Text
          style={[
            styles.text,
            props.variant === 'neutral'
              ? styles.textNeutral
              : styles.textPrimary,
          ]}
        >
          {children}
        </Text>
      </Row>
    </PillButton>
  );
};

const createStyles = ({ fontWeights }: Theme) =>
  StyleSheet.create({
    text: {
      fontWeight: fontWeights.medium,
    },
    textNeutral: {},
    // eslint-disable-next-line react-native/no-color-literals
    textPrimary: {
      color: 'white',
    },
  });
