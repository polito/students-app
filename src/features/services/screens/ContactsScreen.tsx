import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet } from 'react-native';

import { faSearch, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { HeaderAccessory } from '@lib/ui/components/HeaderAccessory';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { Row } from '@lib/ui/components/Row';
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
  const { palettes, shapes, spacing, colors } = useTheme();
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);
  const { peopleSearched } = usePreferencesContext();

  return (
    <>
      <HeaderAccessory style={styles.searchBar}>
        <Row align="center" style={{ flex: 1 }}>
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
      </HeaderAccessory>
      {!search && peopleSearched?.length > 0 && <RecentSearch />}
      {!!search && enabled && (
        <LoadingContainer
          loading={isLoading}
          style={{
            flex: 1,
            marginVertical: spacing[2],
            marginHorizontal: Platform.select({ ios: spacing[4] }),
          }}
        >
          <FlatList
            contentInsetAdjustmentBehavior="automatic"
            data={people}
            contentContainerStyle={{ paddingBottom: spacing[8] }}
            ItemSeparatorComponent={() => <IndentedDivider indent={20} />}
            ListEmptyComponent={
              <EmptyState message={t('contactsScreen.emptyState')} />
            }
            renderItem={({ item: person, index }) => {
              const isFirstItem = index === 0;
              const isLastItem = !!people && index === people?.length - 1;
              return (
                <PersonOverviewListItem
                  key={person.id}
                  person={person}
                  searchString={debounceSearch}
                  index={index}
                  totalData={people?.length || 0}
                  containerStyle={{
                    borderTopLeftRadius: isFirstItem ? shapes.lg : 0,
                    borderTopRightRadius: isFirstItem ? shapes.lg : 0,
                    borderBottomLeftRadius: isLastItem ? shapes.lg : 0,
                    borderBottomRightRadius: isLastItem ? shapes.lg : 0,
                  }}
                />
              );
            }}
          />
        </LoadingContainer>
      )}
    </>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    textField: {
      paddingLeft: 20,
    },
    searchBar: {
      paddingRight: spacing[2],
      paddingBottom: spacing[2],
    },
    searchIcon: {
      position: 'absolute',
      left: spacing[5],
    },
    cancelIcon: {
      position: 'absolute',
      right: spacing[2],
    },
  });
