import { useTranslation } from 'react-i18next';

import { faChevronDown, faSchool } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { MenuView } from '@react-native-menu/menu';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useGetSite, useGetSites } from '../../../core/queries/placesHooks';

export const CampusSelector = () => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const { data: sites } = useGetSites();
  const { campusId, updatePreference } = usePreferencesContext();
  const campus = useGetSite(campusId);

  return (
    <MenuView
      title={t('common.campus')}
      onPressAction={({ nativeEvent: { event: newCampusId } }) => {
        updatePreference(
          'campusId',
          sites?.data?.find(s => s.id === newCampusId)?.id,
        );
      }}
      actions={
        sites?.data?.map(site => ({
          id: site.id,
          title: site.name,
          state: campusId === site.id ? 'on' : undefined,
        })) ?? []
      }
    >
      <Row align="center" gap={1.5} mr={2} style={{ maxWidth: '70%' }}>
        <Icon icon={faSchool} color={colors.link} />
        <Text
          variant="link"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ flexGrow: 1, flexShrink: 1 }}
        >
          {campus?.name ?? t('common.campus')}
        </Text>
        <Icon icon={faChevronDown} color={colors.link} size={fontSizes.xs} />
      </Row>
    </MenuView>
  );
};
