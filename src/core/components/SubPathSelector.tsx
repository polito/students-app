import { StyleSheet, View } from 'react-native';

import { Row, RowProps } from '@lib/ui/components/Row';
import { IconButton } from '@lib/ui/components/IconButton';
import {
  faChevronDown,
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Text } from '@lib/ui/components/Text';

export const SubPathSelector = ({ children, ...props }: RowProps) => {
    const styles = useStylesheet(createStyles);

    const { colors, palettes, spacing } = useTheme();

    return (
        <View style={[styles.subPathSelector, {backgroundColor: colors.background}]}>
                <IconButton
                  icon={faChevronDown}
                  size={spacing[6]}
                  style={styles.icon}
                  onPress={() =>console.log("Segmento prima")}
                />
                  <View>
                    <Text style={[styles.floorIndicator, { color: palettes.text[900] }]}>
                      Primo piano
                    </Text>
                    <Text style={[styles.instruction, { color: palettes.text[500] }]}>
                      prosegui al piano terra
                    </Text>
                  </View>
                <IconButton
                  icon={faChevronUp}
                  size={spacing[6]}
                  style={styles.icon}
                  onPress={() =>console.log("Segmento dopo")}
                />
        </View>
      );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    subPathSelector: {
      display: 'flex',
      flexDirection: 'row',
      paddingEnd: 18,
      paddingStart: 18,
      paddingTop: 18,
      paddingBottom: 16,
      justifyContent: 'space-between',
      alignItems: 'center',
      alignSelf: 'stretch',
      borderRadius: 12,
      height: 86,
    },
    container: {
      width: '100%',
      borderRadius: spacing[2],
      overflow: 'hidden',
      elevation: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
    },
    floorIndicator: {
      textAlign: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 600,
    },
    instruction: {
      alignSelf: 'stretch',
      textAlign: 'center',
      fontFamily: 'Montserrat',
      fontSize: 16,
      fontStyle: 'normal',
      fontWeight: 400,
    },
    icon: {
      display: 'flex',
      padding: 18,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 6,
      backgroundColor: '#ffffff',
    },
  });
