import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Survey } from '@polito/api-client';

type Props = {
  survey: Survey;
} & Omit<ListItemProps, 'title'>;

export const SurveyListItemByTypeName = ({ survey, ...props }: Props) => {
  return (
    <ListItem
      {...props}
      title={survey.type.name}
      linkTo={{
        screen: 'webView',
        params: { uri: survey.url, title: survey.type.name },
      }}
      isAction
    />
  );
};
