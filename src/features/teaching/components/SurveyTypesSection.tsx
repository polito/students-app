import { useTranslation } from 'react-i18next';

import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';

import { SurveyCategoryListItem } from '../../surveys/components/SurveyCategoryListItem';
import { SurveyType } from '../../surveys/types/SurveyType';

type Props = {
  types: SurveyType[];
};
export const SurveyTypesSection = ({ types }: Props) => {
  const { t } = useTranslation();
  return (
    <Section>
      <SectionHeader title={t('teachingScreen.cpdTitle')} />
      <OverviewList indented>
        {types.map(type => (
          <SurveyCategoryListItem key={type.id} type={type} />
        ))}
      </OverviewList>
    </Section>
  );
};
