import { ReactElement, useCallback } from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  TouchableHighlightProps,
  ViewStyle,
} from 'react-native';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PersonOverview } from '@polito/api-client';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQueryClient } from '@tanstack/react-query';

import { MAX_RECENT_SEARCHES } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { getPersonKey } from '../../../core/queries/peopleHooks';
import { HighlightedText } from './HighlightedText';

interface Props {
  person: PersonOverview;
  searchString?: string;
  trailingItem?: ReactElement;
  index: number;
  totalData: number;
  containerStyle?: StyleProp<ViewStyle>;
}

export const PersonOverviewListItem = ({
  person,
  trailingItem,
  searchString,
  index,
  totalData,
  containerStyle,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { fontSizes, colors } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const styles = useStylesheet(createStyles);
  const { accessibilityListLabel } = useAccessibility();
  const { updatePreference, peopleSearched } = usePreferencesContext();
  const accessibilityLabel = accessibilityListLabel(index, totalData);
  const subtitle = person.role ?? '';
  const firstName = person?.firstName ?? '';
  const lastName = person?.lastName ?? '';
  const title = [firstName, lastName].join(' ').trim();

  const navigateToPerson = () => {
    const personIndex = peopleSearched.findIndex(p => p.id === person.id);
    if (personIndex === -1) {
      if (peopleSearched.length >= MAX_RECENT_SEARCHES) {
        peopleSearched.pop();
      }
      updatePreference('peopleSearched', [person, ...peopleSearched]);
    } else {
      const newPeopleSearched = peopleSearched.filter(p => p.id !== person.id);
      updatePreference('peopleSearched', [person, ...newPeopleSearched]);
    }
    navigation.navigate('Person', { id: person.id });
  };

  const queryClient = useQueryClient();

  const isDataMissing = useCallback(
    () => queryClient.getQueryData(getPersonKey(person!.id)) === undefined,
    [person, queryClient],
  );

  const isDisabled = useOfflineDisabled(isDataMissing);
  return (
    <ListItem
      onPress={navigateToPerson}
      leadingItem={
        person?.picture ? (
          <Image source={{ uri: person.picture }} style={styles.picture} />
        ) : (
          <Icon icon={faUser} size={fontSizes.xl} />
        )
      }
      title={<HighlightedText text={title} highlight={searchString || ''} />}
      accessibilityLabel={[accessibilityLabel, title, subtitle].join(', ')}
      subtitle={subtitle}
      trailingItem={trailingItem}
      style={[
        {
          backgroundColor: colors.surface,
        },
        containerStyle,
      ]}
      disabled={isDisabled}
      {...rest}
    />
  );
};

const createStyles = () =>
  StyleSheet.create({
    picture: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
  });
