import { Linking } from 'react-native';

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
      onPress={() => Linking.openURL(survey.url)}
      isAction
    />
  );
};
