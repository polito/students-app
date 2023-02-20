import { useTranslation } from 'react-i18next';
import {
  StyleProp,
  StyleSheet,
  TextProps,
  TextStyle,
  View,
} from 'react-native';

import { Link } from '@react-navigation/native';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';

import { useStylesheet } from '../hooks/useStylesheet';
import { Theme } from '../types/theme';
import { Text } from './Text';

interface Props {
  title: string;
  titleStyle?: StyleProp<TextStyle>;
  ellipsizeTitle?: boolean;
  linkTo?: To<any>;
  trailingItem?: JSX.Element;
  separator?: boolean;
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
  trailingItem,
}: Props) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const ellipsis: Partial<TextProps> = ellipsizeTitle
    ? {
        numberOfLines: 1,
        ellipsizeMode: 'tail',
      }
    : {};

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text
          variant="heading"
          style={[styles.title, titleStyle]}
          accessibilityRole="header"
          {...ellipsis}
        >
          {title}
        </Text>
        {trailingItem
          ? trailingItem
          : linkTo && (
              <Link to={linkTo}>
                <Text variant="link">{t('sectionHeader.cta')}</Text>
              </Link>
            )}
      </View>
    </View>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing[4],
    },
    title: {
      color: colors.heading,
      flex: 1,
      textTransform: 'uppercase',
      marginEnd: spacing[5],
    },
    innerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
