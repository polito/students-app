import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Document } from 'react-native-render-html';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faPencil, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

import { SCREEN_WIDTH } from '../../../core/constants';
import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useScrollViewStyle } from '../../../core/hooks/useScrollViewStyle';
import { useSearchTicketFaqs } from '../../../core/queries/ticketHooks';
import { ServiceStackParamList } from '../components/ServiceNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaqs'>;

export const TicketFaqsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const styles = createStyles(theme);
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const scrollViewStyles = useScrollViewStyle();
  const [enabled, setEnabled] = useState(true);
  const [search, setSearch] = useState('');
  const ticketFaqsQuery = useSearchTicketFaqs(search, enabled);
  const ticketFAQS =
    ticketFaqsQuery?.data?.data?.sort((a, b) =>
      a.question > b.question ? 1 : -1,
    ) ?? [];

  return (
    <>
      <ScrollView
        contentContainerStyle={[
          bottomBarAwareStyles,
          scrollViewStyles,
          { minHeight: '100%' },
        ]}
      >
        <View style={styles.sectionsContainer}>
          <Section>
            <SectionHeader title={t('ticketFaqsScreen.findFAQ')} />
            <View style={styles.card}>
              <Text style={styles.text}>
                {t('ticketFaqsScreen.findFAQSubtitle')}
              </Text>
            </View>
            <SectionList />
            <Row spaceBetween alignCenter style={styles.rowSearch}>
              <TextField
                label={t('ticketFaqsScreen.search')}
                value={search}
                onChangeText={setSearch}
                onPressIn={() => setEnabled(false)}
                editable={!ticketFaqsQuery?.isFetching}
                returnKeyType="next"
                style={styles.textField}
                inputStyle={styles.textFieldInput}
              />
              <View style={styles.icon}>
                {ticketFaqsQuery.isFetching ? (
                  <ActivityIndicator />
                ) : (
                  <IconButton
                    icon={faSearch}
                    color={theme.colors.text['400']}
                    size={22}
                    onPress={() => setEnabled(true)}
                  />
                )}
              </View>
            </Row>
            {!!search &&
              enabled &&
              !ticketFaqsQuery.isFetching &&
              ticketFaqsQuery.data?.data?.length === 0 && (
                <EmptyState
                  message={t('ticketFaqsScreen.emptyState')}
                  icon={faQuestionCircle}
                />
              )}
            <SectionList>
              {!!search &&
                enabled &&
                !ticketFaqsQuery.isFetching &&
                ticketFAQS?.map(faq => {
                  const dom = parseDocument(
                    faq.question.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
                  ) as Document;
                  const title = innerText(dom.children as any[]);
                  return (
                    <ListItem
                      key={faq.id}
                      leadingItem={<Icon icon={faQuestionCircle} size={28} />}
                      linkTo={{
                        screen: 'TicketFaq',
                        params: { faq },
                      }}
                      title={
                        <Text style={styles.faqTitle} numberOfLines={3}>
                          {title}
                        </Text>
                      }
                    />
                  );
                })}
            </SectionList>
          </Section>
        </View>
        {enabled && !!search && !ticketFaqsQuery.isFetching && (
          <CtaButton
            title={t('ticketFaqsScreen.writeTicket')}
            textExtra={t('ticketFaqsScreen.noResultFound')}
            action={() =>
              navigation.navigate('TicketInsert', {
                subtopicId: undefined,
                topicId: undefined,
              })
            }
            icon={faPencil}
          />
        )}
      </ScrollView>
    </>
  );
};

const createStyles = ({
  spacing,
  colors,
  fontSizes,
  fontWeights,
  shapes,
}: Theme) =>
  StyleSheet.create({
    sectionsContainer: {
      width: SCREEN_WIDTH,
      paddingTop: spacing[5],
      paddingBottom: +spacing[8] * 2,
    },
    noResultFound: {
      textAlign: 'center',
      color: colors.text['100'],
    },
    card: {
      marginTop: spacing[2],
      marginHorizontal: spacing[4],
    },
    emptyState: {
      backgroundColor: colors.primary[700],
    },
    text: {
      marginLeft: 2,
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
    },
    rowSearch: {
      marginTop: spacing[3],
      marginBottom: spacing[1],
      marginHorizontal: spacing[4],
    },
    faqTitle: {
      fontSize: fontSizes.sm,
    },
    textField: {
      backgroundColor: colors.surface,
      borderRadius: shapes.sm,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: colors.divider,
      width: SCREEN_WIDTH * 0.82,
    },
    textFieldInput: {
      borderBottomWidth: 0,
    },
    icon: {
      paddingRight: spacing[1],
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
  });
