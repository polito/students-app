import { StyleSheet } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Col } from '@lib/ui/components/Col';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

interface Props {
  icon?: IconDefinition;
  iconColor?: string;
  iconSize?: number;
  message: string;
  caption?: string;
  spacing?: number;
}

export const EmptyState = ({
  icon,
  iconColor,
  message,
  caption,
  spacing = 12,
  iconSize,
}: Props) => {
  const { colors, fontSizes, spacing: _spacing } = useTheme();
  const styles = useStylesheet(createStyles);

  return (
    <Col
      accessibilityRole="text"
      accessible={true}
      accessibilityLabel={message}
      align="center"
      style={{
        padding: _spacing[spacing as unknown as keyof Theme['spacing']],
      }}
    >
      {icon && (
        <Icon
          icon={icon}
          color={iconColor ?? colors.secondaryText}
          size={iconSize || fontSizes['3xl']}
          style={styles.icon}
        />
      )}
      <Text style={{ textAlign: 'center' }} variant="secondaryText">
        {message}
      </Text>
      {caption && (
        <Text
          style={{ textAlign: 'center', fontSize: fontSizes.xs }}
          variant="secondaryText"
        >
          {caption}
        </Text>
      )}
    </Col>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    icon: {
      marginBottom: spacing[4],
    },
  });
