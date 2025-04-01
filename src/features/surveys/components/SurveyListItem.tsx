import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Survey } from '@polito/api-client';

type Props = {
  survey: Survey;
} & Omit<ListItemProps, 'title'>;

export const SurveyListItem = ({ survey, ...props }: Props) => {
  return (
    <ListItem
      {...props}
      title={survey.title}
      subtitle={survey.subtitle ?? undefined}
      linkTo={{
        screen: 'WebView',
        params: { uri: survey.url, title: survey.title },
      }}
      isAction
    />
  );
};
