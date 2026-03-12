import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Survey } from '@polito/api-client';

import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';

type Props = {
  survey: Survey;
} & Omit<ListItemProps, 'title'>;

export const SurveyListItemByTypeName = ({ survey, ...props }: Props) => {
  const openInAppLink = useOpenInAppLink();
  return (
    <ListItem
      {...props}
      title={survey.type.name}
      onPress={() => openInAppLink(survey.url)}
      isAction
    />
  );
};
