import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Survey } from '@polito/api-client';

import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';

type Props = {
  survey: Survey;
} & Omit<ListItemProps, 'title'>;

export const SurveyListItem = ({ survey, ...props }: Props) => {
  const openInAppLink = useOpenInAppLink();
  return (
    <ListItem
      {...props}
      title={survey.title}
      subtitle={survey.subtitle ?? undefined}
      onPress={() => openInAppLink(survey.url)}
      isAction
    />
  );
};
