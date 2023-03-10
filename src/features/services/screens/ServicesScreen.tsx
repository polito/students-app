import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { faComments, faIdCard } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';

export const ServicesScreen = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useStylesheet(createStyles);
  const bottomBarAwareStyles = useBottomBarAwareStyles();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="always"
      contentContainerStyle={bottomBarAwareStyles}
    >
      <View style={styles.sectionsContainer}>
        <Section>
          <SectionHeader title={t('servicesScreen.subTitleOne')} />
          <Row spaceBetween wrap style={styles.listContainer}>
            <ListItem
              leadingItem={
                <Icon icon={faIdCard} size={24} color={colors.primary[500]} />
              }
              title={t('contactsScreen.title')}
              titleStyle={styles.titleStyle}
              style={[styles.card, styles.disabled]}
              card
            />
          </Row>
        </Section>
        <Section>
          <SectionHeader title={t('servicesScreen.subTitleTwo')} />
          <Row wrap style={styles.listContainer}>
            <ListItem
              leadingItem={
                <Icon icon={faComments} size={30} color={colors.primary[500]} />
              }
              title={t('ticketScreen.title')}
              titleStyle={styles.titleStyle}
              linkTo={{ screen: 'Tickets' }}
              style={styles.card}
              card
            />
            <ListItem
              leadingItem={
                <Icon
                  icon={faComments}
                  size={30}
                  color={colors.darkOrange[400]}
                />
              }
              title={t('common.feedbackApp')}
              titleStyle={styles.titleStyle}
              linkTo={{
                screen: 'TicketInsert',
                params: {
                  topicId: 1101,
                  subtopicId: 2001,
                },
              }}
              style={[styles.card, { overflow: 'hidden' }]}
              card
            >
              <View style={styles.beta}>
                <Text style={styles.betaText}>BETA</Text>
              </View>
            </ListItem>
          </Row>
        </Section>
      </View>
    </ScrollView>
  );
};

const createStyles = ({
  spacing,
  shapes,
  colors,
  fontWeights,
  fontSizes,
}: Theme) =>
  StyleSheet.create({
    listContainer: {
      paddingHorizontal: spacing[2],
      flexWrap: 'wrap',
    },
    beta: {
      position: 'absolute',
      resizeMode: 'contain',
      top: -spacing[1],
      left: -spacing['5'],
      width: 90,
      backgroundColor: colors.darkOrange[400],
      transform: [{ rotate: '-42deg' }],
    },
    betaText: {
      color: colors.text[50],
      fontWeight: fontWeights.semibold,
      paddingHorizontal: spacing[5],
      fontSize: fontSizes.xs,
    },
    disabled: {
      opacity: 0.8,
    },
    card: {
      width: '30%',
      minHeight: 110,
      backgroundColor: colors.surface,
      borderRadius: shapes.lg,
      justifyContent: 'center',
      marginVertical: spacing[2],
      marginHorizontal: spacing[2],
    },
    titleStyle: {
      fontWeight: fontWeights.semibold,
      textAlign: 'center',
      fontSize: fontSizes.sm,
    },
    sectionsContainer: {
      // backgroundColor: 'red',
      paddingVertical: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    loader: {
      marginVertical: spacing[8],
    },
    sectionContent: {
      marginVertical: spacing[2],
    },
  });
