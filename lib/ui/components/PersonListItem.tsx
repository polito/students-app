import { useMemo } from 'react';
import { Image, TouchableHighlightProps } from 'react-native';

import { faUser } from '@fortawesome/pro-regular-svg-icons';
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
  const { spacing, fontSizes } = useTheme();
  const pictureStyle = useMemo(
    () => ({
      width: '100%',
      height: '100%',
      borderRadius: 20,
    }),
    [spacing],
  );

  return (
    <ListItem
      leadingItem={
        person.picture ? (
          <Image source={{ uri: person.picture }} style={pictureStyle} />
        ) : (
          <Icon icon={faUser} size={fontSizes['2xl']} />
        )
      }
      title={`${person.firstName} ${person.lastName}`}
      linkTo={{
        screen: 'Person',
        params: { id: person.id },
      }}
      {...rest}
    />
  );
};
