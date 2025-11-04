import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { CourseStaffInner } from '@polito/api-client/models';

import { useGetPerson } from '../../../core/queries/peopleHooks';

export const StaffListItem = ({ staff }: { staff: CourseStaffInner }) => {
  const { t } = useTranslation();
  const { data: person } = useGetPerson(staff.id);

  const subtitle = t(
    'common.' + (staff.role === 'Titolare' ? 'roleHolder' : 'roleCollaborator'),
  );
  return person ? (
    <PersonListItem
      person={person}
      subtitle={subtitle}
      accessibilityLabel={`${person.firstName} ${person.lastName}, ${subtitle}`}
      accessibilityRole="button"
    />
  ) : (
    <ListItem
      title=" - "
      subtitle={subtitle}
      accessibilityLabel={`${t('common.staffMemberUnavailable')}, ${subtitle}`}
      accessibilityRole="text"
    />
  );
};
