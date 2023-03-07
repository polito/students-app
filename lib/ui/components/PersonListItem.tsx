import { Image, StyleSheet, TouchableHighlightProps } from 'react-native';

import { faUser } from '@fortawesome/free-regular-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Person } from '@polito/api-client/models/Person';

interface Props {
  person: Person;
  subtitle?: string | JSX.Element;
}

export const PersonListItem = ({
  person,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { fontSizes } = useTheme();

  return (
    <ListItem
      leadingItem={
        person?.picture ? (
          <Image source={{ uri: person.picture }} style={styles.picture} />
        ) : (
          <Icon icon={faUser} size={fontSizes['2xl']} />
        )
      }
      title={person ? `${person.firstName} ${person.lastName}` : ''}
      linkTo={
        person?.id
          ? {
              screen: 'Person',
              params: { id: person.id },
            }
          : undefined
      }
      {...rest}
    />
  );
};

const styles = StyleSheet.create({
  picture: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
});
