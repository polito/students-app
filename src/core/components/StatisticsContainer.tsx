import { StyleSheet, View } from 'react-native';

import { Row, RowProps } from '@lib/ui/components/Row';
import {
  faRoad,
  faClock,
  faStairs
} from '@fortawesome/free-solid-svg-icons';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';

export const StatisticsContainer = ({children, ...props}: RowProps) => {
    const styles = useStylesheet(createStyles);
    const { colors, dark, palettes } = useTheme();

    return (
        <View style={[styles.container, {backgroundColor: colors.background}]}>
            <Text style={[styles.info, { color: palettes.text[900] }]}>
                Info
            </Text>
            <View style={styles.statisticsContainer}>
                <View style={styles.statistic}>
                    <Icon
                    icon={faRoad}
                    color={palettes.gray[dark ? 300 : 600]}
                    //size={isCompact && !isTablet ? fontSizes.xs : undefined}
                    />
                    <Text style={[styles.statisticsText, { color: palettes.text[900] }]}>
                        2.32 km
                    </Text>
                </View>
                <View style={styles.statistic}>
                    <Icon
                        icon={faClock}
                        color={palettes.gray[dark ? 300 : 600]}
                        //size={isCompact && !isTablet ? fontSizes.xs : undefined}
                    />
                    <Text style={[styles.statisticsText, { color: palettes.text[900] }]}>
                        15 min
                    </Text>
                </View>
                <View style={styles.statistic}>
                    <Icon
                        icon={faStairs}
                        color={palettes.gray[dark ? 300 : 600]}
                        //size={isCompact && !isTablet ? fontSizes.xs : undefined}
                    />
                    <Text style={[styles.statisticsText, { color: palettes.text[900] }]}>
                        3
                    </Text>
                </View>
            </View>
        </View>

    );
}

const createStyles = ({ spacing }: Theme) =>
    StyleSheet.create({
        container: {
            display: 'flex',
            padding: 12,
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
            borderRadius: 12,
        },
        info: {
            overflow: 'hidden',
            //color: '#000',
            //textOverflow: 'ellipsis',
            fontFamily: 'Montserrat',
            fontSize: 16,
            fontStyle: 'normal',
            fontWeight: 500,
            lineHeight: 24, /* 24px */
        },
        statisticsContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 4,
        },
        statistic: {
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        statisticsIcon: {
            display: 'flex',
            width: 20,
            justifyContent: 'center',
            alignItems: 'center',
            alignSelf: 'stretch',
        },
        statisticsText: {
            overflow: 'hidden',
            //text-overflow: ellipsis;
            fontFamily: 'Montserrat',
            fontSize: 14,
            fontStyle: 'normal',
            fontWeight: 400,
            lineHeight: 21,
        }
    });