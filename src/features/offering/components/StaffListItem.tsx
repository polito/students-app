import { useTranslation } from 'react-i18next';

import { ListItem } from '@lib/ui/components/ListItem';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { CourseStaffInner } from '@polito/api-client';

import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useGetPerson } from '../../../core/queries/peopleHooks';

interface StaffListItemProps {
  staff: CourseStaffInner;
  /**
   * Index of the item in the list (0-based). Used for accessibility.
   */
  index?: number;
  /**
   * Total number of items in the list. Used for accessibility.
   */
  total?: number;
}

export const StaffListItem = ({ staff, index, total }: StaffListItemProps) => {
  const { t } = useTranslation();
  const { data: person } = useGetPerson(staff.id);
  const { accessibilityListLabel } = useAccessibility();

  const subtitle = t(
    'common.' + (staff.role === 'Titolare' ? 'roleHolder' : 'roleCollaborator'),
  );

  const baseLabel = person
    ? `${person.firstName} ${person.lastName}, ${subtitle}`
    : `${t('common.staffMemberUnavailable')}, ${subtitle}`;

  const accessibilityLabel =
    index !== undefined && total !== undefined
      ? accessibilityListLabel(index, total, baseLabel)
      : baseLabel;

  return person ? (
    <PersonListItem
      person={person}
      subtitle={subtitle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint={t('common.tapToViewContact')}
    />
  ) : (
    <ListItem
      title=" - "
      subtitle={subtitle}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    />
  );
};
