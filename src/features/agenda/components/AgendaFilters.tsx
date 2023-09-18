import { Tabs } from '@lib/ui/components/Tabs';

import { AgendaTypeFilter } from './AgendaTypeFilter';

export const AgendaFilters = () => {
  return (
    <Tabs>
      <AgendaTypeFilter />
    </Tabs>
  );
};
