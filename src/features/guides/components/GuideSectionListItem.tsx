import { Text } from '@lib/ui/components/Text';
import { GuideSection } from '@polito/api-client';

import { HtmlView } from '../../../core/components/HtmlView';

type Props = {
  section: GuideSection;
};

export const GuideSectionListItem = ({ section }: Props) => {
  return (
    <>
      <Text variant="subHeading">{section.title}</Text>
      <HtmlView baseStyle={{ padding: 0 }} source={{ html: section.content }} />
    </>
  );
};
