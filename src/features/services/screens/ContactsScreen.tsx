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
  const { spacing, palettes } = useTheme();
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);
  const { peopleSearched } = usePreferencesContext();

  console.debug('peopleSearched', peopleSearched);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView>
        <Section>
          <OverviewList
            style={{
              marginHorizontal: 0,
              marginVertical: 0,
              paddingVertical: 10,
              borderRadius: 0,
            }}
          >
            <Row align="center" style={styles.searchBar}>
              <Icon
                icon={faSearch}
                color={palettes.gray['500']}
                style={{ position: 'absolute', left: spacing[4] + spacing[1] }}
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
                  style={{
                    position: 'absolute',
                    right: spacing[3],
                  }}
                />
              )}
            </Row>
          </OverviewList>
        </Section>
        <Section>
          {!search && <RecentSearch />}
          {!!search && enabled && (
            <OverviewList loading={isLoading}>
              {people && people?.length > 0 ? (
                people?.map(person => (
                  <PersonOverviewListItem
                    key={person.id}
                    person={person}
                    searchString={debounceSearch}
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

const createStyles = ({ spacing, palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingTop: spacing[5],
      paddingHorizontal: spacing[5],
    },
    textField: {
      paddingLeft: 20,
    },
    title: {
      fontSize: fontSizes['3xl'],
      marginBottom: spacing[1],
    },
    spacer: {
      height: spacing[56],
    },
    description: {
      marginBottom: spacing[4],
    },
    noResultFound: {
      textAlign: 'center',
      color: palettes.text[100],
    },
    emptyState: {
      backgroundColor: palettes.primary[700],
    },
    searchBar: {
      paddingRight: spacing[2],
    },
    messageInput: {
      borderBottomWidth: 0,
    },
  });
