import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useGetDeadlines } from '../../../core/queries/studentHooks';
import { fromDateToFormat, weekDay } from '../../../utils';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Deadline'>;

export const DeadlineScreen = ({ route }: Props) => {
  const { date, type } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);
  const deadlinesQuery = useGetDeadlines();
  const deadline = deadlinesQuery.data?.data.find(e => {
    return e?.type === type && e?.endsAt.toISOString() === date;
  });

  const timeLabel = useMemo(() => {
    const endsAtDate = fromDateToFormat(deadline?.endsAt);
    const day = deadline?.endsAt ? `${weekDay(deadline.endsAt, t)}, ` : '';

    return `${day}  ${endsAtDate}`;
  }, [deadline]);

  const onPressDeadlineUrl = async () => {
    try {
      const { url } = deadline;
      console.log({ url });
      if (url) {
        await Linking.openURL(url);
      }
    } catch (e) {
      console.log({ errorOpenDeadline: e });
    }
  };

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{
          paddingBottom: bottomBarAwareStyles.paddingBottom + 40,
        }}
        style={styles.wrapper}
      >
        <EventDetails
          title={deadline.type}
          type={t('Deadline')}
          timeLabel={timeLabel}
        />
        <SectionList>
          <ListItem
            leadingItem={
              <Icon
                name="link"
                style={{ color: colors.secondaryText, marginRight: spacing[2] }}
                size={fontSizes['2xl']}
              />
            }
            title={deadline.type}
            subtitle={deadline.name}
            onPress={deadline.url ? onPressDeadlineUrl : null}
          />
        </SectionList>
      </ScrollView>
    </>
  );
};

const createStyles = ({ spacing, colors, size }: Theme) =>
  StyleSheet.create({
    sectionSeparator: {
      paddingHorizontal: size.lg,
      marginTop: size.xs,
    },
    sectionContainer: {
      paddingHorizontal: size.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: size.xs,
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: size.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
