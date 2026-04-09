import { View } from 'react-native';

import { Text } from '@lib/ui/components/Text';
import { GuideSection } from '@polito/student-api-client';

import { HtmlView } from '../../../core/components/HtmlView';
import { getHtmlTextContent } from '../../../utils/html';

type Props = {
  section: GuideSection;
};

export const GuideSectionListItem = ({ section }: Props) => {
  return (
    <>
      <Text variant="subHeading" accessibilityRole="header">
        {section.title}
      </Text>
      {/* a11y: manual test required — alt text not forwarded to FastImage */}
      <View
        accessible={true}
        accessibilityLabel={getHtmlTextContent(section.content)}
        importantForAccessibility="no-hide-descendants"
      >
        <HtmlView
          props={{
            source: { html: section.content },
            baseStyle: { padding: 0 },
          }}
          variant="longProse"
        />
      </View>
    </>
  );
};
