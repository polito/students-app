import { useMemo } from 'react';
import { Image, TouchableHighlightProps } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

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
  const { colors, spacing, fontSizes } = useTheme();
  const pictureStyle = useMemo(
    () => ({
      width: 38,
      height: 38,
      borderRadius: 20,
      marginRight: spacing[2],
      marginLeft: -spacing[2] + 1,
    }),
    [spacing],
  );

  return (
    <ListItem
      leadingItem={
        person.picture ? (
          <Image source={{ uri: person.picture }} style={pictureStyle} />
        ) : (
          <Icon
            name="person"
            style={{
              color: colors.secondaryText,
              marginRight: spacing[4],
            }}
            size={fontSizes['2xl']}
          />
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
