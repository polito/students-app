import { PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, StyleSheet } from 'react-native';

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
import { UnreadBadge } from '@lib/ui/components/UnreadBadge';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { usePreferencesContext } from '../../../../src/core/contexts/PreferencesContext';
import { uniformInsets } from '../../../utils/insets';
import { To } from '../../../utils/resolveLinkTo';
import { resolveLinkTo } from '../../../utils/resolveLinkTo';

interface Props extends PropsWithChildren<TouchableCardProps> {
  name: string;
  icon: IconDefinition;
  iconColor?: string;
  favorite?: boolean;
  onFavoriteChange: (favorite: boolean) => void;
  linkTo?: To<any>;
  onPress?: () => void;
  unReadCount?: number | string;
  accessibilityLabel?: string;
}

export const ServiceCard = ({
  name,
  icon,
  iconColor,
  favorite,
  onFavoriteChange,
  disabled,
  linkTo,
  onPress,
  children,
  unReadCount = 0,
  accessibilityLabel = '',
  ...props
}: Props) => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { dark, colors, palettes } = useTheme();
  const { t } = useTranslation();
  const { accessibility } = usePreferencesContext();

  const [minWidth, setMinWidth] = useState(0);
  const [maxWidth, setMaxWidth] = useState(0);

  const styles = useStylesheet(theme =>
    createStyles(theme, minWidth, maxWidth),
  );
  useEffect(() => {
    if (Number(accessibility?.fontSize) !== 100) {
      setMinWidth(Dimensions.get('window').width - 32);
      setMaxWidth(Dimensions.get('window').width - 32);
    } else {
      setMinWidth(110);
      setMaxWidth(110);
    }
  }, [accessibility?.fontSize]);
  return (
    <TouchableCard
      accessibilityRole="button"
      onPress={
        linkTo
          ? () => {
              const resolved = resolveLinkTo(linkTo);
              navigation.navigate(resolved.name as any, resolved.params);
            }
          : onPress
      }
      {...props}
      disabled={disabled}
      style={[styles.touchable, props.style]}
      cardStyle={[styles.card, props.cardStyle]}
      accessibilityLabel={accessibilityLabel}
    >
      <Row accessibilityRole="button" justify="space-between" align="center">
        <Icon
          icon={icon}
          size={28}
          color={iconColor ?? palettes.primary[dark ? 400 : 500]}
        />
        <IconButton
          accessibilityLabel={
            favorite
              ? t('servicesScreen.favoriteActive')
              : t('servicesScreen.favoriteInactive')
          }
          icon={favorite ? faStarFilled : faStar}
          color={favorite ? palettes.orange[400] : colors.secondaryText}
          onPress={() => onFavoriteChange(!favorite)}
          style={styles.favButton}
          disabled={disabled}
          hitSlop={uniformInsets(16)}
        />
      </Row>
      <Row justify="space-between" align="baseline">
        <Text variant="title" style={styles.title}>
          {name}
        </Text>
        {typeof unReadCount === 'number' && unReadCount > 0 && !disabled && (
          <UnreadBadge text={unReadCount} />
        )}
        {typeof unReadCount === 'string' && !disabled && (
          <UnreadBadge text={unReadCount} isNumeric={true} />
        )}
      </Row>
      {children}
    </TouchableCard>
  );
};

ServiceCard.minWidth = 110;
ServiceCard.maxWidth = 384;

const createStyles = (
  { spacing, fontSizes }: Theme,
  minWidth: number,
  maxWidth: number,
) =>
  StyleSheet.create({
    touchable: {
      flex: 1,
      height: ServiceCard.minWidth,
      minWidth,
      maxWidth,
    },
    card: {
      flex: 1,
      padding: spacing[3],
      justifyContent: 'space-between',
      overflow: 'visible',
    },
    title: {
      fontSize: fontSizes.md,
      flexShrink: 1,
    },
    favButton: {
      padding: spacing[2],
    },
  });
