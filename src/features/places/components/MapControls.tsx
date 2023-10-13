import { useTranslation } from 'react-i18next';
import { StyleSheet, TouchableOpacity } from 'react-native';

import {
  faCrosshairs,
  faElevator,
  faExpand,
} from '@fortawesome/free-solid-svg-icons';
import { Divider } from '@lib/ui/components/Divider';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TranslucentCard } from '@lib/ui/components/TranslucentCard';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView } from '@react-native-menu/menu';

export const MapControls = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();

  return (
    <Row gap={3} style={styles.container} justify="space-between">
      <TranslucentCard>
        <IconButton
          icon={faCrosshairs}
          style={styles.icon}
          accessibilityLabel={t('placesScreen.goToMyPosition')}
        />
        <Divider style={styles.divider} size={1} />
        <IconButton
          icon={faExpand}
          style={styles.icon}
          accessibilityLabel={t('placesScreen.viewWholeCampus')}
        />
      </TranslucentCard>

      <MenuView
        actions={[
          {
            title: '-1',
          },
          {
            title: '0',
          },
          {
            title: '1',
          },
        ]}
      >
        <TranslucentCard>
          <TouchableOpacity accessibilityLabel={t('placesScreen.changeFloor')}>
            <Row ph={3} pv={2.5} gap={1} align="center">
              <Icon icon={faElevator} />
              <Text>0</Text>
            </Row>
          </TouchableOpacity>
        </TranslucentCard>
      </MenuView>
    </Row>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 80,
      left: spacing[5],
      right: spacing[5],
    },
    divider: {
      alignSelf: 'stretch',
    },
    icon: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2.5],
    },
  });
