import { useTranslation } from 'react-i18next';

import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { PersonOverviewListItem } from './PersonOverviewListItem';

export const RecentSearch = () => {
  const { peopleSearched, updatePreference } = usePreferencesContext();
  const { spacing, palettes } = useTheme();
  const { t } = useTranslation();

  const clearRecentSearch = () => {
    updatePreference('peopleSearched', []);
  };

  return (
    <Section>
      <Row
        align="center"
        justify="space-between"
        style={{
          marginHorizontal: spacing[4],
        }}
      >
        <Text style={{ color: palettes.info[700] }} variant="heading">
          {t('contactsScreen.recentSearches')}
        </Text>
        <IconButton
          onPress={clearRecentSearch}
          style={{ padding: 0 }}
          icon={faTimes}
          color={palettes.info[700]}
        />
      </Row>
      <OverviewList>
        {peopleSearched.map(person => (
          <PersonOverviewListItem key={person.id} person={person} />
        ))}
      </OverviewList>
    </Section>
  );
};
