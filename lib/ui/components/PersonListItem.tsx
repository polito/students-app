import { Image, TouchableHighlightProps, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ListItem } from '@lib/ui/components/ListItem';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Person } from '@polito-it/api-client/models/Person';

interface Props {
  person: Person;
  subtitle?: string | JSX.Element;
}

export const PersonListItem = ({
  person,
  ...rest
}: TouchableHighlightProps & Props) => {
  const { colors } = useTheme();

  const pictureStyle = {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 20,
  };

  return (
    <ListItem
      key={person.id}
      leadingItem={
        person.picture ? (
          <Image source={{ uri: person.picture }} style={pictureStyle} />
        ) : (
          <View
            style={[
              pictureStyle,
              {
                backgroundColor: colors.background,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
          >
            <Ionicons name="person-outline" color={colors.heading} size={20} />
          </View>
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
