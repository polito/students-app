import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { CourseOverview } from '@polito/api-client';
import { MenuView } from '@react-native-menu/menu';

import { PreferencesContext } from '../../../core/contexts/PreferencesContext';
import { CourseIcon } from './CourseIcon';

interface Props {
  course: CourseOverview;
}

export const CourseListItem = ({ course }: Props) => {
  const { t } = useTranslation();
  const preferences = useContext(PreferencesContext);

  return (
    <MenuView
      key={course.shortcode}
      shouldOpenOnLongPress={true}
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
      />
    </MenuView>
  );
};
