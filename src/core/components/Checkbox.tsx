import { useRef } from 'react';
import {
  Animated,
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

export const Checkbox = ({
  text,
  onPress,
  isChecked,
  containerStyle,
  textStyle,
  checkboxStyle,
  disable,
}: {
  text: string;
  onPress: () => void;
  isChecked: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  checkboxStyle?: StyleProp<ViewStyle>;
  disable?: boolean;
}) => {
  const styles = useStylesheet(createStyles);

  const animatedWidth = useRef(new Animated.Value(0)).current;

  const startAnimation = () => {
    const toValue = isChecked ? 30 : 0;
    Animated.timing(animatedWidth, {
      toValue: toValue,
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        style={[
          styles.checkbox,
          checkboxStyle,
          isChecked && styles.checkboxSelected,
        ]}
        disabled={disable ?? false}
        onPress={() => {
          startAnimation();
          onPress();
        }}
      >
        <Animated.View
          style={{
            width: animatedWidth,
            height: 30,
            display: isChecked ? 'flex' : 'none',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Icon icon={faCheck} color="white" size={20} />
        </Animated.View>
      </TouchableOpacity>
      <Text style={[styles.text, textStyle]}>{text}</Text>
    </View>
  );
};

const createStyles = ({ palettes, spacing, fontSizes, dark }: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing[3],
      marginHorizontal: spacing[5],
    },
    checkbox: {
      borderColor: palettes.navy[dark ? '50' : '600'],
      borderWidth: 1,
      borderRadius: 5,
      height: 25,
      width: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxSelected: {
      backgroundColor: palettes.navy[dark ? '50' : '600'],
    },
    text: {
      fontSize: fontSizes.sm,
      marginHorizontal: spacing[3],
    },
  });
