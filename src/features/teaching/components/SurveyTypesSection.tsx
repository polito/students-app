import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';

import { SurveyCategoryListItem } from '../../surveys/components/SurveyCategoryListItem';
import { SurveyType } from '../../surveys/types/SurveyType';

type Props = {
  types: SurveyType[];
};
export const SurveyTypesSection = ({ types }: Props) => {
  return (
    <Section>
      <SectionHeader
        title="CPD da compilare" // TODO translate
      />
      <OverviewList indented>
        {types.map(type => (
          <SurveyCategoryListItem key={type.id} type={type} />
        ))}
      </OverviewList>
    </Section>
  );
};
