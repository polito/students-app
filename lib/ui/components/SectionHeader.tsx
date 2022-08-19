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
  linkTo?: To;
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
          style={{
            color: colors.heading,
          }}
          accessible={true}
          accessibilityRole="header"
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

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      width: '100%',
      paddingHorizontal: spacing[5],
    },
    innerContainer: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
  });
