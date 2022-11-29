import { Platform, StyleSheet, View } from 'react-native';

import { faCaretDown, faSchool } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { MenuView } from '@react-native-menu/menu';

import { TranslucentView } from '../../../core/components/TranslucentView';
import { useGetSites } from '../../../core/queries/placesHooks';

export const CampusSelector = () => {
  const styles = useStylesheet(createStyles);
  const { data: sites } = useGetSites();

  return (
    <MenuView
      style={styles.touchable}
      actions={
        sites?.data.map(site => ({
          title: site.name,
          subtitle: site.city,
        })) ?? []
      }
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
