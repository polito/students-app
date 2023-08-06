import { Image, StyleSheet, TouchableHighlightProps } from 'react-native';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { PersonOverview } from '@polito/api-client/models';

import { HighlightedText } from './HighlightedText';

interface Props {
  person: PersonOverview;
  searchString?: string;
  trailingItem?: JSX.Element;
}

export const PersonOverviewListItem = ({
  person,
  trailingItem,
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
      trailingItem={trailingItem}
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
