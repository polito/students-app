import { StyleSheet, Text, TextProps, View } from 'react-native';

export const VisuallyHidden = ({ children, ...props }: TextProps) => {
  return (
    <View style={styles.container} {...props}>
      <Text>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: 0,
    height: 0,
    zIndex: -10000,
    overflow: 'hidden',
    opacity: 1,
    pointerEvents: 'none',
  },
});
