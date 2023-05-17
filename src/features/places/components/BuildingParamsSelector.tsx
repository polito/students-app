import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import {
  faArrowsUpDown,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { TranslucentButton } from '@lib/ui/components/TranslucentButton';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { MenuView } from '@react-native-menu/menu';

import { useGetSites } from '../../../core/queries/placesHooks';

export const BuildingParamsSelector = () => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { data: sites } = useGetSites();

  return (
    <Row gap={3} style={styles.container}>
      {/* <MenuView*/}
      {/*  actions={*/}
      {/*    sites?.data.map(site => ({*/}
      {/*      title: site.name,*/}
      {/*      subtitle: site.city,*/}
      {/*    })) ?? []*/}
      {/*  }*/}
      {/* >*/}
      {/*  <TranslucentButton gap={2}>*/}
      {/*    <Icon icon={faSchool} />*/}
      {/*    <Text>{t('common.campus')}</Text>*/}
      {/*    <Icon icon={faChevronDown} size={fontSizes.xs} />*/}
      {/*  </TranslucentButton>*/}
      {/* </MenuView>*/}
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
        <TranslucentButton gap={2}>
          <Icon icon={faArrowsUpDown} />
          <Text>{t('common.floor')}</Text>
          <Icon icon={faChevronDown} size={fontSizes.xs} />
        </TranslucentButton>
      </MenuView>
    </Row>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      bottom: 86,
      right: spacing[5],
    },
  });
