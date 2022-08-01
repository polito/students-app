import { StyleSheet, View } from 'react-native';

const EmptyScreen = () => {
  return (
    <View>
      <View style={styles.sectionsContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionsContainer: {
    display: 'flex',
    paddingVertical: 18,
  },
});

export default EmptyScreen;
