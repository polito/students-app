import { useEffect, useState } from 'react';
import { SafeAreaView, ScrollView } from 'react-native';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { PersonListItem } from '@lib/ui/components/PersonListItem';
import { Section } from '@lib/ui/components/Section';
import { Person } from '@polito/api-client/models/Person';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useGetPersons } from '../../../core/queries/peopleHooks';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'Staff'>;

export const StaffScreen = ({ route }: Props) => {
  const { personIds } = route.params;
  const { queries: staffQueries, isLoading } = useGetPersons(personIds);
  const [staff, setStaff] = useState<Person[]>([]);

  useEffect(() => {
    if (isLoading) {
      return;
    }
    const staffData: Person[] = [];

    staffQueries.forEach(staffQuery => {
      if (!staffQuery.data) return;
      staffData.push({
        ...staffQuery.data,
      });
    });

    setStaff(staffData);
  }, [isLoading]);

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Section>
          <OverviewList loading={isLoading}>
            {staff.map(person => (
              <PersonListItem
                key={`${person.id}`}
                person={person}
                subtitle={person.role}
              />
            ))}
          </OverviewList>
        </Section>
      </SafeAreaView>
    </ScrollView>
  );
};
