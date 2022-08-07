import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { To } from '@react-navigation/native/lib/typescript/src/useLinkTo';
import { useTheme } from '../hooks/useTheme';
import { Separator } from './Separator';

interface Props {
  title: string;
  linkTo: To;
}

export const SectionHeader = ({ title, linkTo }: Props) => {
  const { colors } = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Separator />
      <View style={styles.innerContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.headings,
            },
          ]}
        >
          {title}
        </Text>
        <Link
          to={linkTo}
          style={{
            color: colors.links,
          }}
        >
          {t('See all')}
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 18,
  },
  innerContainer: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
