import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';
import { SearchBarCommands } from 'react-native-screens';

import { EmptyState } from '@lib/ui/components/EmptyState';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useDebounceValue } from '../../../core/hooks/useDebounceValue';
import { useGetPeople } from '../../../core/queries/peopleHooks';
import { PersonOverviewListItem } from '../components/PersonOverviewListItem';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Contacts'>;

export const ContactsScreen = ({ navigation }: Props) => {
  const [search, setSearch] = useState('');
  const debounceSearch = useDebounceValue(search, 400);
  const { spacing } = useTheme();
  const searchBarRef = useRef<SearchBarCommands>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const { t } = useTranslation();
  const enabled = debounceSearch.length >= 2;
  const { isLoading, data: people } = useGetPeople(debounceSearch, enabled);

  useEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        autoFocus: true,
        shouldShowHintSearchIcon: false,
        onChangeText: event => setSearch(event.nativeEvent.text),
        ref: searchBarRef,
        onCancelButtonPress: () => {
          navigation.goBack();
        },
      },
    });
  }, [navigation]);

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
        <Section style={{ marginTop: spacing['2'] }}>
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
