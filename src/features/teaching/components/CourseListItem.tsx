import { PropsWithChildren, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Platform, View } from 'react-native';

import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { CourseOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { CourseIcon } from './CourseIcon';

interface Props {
  course: CourseOverview;
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
  const preferences = useContext(PreferencesContext);
  const isHidden = preferences.courses[course.id]?.isHidden ?? false;

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={`${t('common.course')} ${t('common.preferences').toLowerCase()}`}
      actions={[
        {
          title: isHidden
            ? t('coursePreferencesScreen.showInExtracts')
            : t('coursePreferencesScreen.hideInExtracts'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          image: isHidden ? 'eye' : 'eye.slash',
        },
      ]}
      onPressAction={() => {
        preferences.updatePreference('courses', {
          ...preferences.courses,
          [course.id]: {
            ...preferences.courses[course.id],
            isHidden: !isHidden,
          },
        });
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseListItem = ({ course }: Props) => {
  const { colors, spacing, fontSizes } = useTheme();
  const { t } = useTranslation();
  const preferences = useContext(PreferencesContext);

  const hasDetails = course.id != null;

  const listItem = (
    <ListItem
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
      title={course.name}
      subtitle={`${course.cfu} ${t('common.credits').toLowerCase()}`}
      leadingItem={
        <CourseIcon
          icon={preferences.courses[course.id]?.icon}
          color={preferences.courses[course.id]?.color}
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
      <Menu course={course} shouldOpenOnLongPress={true}>
        {listItem}
      </Menu>
    );
  }
  return listItem;
};
