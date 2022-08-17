import { StyleSheet, View } from 'react-native';

export const EmptyScreen = () => {
  return (
    <View>
      <View style={styles.sectionsContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionsContainer: {
    paddingVertical: 18,
  },
});
