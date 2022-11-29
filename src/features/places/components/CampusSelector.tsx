import { Platform, StyleSheet, View } from 'react-native';

import { faCaretDown, faSchool } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

import { TranslucentView } from '../../../core/components/TranslucentView';

interface Props {
  campusId?: number;
}

export const CampusSelector = ({ campusId }: Props) => {
  const styles = useStylesheet(createStyles);
  return (
    <MenuView
      style={styles.touchable}
      actions={[
        {
          title: 'Sede centrale',
          subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino, Italia',
        },
        {
          title: 'Mirafiori',
          subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino, Italia',
        },
        {
          title: 'Castello del Valentino',
          subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino, Italia',
        },
        {
          title: 'Verrès',
          subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino, Italia',
        },
        {
          title: 'Mondovì',
          subtitle: 'Corso Duca degli Abruzzi, 24, 10129, Torino, Italia',
        },
      ]}
    >
      <View style={styles.container}>
        <TranslucentView style={styles.background} />
        <Icon icon={faSchool} />
        <Text style={styles.text}>Campus</Text>
        <Icon icon={faCaretDown} />
      </View>
    </MenuView>
  );
};

const createStyles = ({ spacing, shapes }: Theme) =>
  StyleSheet.create({
    touchable: {
      position: 'absolute',
      bottom: spacing[5],
      right: spacing[5],
    },
    container: {
      flexDirection: 'row',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    background: {
      borderRadius: Platform.select({ android: 60, ios: shapes.lg }),
      overflow: 'hidden',
    },
    text: {
      marginHorizontal: spacing[2],
    },
  });
