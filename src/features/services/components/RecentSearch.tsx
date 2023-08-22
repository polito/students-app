import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { faEllipsisVertical, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PersonOverview } from '@polito/api-client/models';
import { MenuView } from '@react-native-menu/menu';

import { IS_ANDROID } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { PersonOverviewListItem } from './PersonOverviewListItem';

type MenuProps = PropsWithChildren<{
  person: PersonOverview;
  shouldOpenOnLongPress?: boolean;
}>;

export const Menu = ({
  person,
  shouldOpenOnLongPress,
  children,
}: MenuProps) => {
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

export const RecentSearch = () => {
  const { peopleSearched, updatePreference } = usePreferencesContext();
  const { spacing, palettes, colors, fontSizes } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ paddingBottom: spacing[8] }}
    >
      <Section>
        <Row
          align="center"
          justify="space-between"
          style={{
            marginTop: spacing[2],
            marginHorizontal: spacing[4],
          }}
        >
          <Text
            style={{ padding: spacing[1], color: palettes.info[700] }}
            variant="heading"
          >
            {t('contactsScreen.recentSearches')}
          </Text>
          <IconButton
            onPress={() => updatePreference('peopleSearched', [])}
            style={{ padding: spacing[1] }}
            icon={faTimes}
            accessibilityRole="button"
            accessibilityLabel={t('contactsScreen.clearSearches')}
            color={palettes.info[700]}
          />
        </Row>
        <OverviewList>
          {peopleSearched.map((person, index) =>
            IS_ANDROID ? (
              <PersonOverviewListItem
                totalData={peopleSearched.length}
                index={index}
                key={person.id}
                person={person}
                trailingItem={
                  <Menu person={person}>
                    <IconButton
                      style={{ padding: spacing[3] }}
                      icon={faEllipsisVertical}
                      color={colors.secondaryText}
                      size={fontSizes.xl}
                    />
                  </Menu>
                }
              />
            ) : (
              <View
                key={person.id}
                accessible={true}
                accessibilityRole="button"
              >
                <Menu person={person} shouldOpenOnLongPress={true}>
                  <PersonOverviewListItem
                    totalData={peopleSearched.length}
                    index={index}
                    person={person}
                  />
                </Menu>
              </View>
            ),
          )}
        </OverviewList>
      </Section>
    </ScrollView>
  );
};
