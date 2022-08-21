import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';
import { useStylesheet } from '../hooks/useStylesheet';
import { useTheme } from '../hooks/useTheme';
import { Theme } from '../types/theme';
import { Separator } from './Separator';
import { Text } from './Text';

interface Props {
  title: string;
  linkTo?: To<any>;
}

/**
 * A section title with an optional link to a related
 * screen
 */
export const SectionHeader = ({ title, linkTo }: Props) => {
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Separator />
      <View style={styles.innerContainer}>
        <Text
          variant="title"
          style={styles.title}
          accessible={true}
          accessibilityRole="header"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {linkTo && (
          <Link to={linkTo}>
            <Text variant="link">{t('See all')}</Text>
          </Link>
        )}
      </View>
    </View>
  );
};

const createStyles = ({ spacing, colors }: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing[5],
    },
    title: {
      color: colors.heading,
      flex: 1,
      marginEnd: spacing[5],
    },
    innerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
  });
