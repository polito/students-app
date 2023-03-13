import { PropsWithChildren } from 'react';
import { StyleSheet } from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faStar } from '@fortawesome/free-regular-svg-icons';
import { faStar as faStarFilled } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import {
  TouchableCard,
  TouchableCardProps,
} from '@lib/ui/components/TouchableCard';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { resolveLinkTo } from '../../../utils/resolveLinkTo';

interface Props extends PropsWithChildren<TouchableCardProps> {
  name: string;
  icon: IconDefinition;
  iconColor?: string;
  favorite?: boolean;
  onFavoriteChange?: (favorite?: boolean) => void;
  linkTo?: To<any>;
}

export const ServiceCard = ({
  name,
  icon,
  iconColor,
  favorite,
  onFavoriteChange,
  disabled,
  linkTo,
  children,
  ...props
}: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const styles = useStylesheet(createStyles);
  const { dark, colors } = useTheme();

  return (
    <TouchableCard
      onPress={
        linkTo ? () => navigation.navigate(resolveLinkTo(linkTo)) : undefined
      }
      {...props}
      disabled={disabled}
      style={[styles.touchable, props.style]}
      cardStyle={[styles.card, props.cardStyle]}
    >
      <Row spaceBetween>
        <Icon
          icon={icon}
          size={28}
          color={iconColor ?? colors.primary[dark ? 400 : 500]}
        />
        <IconButton
          icon={favorite ? faStarFilled : faStar}
          color={favorite ? colors.orange[400] : colors.secondaryText}
          onPress={() => onFavoriteChange(!favorite)}
          style={styles.favButton}
          disabled={disabled}
        />
      </Row>
      <Text variant="title" style={styles.title}>
        {name}
      </Text>
      {children}
    </TouchableCard>
  );
};

ServiceCard.minWidth = 110;
ServiceCard.maxWidth = 184;

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    touchable: {
      flex: 1,
      height: ServiceCard.minWidth,
      minWidth: ServiceCard.minWidth,
      maxWidth: ServiceCard.maxWidth,
    },
    card: {
      flex: 1,
      padding: spacing[3],
      justifyContent: 'space-between',
    },
    title: {
      fontSize: fontSizes.md,
    },
    favButton: {
      padding: spacing[1],
    },
  });
