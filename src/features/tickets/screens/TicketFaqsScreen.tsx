import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  AccessibilityInfo,
  Alert,
  Keyboard,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Document } from 'react-native-render-html';

import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import { faPencil, faSearch } from '@fortawesome/free-solid-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { Icon } from '@lib/ui/components/Icon';
import { IconButton } from '@lib/ui/components/IconButton';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useAccessibility } from '../../../core/hooks/useAccessibilty';
import { useSearchTicketFaqs } from '../../../core/queries/ticketHooks';
import { GlobalStyles } from '../../../core/styles/GlobalStyles';
import { ServiceStackParamList } from '../../services/components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaqs'>;

export const TicketFaqsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { spacing } = useTheme();
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const [search, setSearch] = useState('');
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);
  const ticketFaqsQuery = useSearchTicketFaqs(search);
  const ticketFaqs =
    ticketFaqsQuery.data?.sort((a, b) => (a.question > b.question ? 1 : -1)) ??
    [];
  const canSearch = search?.length > 2;

  const { accessibilityListLabel } = useAccessibility();

  useEffect(() => {
    if (!ticketFaqsQuery?.data) {
      return;
    }
    if (ticketFaqs?.length === 0 && canSearch && hasSearchedOnce) {
      AccessibilityInfo.announceForAccessibility(
        t('ticketFaqsScreen.emptyState'),
      );
    }
  }, [ticketFaqs, canSearch, hasSearchedOnce, ticketFaqsQuery.data, t]);

  const triggerSearch = () => {
    if (!canSearch) {
      Alert.alert(t('common.error'), t('ticketFaqsScreen.searchMinLengthHint'));
      return;
    }
    ticketFaqsQuery.refetch();
    setHasSearchedOnce(true);
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <SafeAreaView>
        <Section>
          <View style={styles.heading}>
            <ScreenTitle
              title={t('ticketFaqsScreen.findFAQ')}
              style={styles.title}
            />
            <Text variant="secondaryText" style={styles.description}>
              {t('ticketFaqsScreen.findFAQSubtitle')}
            </Text>
          </View>
          <OverviewList>
            <Row align="center" style={styles.searchBar}>
              <TextField
                label={t('ticketFaqsScreen.search')}
                value={search}
                onChangeText={setSearch}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  triggerSearch();
                }}
                editable={!ticketFaqsQuery?.isFetching}
                returnKeyType="search"
                style={GlobalStyles.grow}
                inputStyle={styles.messageInput}
              />
              <IconButton
                accessibilityLabel={t('ticketFaqsScreen.searchButton')}
                iconPadding={spacing[5]}
                icon={faSearch}
                loading={ticketFaqsQuery.isFetching}
                onPress={() => {
                  triggerSearch();
                }}
                accessibilityRole="button"
                disabled={!canSearch}
              />
            </Row>
          </OverviewList>
          {hasSearchedOnce && (
            <OverviewList indented>
              {ticketFaqs.length > 0
                ? ticketFaqs.map((faq, index) => {
                    const dom = parseDocument(
                      faq.question.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
                    ) as Document;
                    const title = innerText(dom.children as any[]);
                    const accessibilityLabel = [
                      accessibilityListLabel(index, ticketFaqs?.length || 0),
                      title,
                    ].join(', ');
                    return (
                      <ListItem
                        accessibilityLabel={accessibilityLabel}
                        key={faq.id}
                        leadingItem={
                          <Icon
                            icon={faQuestionCircle}
                            size={fontSizes['2xl']}
                          />
                        }
                        linkTo={{
                          screen: 'TicketFaq',
                          params: { faq },
                        }}
                        title={<Text numberOfLines={3}>{title}</Text>}
                        accessibilityRole="button"
                      />
                    );
                  })
                : !ticketFaqsQuery.isFetching && (
                    <EmptyState
                      icon={faQuestionCircle}
                      message={t('ticketFaqsScreen.emptyState')}
                    />
                  )}
            </OverviewList>
          )}
        </Section>

        {hasSearchedOnce && !ticketFaqsQuery.isFetching && (
          <CtaButton
            accessibilityLabel={t('ticketFaqScreen.writeTicketMessage')}
            absolute={false}
            title={t('ticketFaqsScreen.writeTicket')}
            hint={t('ticketFaqsScreen.noResultFound')}
            action={() =>
              navigation.navigate('CreateTicket', {
                subtopicId: undefined,
                topicId: undefined,
              })
            }
            icon={faPencil}
          />
        )}

        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ spacing, palettes, fontSizes }: Theme) =>
  StyleSheet.create({
    heading: {
      paddingTop: spacing[5],
      paddingHorizontal: spacing[5],
    },
    title: {
      fontSize: fontSizes['3xl'],
      marginBottom: spacing[1],
    },
    spacer: {
      height: spacing[56],
    },
    description: {
      marginBottom: spacing[4],
    },
    noResultFound: {
      textAlign: 'center',
      color: palettes.text[100],
    },
    emptyState: {
      backgroundColor: palettes.primary[700],
    },
    searchBar: {
      paddingRight: spacing[2],
    },
    messageInput: {
      borderBottomWidth: 0,
    },
  });
