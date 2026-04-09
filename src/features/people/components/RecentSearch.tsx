import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, StyleSheet, View } from 'react-native';
import ContextMenu from 'react-native-context-menu-view';

import { faEllipsisVertical, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { IndentedDivider } from '@lib/ui/components/IndentedDivider';
import { Row } from '@lib/ui/components/Row';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { PersonOverview } from '@polito/student-api-client';

import { IS_ANDROID } from '../../../core/constants';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { PersonOverviewListItem } from './PersonOverviewListItem';

type MenuProps = PropsWithChildren<{
  person: PersonOverview;
}>;

export const Menu = ({ person, children }: MenuProps) => {
  const { t } = useTranslation();
  const { palettes } = useTheme();
  const { peopleSearched, updatePreference } = usePreferencesContext();

  return (
    <ContextMenu
      dropdownMenuMode={IS_ANDROID}
      title={t('contactsScreen.recentSearch')}
      actions={[
        {
          title: t('contactsScreen.cancelRecentSearch'),
          subtitle: t('contactsScreen.cancelRecentSearchText'),
          systemIcon: 'trash',
          titleColor: palettes.error['500'],
          destructive: true,
        },
      ]}
      onPress={() => {
        const newPeopleSearched = peopleSearched.filter(
          p => p.id !== person.id,
        );
        updatePreference('peopleSearched', newPeopleSearched);
      }}
    >
      {children}
    </ContextMenu>
  );
};

export const RecentSearch = () => {
  const { peopleSearched, updatePreference } = usePreferencesContext();
  const styles = useStylesheet(createStyles);
  const { dark, palettes, colors, fontSizes } = useTheme();
  const { t } = useTranslation();
  const { accessibilityListLabel } = useAccessibility();
  const isDisabled = useOfflineDisabled();

  const infoColor = dark ? palettes.info[400] : palettes.info[700];
  const listLabel = `${t('contactsScreen.recentSearches')} - ${peopleSearched.length} ${t('contactsScreen.contactsFound')}`;

  return (
    <View accessibilityRole="list" accessibilityLabel={listLabel}>
      <FlatList
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <Row align="center" justify="space-between" style={styles.header}>
            <Text
              style={[styles.heading, { color: infoColor }]}
              variant="heading"
              accessibilityRole="header"
            >
              {t('contactsScreen.recentSearches')}
            </Text>
            <IconButton
              onPress={() => updatePreference('peopleSearched', [])}
              style={styles.cancelIcon}
              icon={faTimes}
              accessibilityRole="button"
              accessibilityLabel={t('contactsScreen.clearSearches')}
              accessibilityHint={t('contactsScreen.clearSearchesHint')}
              color={infoColor}
            />
          </Row>
        }
        data={peopleSearched}
        ItemSeparatorComponent={Platform.select({
          ios: () => <IndentedDivider indent={20} />,
        })}
        renderItem={({ item: person, index }) => {
          const isFirstItem = index === 0;
          const isLastItem = index === peopleSearched.length - 1;
          return IS_ANDROID ? (
            <PersonOverviewListItem
              totalData={peopleSearched.length}
              index={index}
              key={person.id}
              person={person}
              trailingItem={
                <Menu person={person}>
                  <IconButton
                    adjustSpacing="right"
                    icon={faEllipsisVertical}
                    color={colors.secondaryText}
                    size={fontSizes.md}
                    accessibilityLabel={t('contactsScreen.moreOptions')}
                    accessibilityHint={t('contactsScreen.moreOptionsHint')}
                  />
                </Menu>
              }
              containerStyle={[
                isFirstItem && styles.firstItem,
                isLastItem && styles.lastItem,
              ]}
            />
          ) : (
            <View
              key={person.id}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${accessibilityListLabel(index, peopleSearched.length)}${person.firstName} ${person.lastName}, ${person.role || ''}`}
              accessibilityHint={t('common.tapToNavigate')}
              accessibilityState={{ disabled: isDisabled }}
              accessibilityActions={[
                {
                  name: 'delete',
                  label: t('contactsScreen.removeFromRecent'),
                },
              ]}
              onAccessibilityAction={event => {
                if (event.nativeEvent.actionName === 'delete') {
                  const newPeopleSearched = peopleSearched.filter(
                    p => p.id !== person.id,
                  );
                  updatePreference('peopleSearched', newPeopleSearched);
                }
              }}
            >
              <Menu person={person}>
                <PersonOverviewListItem
                  totalData={peopleSearched.length}
                  index={index}
                  person={person}
                  containerStyle={[
                    isFirstItem && styles.firstItem,
                    isLastItem && styles.lastItem,
                  ]}
                />
              </Menu>
            </View>
          );
        }}
      />
    </View>
  );
};

const createStyles = ({ shapes, spacing }: Theme) =>
  StyleSheet.create({
    firstItem: {
      borderTopLeftRadius: Platform.select({ ios: shapes.lg }),
      borderTopRightRadius: Platform.select({ ios: shapes.lg }),
    },
    lastItem: {
      borderBottomLeftRadius: Platform.select({ ios: shapes.lg }),
      borderBottomRightRadius: Platform.select({ ios: shapes.lg }),
    },
    heading: { padding: spacing[1] },
    header: {
      marginTop: spacing[5],
      marginBottom: spacing[2],
      paddingHorizontal: Platform.select({ android: spacing[3] }),
    },
    container: {
      flex: 1,
      marginHorizontal: Platform.select({ ios: spacing[4] }),
    },
    cancelIcon: { padding: spacing[1] },
  });
