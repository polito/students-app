import { StyleSheet, View } from 'react-native';
import colors from '../constants/colors';

const Separator = () => <View style={styles.separator} />;

export default Separator;

const styles = StyleSheet.create({
  separator: {
    width: 32,
    height: 4,
    marginBottom: 8,
    backgroundColor: colors.secondary600,
  },
});
