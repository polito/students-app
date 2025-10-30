import {
  StyleProp,
  StyleSheet,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faSquare, faSquareCheck } from '@fortawesome/free-regular-svg-icons';
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
  dimension = 'default',
  icon,
}: {
  text?: string;
  onPress: () => void;
  isChecked: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  checkboxStyle?: StyleProp<ViewStyle>;
  disable?: boolean;
  dimension?: 'default' | 'small';
  icon?: IconDefinition;
}) => {
  const styles = useStylesheet(createStyles);

  return (
    <View style={[styles.container, containerStyle]}>
      <TouchableOpacity
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isChecked, disabled: disable ?? false }}
        accessibilityLabel={text}
        style={[
          styles.checkbox,
          checkboxStyle,
          dimension === 'small' && { height: 20, width: 20 },
        ]}
        disabled={disable ?? false}
        onPress={() => {
          onPress();
        }}
      >
        <View
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          importantForAccessibility="no-hide-descendants"
          accessibilityElementsHidden={true}
        >
          {isChecked ? (
            <Icon
              icon={icon ? icon : faSquareCheck}
              style={styles.checkboxIcon}
              size={dimension === 'small' ? 15 : 20}
            />
          ) : (
            <Icon
              icon={faSquare}
              style={styles.checkboxIcon}
              size={dimension === 'small' ? 15 : 20}
            />
          )}
        </View>
      </TouchableOpacity>
      <Text
        style={[styles.text, textStyle]}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden={true}
      >
        {text}
      </Text>
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
      height: 25,
      width: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxIcon: {
      color: palettes.navy[dark ? '50' : '600'],
    },
    text: {
      fontSize: fontSizes.sm,
      marginHorizontal: spacing[3],
    },
  });
