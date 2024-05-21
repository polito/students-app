import { useTranslation } from 'react-i18next';
import {
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from 'react-native';

import { Props as FAProps } from '@fortawesome/react-native-fontawesome';
import { IconButton } from '@lib/ui/components/IconButton';
import { Separator } from '@lib/ui/components/Separator';
import { Link, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { useStylesheet } from '../hooks/useStylesheet';
import { Theme } from '../types/Theme';
import { Text } from './Text';

interface Props {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  subtitle?: string;
  subtitleStyle?: StyleProp<TextStyle>;
  ellipsizeTitle?: boolean;
  linkToMoreCount?: number;
  separator?: boolean;
  accessible?: boolean;
  accessibilityLabel?: string | undefined;
  linkTo?: To<any>;
  trailingItem?: JSX.Element;
  trailingIcon?: Pick<FAProps, 'size' | 'icon' | 'color'> &
    TouchableOpacityProps & {
      iconStyle?: FAProps['style'];
    };
}

/**
 * A section title with an optional link to a related screen
 */
export const SectionHeader = ({
  title,
  titleStyle,
  subtitle,
  subtitleStyle,
  ellipsizeTitle = true,
  accessibilityLabel = undefined,
  linkTo,
  accessible = true,
  linkToMoreCount,
  separator = true,
  trailingItem,
  trailingIcon,
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const ellipsis: Partial<TextProps> = ellipsizeTitle
    ? {
        numberOfLines: 1,
        ellipsizeMode: 'tail',
      }
    : {};

  const Header = () => {
    return (
      <View style={{ ...styles.innerContainer }}>
        <View style={styles.titleContainer}>
          {separator && <Separator />}

          <View style={{ ...styles.innerTitleContainer }}>
            <Text
              accessible={false}
              variant="heading"
              style={[styles.title, titleStyle, styles.titleContainer]}
              accessibilityRole="header"
              {...ellipsis}
            >
              {title}
            </Text>
            {trailingIcon && (
              <IconButton {...{ size: 16, ...trailingIcon, noPadding: true }} />
            )}
          </View>

          {subtitle && (
            <Text
              accessible={false}
              variant="secondaryText"
              style={subtitleStyle}
              accessibilityRole="header"
              {...ellipsis}
            >
              {subtitle}
            </Text>
          )}
        </View>
        {trailingItem && trailingItem}

        {linkTo && (
          <Link to={linkTo} accessible={true} accessibilityRole="button">
            <Text variant="link">
              {t('sectionHeader.cta')}
              {(linkToMoreCount ?? 0) > 0 &&
                ' ' +
                  t('sectionHeader.ctaMoreSuffix', {
                    count: linkToMoreCount,
                  })}
            </Text>
          </Link>
        )}
      </View>
    );
  };

  if (!linkTo) {
    return (
      <View
        style={styles.container}
        accessible={accessible}
        accessibilityRole={linkTo ? 'button' : 'header'}
        accessibilityLabel={accessibilityLabel}
      >
        <Header />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      accessible={accessible}
      accessibilityRole={linkTo ? 'button' : 'header'}
      accessibilityLabel={accessibilityLabel}
      onPress={() => {
        linkTo &&
          navigation.navigate({
            name: typeof linkTo === 'string' ? linkTo : linkTo.screen,
            params:
              typeof linkTo === 'object' && 'params' in linkTo
                ? linkTo.params
                : undefined,
          });
      }}
    >
      <Header />
    </TouchableOpacity>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing[4],
    },
    innerContainer: {
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    title: {
      color: colors.heading,
      marginEnd: spacing[5],
    },
    titleContainer: {
      flex: 1,
    },
    innerTitleContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      padding: 0,
      margin: 0,
    },
  });
