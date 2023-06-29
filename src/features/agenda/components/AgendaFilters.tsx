import { Tabs } from '@lib/ui/components/Tabs';

import { AgendaItemType } from '../types/AgendaItem';
import { AgendaTypesFilterState } from '../types/AgendaTypesFilterState';
import { AgendaTypeFilter } from './AgendaTypeFilter';

interface Props {
  state: AgendaTypesFilterState;
  toggleState: (type: AgendaItemType) => void;
}

export const AgendaFilters = ({ state, toggleState }: Props) => {
  return (
    <Tabs>
      <AgendaTypeFilter state={state} toggleState={toggleState} />
    </Tabs>
  );
};
