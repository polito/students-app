import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';

import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
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
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetPeople } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { PersonOverviewListItem } from '../components/PersonOverviewListItem';
import { RecentSearch } from '../components/RecentSearch';

export const ContactsScreen = () => {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);
  const styles = useStylesheet(createStyles);
  const { palettes, spacing } = useTheme();
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);
  const { peopleSearched, colorScheme } = usePreferencesContext();

  const infoColor =
    colorScheme === 'light' ? palettes.gray['500'] : palettes.gray['400'];

  const isInputDisabled = useOfflineDisabled();

  return (
    <>
      <HeaderAccessory style={styles.searchBar}>
        <Row align="center" style={{ flex: 1 }}>
          <Icon icon={faSearch} color={infoColor} style={styles.searchIcon} />
          <TranslucentTextField
            value={search}
            onChangeText={setSearch}
            style={[GlobalStyles.grow, styles.textField]}
            label={t('contactsScreen.search')}
            editable={!isInputDisabled}
          />
          {!!search && (
            <IconButton
              onPress={() => setSearch('')}
              icon={faTimesCircle}
              color={infoColor}
              accessibilityRole="button"
              accessibilityLabel={t('contactsScreen.clearSearch')}
              style={styles.cancelIcon}
            />
          )}
        </Row>
      </HeaderAccessory>
      {!search && peopleSearched?.length > 0 && <RecentSearch />}
      {!!search && enabled && (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ paddingBottom: spacing[4] }}
        >
          <SafeAreaView>
            <Section>
              <OverviewList
                loading={isLoading}
                style={{ marginTop: spacing[4] }}
              >
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
            </Section>
          </SafeAreaView>
        </ScrollView>
      )}
    </>
  );
};

const createStyles = ({ spacing, shapes }: Theme) =>
  StyleSheet.create({
    textField: {
      paddingLeft: spacing[4],
      borderRadius: shapes.lg,
      marginLeft: spacing[3],
    },
    searchBar: {
      paddingRight: spacing[2],
      paddingBottom: spacing[2],
      paddingTop: spacing[2],
    },
    searchIcon: {
      position: 'absolute',
      left: spacing[6],
    },
    cancelIcon: {
      position: 'absolute',
      right: spacing[2],
    },
  });
