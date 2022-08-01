import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { Link } from '@react-navigation/native';
import { colors } from '../constants/colors';
import { Separator } from './Separator';

interface Props {
  title: string;
  linkTo: any;
}

export const SectionHeader = ({ title, linkTo }: Props) => {
  const colorScheme = useColorScheme();

  return (
    <View style={styles.container}>
      <Separator />
      <View style={styles.innerContainer}>
        <Text
          style={[
            styles.title,
            colorScheme === 'dark' ? styles.titleDark : null,
          ]}
        >
          {title}
        </Text>
        <Link
          to={linkTo}
          style={[styles.link, colorScheme === 'dark' ? styles.linkDark : null]}
        >
          Vedi tutto
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
    color: colors.primary700,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  titleDark: {
    color: colors.text50,
  },
  link: {
    color: colors.primary500,
  },
  linkDark: {
    color: colors.primary400,
  },
});
