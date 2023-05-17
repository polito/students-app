import { faChevronDown, faSchool } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';

import { useGetSites } from '../../../core/queries/placesHooks';

export const CampusSelector = () => {
  const { colors } = useTheme();
  const { data: sites } = useGetSites();

  return (
    <MenuView
      actions={
        sites?.data.map(site => ({
          title: site.name,
          subtitle: site.city,
        })) ?? []
      }
    >
      <Row align="center" gap={2} mr={2}>
        <Icon icon={faSchool} color={colors.link} />
        <Text variant="link">Centrale</Text>
        <Icon icon={faChevronDown} color={colors.link} />
      </Row>
    </MenuView>
  );
};
