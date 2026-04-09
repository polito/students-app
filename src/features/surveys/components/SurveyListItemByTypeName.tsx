import { useTranslation } from 'react-i18next';

import { ListItem, ListItemProps } from '@lib/ui/components/ListItem';
import { Survey } from '@polito/student-api-client';

import { useOpenInAppLink } from '../../../core/hooks/useOpenInAppLink.ts';

type Props = {
  survey: Survey;
} & Omit<ListItemProps, 'title'>;

export const SurveyListItemByTypeName = ({ survey, ...props }: Props) => {
  const openInAppLink = useOpenInAppLink();
  const { t } = useTranslation();
  return (
    <ListItem
      {...props}
      title={survey.type.name}
      onPress={() => openInAppLink(survey.url)}
      isAction
      accessibilityRole="button"
      accessibilityLabel={`${survey.title}, ${survey.type.name}`}
      accessibilityHint={t('surveysScreen.tapToOpenSurvey')}
    />
  );
};
