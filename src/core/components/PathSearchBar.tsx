import { StyleSheet, View } from 'react-native';

import { RowProps } from '@lib/ui/components/Row';
import {
  faLocationDot,
  faCircleDot,
  faEllipsisV
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';

export const PathSearchBar = ({children, ...props}: RowProps) => {
    const styles = useStylesheet(createStyles);
    const { colors, dark, palettes } = useTheme();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <View style={styles.grid}>
                <View style={styles.icons}>
                    <Icon icon={faLocationDot} color={palettes.gray[dark ? 300 : 600]} />
                    <Icon icon={faEllipsisV} color={palettes.gray[dark ? 300 : 600]} />
                    <Icon icon={faCircleDot} color={palettes.gray[dark ? 300 : 600]} />
                </View>
                <View style={styles.inputs}>
                    <View style={styles.filter}>
                        <Text style={[styles.filterText,{ color: palettes.text[900] }]} numberOfLines={1} ellipsizeMode="tail">
                            Aula 7
                        </Text>
                    </View>
                    <View style={styles.filter}>
                        <Text style={[styles.filterText, { color: palettes.text[900] }]} numberOfLines={1} ellipsizeMode="tail">
                            Biblioteca centrale ingegneria
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}

const createStyles = ({ spacing }: Theme) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            padding: 18,
            paddingEnd: 18,
            paddingStart: 18,
            paddingTop: 18,
            paddingBottom: 16,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: 8,
            flex: 1,
            alignSelf: 'stretch',
            borderRadius: 12,
        },
        grid: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            gap: 9,
            alignSelf: 'stretch',
        },
        icons: {
            display: 'flex',
            width: 16,
            paddingVertical: 8,
            paddingHorizontal: 0,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 6,
            alignSelf: 'stretch',
        },
        icon: {
            display: 'flex',
            height: 16,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'stretch',
        },
        inputs: {   
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 12,
            flexGrow: 1,
            flexShrink: 0,
            flexBasis: 0,
            alignSelf: 'stretch',
        },
        filter: {
            display: 'flex',
            paddingVertical: 6,
            paddingHorizontal: 9,
            alignItems: 'center',
            alignSelf: 'stretch',
            borderRadius: 6,
            backgroundColor: '#ffffff',
        },
        filterText: {
            overflow: 'hidden',
            //text-overflow: ellipsis;
            fontFamily: 'Montserrat',
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 21,
        },
    });