import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useDebounceValue } from '../../../core/hooks/useDebounceValue';
import { useGetPeople } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { PersonOverviewListItem } from '../components/PersonOverviewListItem';
import { RecentSearch } from '../components/RecentSearch';

export const ContactsScreen = () => {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);
  const styles = useStylesheet(createStyles);
  const { palettes } = useTheme();
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);
  const { peopleSearched } = usePreferencesContext();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Section>
          <OverviewList style={styles.searchBarContainer}>
            <Row align="center" style={styles.searchBar}>
              <Icon
                icon={faSearch}
                color={palettes.gray['500']}
                style={styles.searchIcon}
              />
              <TranslucentTextField
                value={search}
                onChangeText={setSearch}
                style={[GlobalStyles.grow, styles.textField]}
                label={t('contactsScreen.search')}
              />
              {!!search && (
                <IconButton
                  onPress={() => setSearch('')}
                  icon={faTimesCircle}
                  color={palettes.gray['500']}
                  accessibilityRole="button"
                  accessibilityLabel={t('contactsScreen.clearSearch')}
                  style={styles.cancelIcon}
                />
              )}
            </Row>
          </OverviewList>
        </Section>
        <Section>
          {!search && peopleSearched?.length > 0 && <RecentSearch />}
          {!!search && enabled && (
            <OverviewList loading={isLoading}>
              {people && people?.length > 0 ? (
                people?.map((person, index) => (
                  <PersonOverviewListItem
                    key={person.id}
                    person={person}
                    searchString={debounceSearch}
                    index={index}
                    totalData={people?.length || 0}
                  />
                ))
              ) : (
                <EmptyState message={t('contactsScreen.emptyState')} />
              )}
            </OverviewList>
          )}
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    textField: {
      paddingLeft: 20,
    },
    searchBar: {
      paddingRight: spacing[2],
    },
    searchBarContainer: {
      margin: 0,
      paddingVertical: 10,
      borderRadius: 0,
    },
    searchIcon: {
      position: 'absolute',
      left: spacing[5],
    },
    cancelIcon: {
      position: 'absolute',
      right: spacing[3],
    },
  });
