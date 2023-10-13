import { AgendaItem } from '../../agenda/types/AgendaItem';

export const formatAgendaItem = (agendaItem: AgendaItem, ellipsize = false) =>
  `${
    !ellipsize || agendaItem.title.length < 10
      ? agendaItem.title
      : agendaItem.title.substring(0, 8) + '...'
  } @${agendaItem.start.toFormat('hh:mm')}`;
