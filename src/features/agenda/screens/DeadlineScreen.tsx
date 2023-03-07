import React from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';

import { faLink } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { SectionList } from '@lib/ui/components/SectionList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { EventDetails } from '../../../core/components/EventDetails';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { convertMachineDateToFormatDate } from '../../../utils/dates';
import { AgendaStackParamList } from '../components/AgendaNavigator';

type Props = NativeStackScreenProps<AgendaStackParamList, 'Deadline'>;

export const DeadlineScreen = ({ route }: Props) => {
  const { item: deadline } = route.params;
  const { t } = useTranslation();
  const { colors, spacing } = useTheme();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);

  // TODO refactor
  const onPressDeadlineUrl = async () => {
    try {
      const { url } = deadline;
      if (url) {
        await Linking.openURL(url);
      }
    } catch (e) {
      // TODO replace with browser url?!
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
          title={deadline?.title}
          type={t('common.deadline')}
          time={convertMachineDateToFormatDate(deadline?.date)}
        />
        {/* TODO show link only when relevant*/}
        <SectionList>
          <ListItem
            leadingItem={
              <Icon
                icon={faLink}
                size={20}
                color={colors.primary[400]}
                style={{ marginRight: spacing[2] }}
              />
            }
            title={deadline?.type}
            subtitle={deadline?.title}
            onPress={deadline?.url ? onPressDeadlineUrl : null}
          />
        </SectionList>
      </ScrollView>
    </>
  );
};

const createStyles = ({ colors, fontSizes }: Theme) =>
  StyleSheet.create({
    sectionSeparator: {
      paddingHorizontal: fontSizes.lg,
      marginTop: fontSizes.xs,
    },
    sectionContainer: {
      paddingHorizontal: fontSizes.md,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    wrapper: {
      marginTop: fontSizes.xs,
      // padding: size.sm,
    },
    booking: {
      color: colors.primary[400],
      textTransform: 'uppercase',
      marginVertical: fontSizes.sm,
    },
    time: {
      textTransform: 'capitalize',
    },
  });
