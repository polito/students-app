import { PropsWithChildren, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform } from 'react-native';

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

  return (
    <MenuView
      shouldOpenOnLongPress={shouldOpenOnLongPress}
      title={t('Course preferences')}
      actions={[
        {
          title: t('coursePreferencesScreen.hideInExtracts'),
          subtitle: t('coursePreferencesScreen.showInExtractsSubtitle'),
          image: 'eye.slash',
        },
      ]}
      onPressAction={() => {
        preferences.updatePreference('courses', {
          ...preferences.courses,
          [course.id]: {
            ...preferences.courses[course.id],
            isHidden: true,
          },
        });
      }}
    >
      {children}
    </MenuView>
  );
};

export const CourseListItem = ({ course }: Props) => {
  const { colors, spacing } = useTheme();
  const { t } = useTranslation();
  const preferences = useContext(PreferencesContext);

  const listItem = (
    <ListItem
      linkTo={
        course.id != null
          ? {
              screen: 'Course',
              params: { id: course.id, courseName: course.name },
            }
          : undefined
      }
      title={course.name}
      subtitle={`${course.cfu} ${t('common.credits').toLowerCase()}`}
      leadingItem={
        <CourseIcon
          icon={preferences.courses[course.id]?.icon}
          color={preferences.courses[course.id]?.color}
        />
      }
      trailingItem={Platform.select({
        android: (
          <Menu course={course}>
            <IconButton
              style={{
                padding: spacing[3],
              }}
              icon={faEllipsisVertical}
              color={colors.secondaryText}
            />
          </Menu>
        ),
      })}
      containerStyle={{
        paddingRight: Platform.select({
          android: 0,
        }),
      }}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <Menu course={course} shouldOpenOnLongPress={true}>
        {listItem}
      </Menu>
    );
  }
  return listItem;
};
