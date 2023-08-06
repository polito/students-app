import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Image,
  Platform,
  StyleSheet,
  TouchableHighlightProps,
  View,
} from 'react-native';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { DisclosureIndicator } from '@lib/ui/components/DisclosureIndicator';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PersonOverview } from '@polito/api-client/models';
import { MenuView } from '@react-native-menu/menu';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { HighlightedText } from './HighlightedText';

const Menu = ({
  person,
  shouldOpenOnLongPress,
  children,
}: PropsWithChildren<{
  person: PersonOverview;
  shouldOpenOnLongPress?: boolean;
}>) => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const { peopleSearched, updatePreference } = usePreferencesContext();

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={t('contactsScreen.recentSearch')}
      actions={[
        {
          title: t('contactsScreen.cancelRecentSearch'),
          subtitle: t('contactsScreen.cancelRecentSearchText'),
          image: 'trash',
          titleColor: palettes.error['500'],
          imageColor: palettes.error['500'],
        },
      ]}
      onPressAction={() => {
        const newPeopleSearched = peopleSearched.filter(
          p => p.id !== person.id,
        );
        updatePreference('peopleSearched', newPeopleSearched);
      }}
    >
      {children}
    </MenuView>
  );
};

interface Props {
  person: PersonOverview;
  searchString?: string;
}

export const PersonOverviewListItem = ({
  person,
  searchString,
}: TouchableHighlightProps & Props) => {
  const { fontSizes, colors, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const subtitle = '';
  const firstName = person?.firstName ?? '';
  const lastName = person?.lastName ?? '';
  const title = [firstName, lastName].join(' ').trim();

  const listItem = (
    <ListItem
      leadingItem={
        person?.picture ? (
          <Image source={{ uri: person.picture }} style={styles.picture} />
        ) : (
          <Icon icon={faUser} size={fontSizes['2xl']} />
        )
      }
      title={<HighlightedText text={title} highlight={searchString || ''} />}
      linkTo={
        person?.id
          ? {
              screen: 'Person',
              params: { id: person.id },
            }
          : undefined
      }
      subtitle={subtitle}
      trailingItem={Platform.select({
        android: (
          <Menu person={person}>
            <IconButton
              style={{
                padding: spacing[3],
              }}
              icon={faEllipsisVertical}
              color={colors.secondaryText}
              size={fontSizes.xl}
            />
          </Menu>
        ),
        ios: <DisclosureIndicator />,
      })}
    />
  );

  return Platform.select({
    android: listItem,
    ios: (
      <View accessible={true} accessibilityRole="button">
        <Menu person={person} shouldOpenOnLongPress={true}>
          {listItem}
        </Menu>
      </View>
    ),
  });
};

const createStyles = () =>
  StyleSheet.create({
    picture: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
  });
