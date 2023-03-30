import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
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
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { innerText } from 'domutils';
import { parseDocument } from 'htmlparser2';

import { useSearchTicketFaqs } from '../../../core/queries/ticketHooks';
import { GlobalStyles } from '../../../core/styles/globalStyles';
import { ServiceStackParamList } from '../components/ServicesNavigator';

type Props = NativeStackScreenProps<ServiceStackParamList, 'TicketFaqs'>;

export const TicketFaqsScreen = ({ navigation }: Props) => {
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const [search, setSearch] = useState('');
  const [hasSearchedOnce, setHasSearchedOnce] = useState(false);
  const ticketFaqsQuery = useSearchTicketFaqs(search);
  const ticketFaqs =
    ticketFaqsQuery?.data?.data?.sort((a, b) =>
      a.question > b.question ? 1 : -1,
    ) ?? [];

  const canSearch = search?.length > 2;

  const triggerSearch = () => {
    if (!canSearch) {
      Alert.alert(t('common.error'), t('ticketFaqsScreen.searchMinLengthHint'));
      return;
    }
    ticketFaqsQuery.refetch();
    setHasSearchedOnce(true);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
      >
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
          <SectionList>
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
                icon={faSearch}
                loading={ticketFaqsQuery.isFetching}
                onPress={() => {
                  triggerSearch();
                }}
                disabled={!canSearch}
              />
            </Row>
          </SectionList>
          {hasSearchedOnce && (
            <SectionList indented>
              {ticketFaqs.length > 0
                ? ticketFaqs.map(faq => {
                    const dom = parseDocument(
                      faq.question.replace(/\\r+/g, ' ').replace(/\\"/g, '"'),
                    ) as Document;
                    const title = innerText(dom.children as any[]);
                    return (
                      <ListItem
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
                      />
                    );
                  })
                : !ticketFaqsQuery.isFetching && (
                    <EmptyState
                      icon={faQuestionCircle}
                      message={t('ticketFaqsScreen.emptyState')}
                    />
                  )}
            </SectionList>
          )}
        </Section>

        {hasSearchedOnce && !ticketFaqsQuery.isFetching && (
          <CtaButton
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
      </ScrollView>
    </TouchableWithoutFeedback>
  );
};

const createStyles = ({ spacing, colors, fontSizes }: Theme) =>
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
      color: colors.text[100],
    },
    emptyState: {
      backgroundColor: colors.primary[700],
    },
    searchBar: {
      paddingRight: spacing[2],
    },
    messageInput: {
      borderBottomWidth: 0,
    },
  });
