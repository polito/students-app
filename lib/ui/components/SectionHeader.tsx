import { useTranslation } from 'react-i18next';
import {
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import { Separator } from '@lib/ui/components/Separator';
import { Link, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { parseText } from '../../../src/utils/html-parse';
import { useStylesheet } from '../hooks/useStylesheet';
import { Theme } from '../types/theme';
import { Text } from './Text';

interface Props {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  ellipsizeTitle?: boolean;
  linkTo?: To<any>;
  linkToMoreCount?: number;
  trailingItem?: JSX.Element;
  separator?: boolean;
  accessible?: boolean;
}

/**
 * A section title with an optional link to a related
 * screen
 */
export const SectionHeader = ({
  title,
  titleStyle,
  ellipsizeTitle = true,
  linkTo,
  accessible = true,
  linkToMoreCount,
  separator = true,
  trailingItem,
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

  return (
    <TouchableOpacity
      style={styles.container}
      accessible={accessible}
      accessibilityRole={linkTo ? 'button' : undefined}
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
      <View style={styles.innerContainer}>
        <View style={styles.titleContainer}>
          {separator && <Separator />}
          <Text
            variant="heading"
            style={[styles.title, titleStyle]}
            accessibilityRole="header"
            {...ellipsis}
          >
            {parseText(title)}
          </Text>
        </View>
        {trailingItem
          ? trailingItem
          : linkTo && (
              <Link
                to={linkTo}
                accessible={true}
                accessibilityRole={'button'}
              >
                <Text variant="link">
                  {t('sectionHeader.cta')}
                  {linkToMoreCount > 0 &&
                    ' ' +
                      t('sectionHeader.ctaMoreSuffix', {
                        count: linkToMoreCount,
                      })}
                </Text>
              </Link>
            )}
      </View>
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
  });
