import { Image, StyleSheet, TouchableHighlightProps } from 'react-native';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PersonOverview } from '@polito/api-client/models';

interface Props {
  person: PersonOverview | undefined;
  searchString?: string;
}

const HighlightedText = ({
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

export const PersonOverviewListItem = ({
  person,
  searchString,
}: TouchableHighlightProps & Props) => {
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const subtitle = '';
  const firstName = person?.firstName ?? '';
  const lastName = person?.lastName ?? '';
  const title = [firstName, lastName].join(' ').trim();

  return (
    <ListItem
      leadingItem={
        person?.picture ? (
          <Image source={{ uri: person.picture }} style={styles.picture} />
        ) : (
          <Icon icon={faUser} size={fontSizes['2xl']} />
        )
      }
      title={<HighlightedText text={title} highlight={searchString || ''} />}
      linkTo={
        person?.id
          ? {
              screen: 'Person',
              params: { id: person.id },
            }
          : undefined
      }
      subtitle={subtitle}
    />
  );
};

const createStyles = () =>
  StyleSheet.create({
    picture: {
      width: '100%',
      height: '100%',
      borderRadius: 20,
    },
  });
