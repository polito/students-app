import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { OfferingCourseStaff, Person } from '@polito/api-client';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetPersons } from '../../../core/queries/peopleHooks';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';
import { StaffListItem } from '../components/StaffListItem';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Staff'>;

export const StaffScreen = ({ route }: Props) => {
  const { staff } = route.params;
  const { t } = useTranslation();

  const staffIds = useMemo(() => staff.map(s => s.id), [staff]);

  const { queries: staffQueries, isLoading } = useGetPersons(staffIds);

  const staffPeople: (Person & OfferingCourseStaff)[] = useMemo(() => {
    if (isLoading) {
      return [];
    }

    const staffData: (Person & OfferingCourseStaff)[] = [];

    for (const [index, staffQuery] of staffQueries.entries()) {
      if (!staffQuery.data) continue;
      staffData.push({
        ...staffQuery.data,
        ...staff[index],
      });
    }

    return staffData;
  }, [isLoading, staff, staffQueries]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Section>
          <OverviewList
            loading={isLoading}
            accessible={true}
            accessibilityRole="list"
            accessibilityLabel={`${t('common.staffList')} - ${staffPeople.length} ${t('common.members')}`}
          >
            {staffPeople.map((person, index) => (
              <StaffListItem
                key={`${person.id}${person.courseId}`}
                staff={person}
                index={index}
                total={staffPeople.length}
              />
            ))}
          </OverviewList>
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};
