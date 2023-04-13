import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';
import { CourseIcon } from './CourseIcon';

interface Props {
  course: CourseOverview;
  accessible?: boolean;
  accessibilityLabel?: string;
}

const Menu = ({
  course,
  shouldOpenOnLongPress,
  children,
}: PropsWithChildren<{
  course: CourseOverview;
  shouldOpenOnLongPress?: boolean;
}>) => {
  const { t } = useTranslation();
  const preferences = usePreferencesContext();
  const isHidden = preferences.courses[course.id!]?.isHidden ?? false;

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={`${t('common.course')} ${t('common.preferences').toLowerCase()}`}
      actions={[
        {
          title: isHidden ? t('common.follow') : t('common.stopFollowing'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          image: isHidden ? 'eye' : 'eye.slash',
        },
      ]}
      onPressAction={() => {
        preferences.updatePreference('courses', {
          ...preferences.courses,
          [course.id!]: {
            ...preferences.courses[course.id!],
            isHidden: !isHidden,
          },
        });
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseListItem = ({
  course,
  accessibilityLabel,
  accessible,
}: Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();
  const preferences = usePreferencesContext();

  const hasDetails = course.id != null;

  const listItem = (
    <ListItem
      accessible={accessible}
      linkTo={
        hasDetails
          ? {
              screen: 'Course',
              params: { id: course.id, courseName: course.name },
            }
          : undefined
      }
      onPress={() => {
        if (!hasDetails) {
          Alert.alert(t('courseListItem.courseWithoutDetailsAlertTitle'));
        }
      }}
      accessibilityLabel={`${accessibilityLabel} ${course.name}, ${
        course.cfu
      } ${t('common.credits')}`}
      title={course.name}
      subtitle={`${course.cfu} ${t('common.credits').toLowerCase()}`}
      leadingItem={
        <CourseIcon
          icon={course.id ? preferences.courses[course.id]?.icon : undefined}
          color={course.id ? preferences.courses[course.id]?.color : undefined}
        />
      }
      trailingItem={
        hasDetails ? (
          Platform.select({
            android: (
              <Menu course={course}>
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
          })
        ) : (
          <View style={{ width: 20 }} />
        )
      }
      containerStyle={{
        paddingRight: Platform.select({
          android: 0,
        }),
      }}
    />
  );

  if (hasDetails && Platform.OS === 'ios') {
    return (
      <View
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`${accessibilityLabel} ${course.name},  ${course.cfu}`}
      >
        <Menu course={course} shouldOpenOnLongPress={true}>
          {listItem}
        </Menu>
      </View>
    );
  }
  return listItem;
};
