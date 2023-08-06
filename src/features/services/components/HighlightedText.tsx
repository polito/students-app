import { Text } from '@lib/ui/components/Text';
import { useTheme } from '@lib/ui/hooks/useTheme';

export const HighlightedText = ({
  text,
  highlight,
}: {
  text: string;
  highlight: string;
}) => {
  const highlightIndex = text.toLowerCase().indexOf(highlight.toLowerCase());
  const { palettes } = useTheme();
  if (highlightIndex === -1) {
    return <Text variant="heading">{text}</Text>;
  }

  return (
    <Text variant="heading">
      {text.substring(0, highlightIndex)}
      <Text variant="heading" style={{ color: palettes.secondary['600'] }}>
        {text.substring(highlightIndex, highlightIndex + highlight.length)}
      </Text>
      {text.substring(highlightIndex + highlight.length)}
    </Text>
  );
};
