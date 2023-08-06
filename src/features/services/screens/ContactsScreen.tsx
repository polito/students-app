import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { SearchBarCommands } from 'react-native-screens';

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
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useDebounceValue } from '../../../core/hooks/useDebounceValue';
import { useGetPeople } from '../../../core/queries/peopleHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { PersonOverviewListItem } from '../components/PersonOverviewListItem';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Contacts'>;

export const ContactsScreen = ({ navigation }: Props) => {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);
  const { spacing, palettes } = useTheme();
  const searchBarRef = useRef<SearchBarCommands>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const styles = useStylesheet(createStyles);
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);

  useEffect(() => {
    searchBarRef && searchBarRef.current?.focus();
  }, [searchBarRef, navigation]);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
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
          {enabled && (
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
