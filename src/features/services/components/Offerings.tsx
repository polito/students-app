import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { EmptyState } from '@lib/ui/components/EmptyState';
import { ListItem } from '@lib/ui/components/ListItem';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { useGetOffering } from '../../../core/queries/offeringHooks';

export const Offerings = ({ type }: { type: 'master' | 'bachelor' }) => {
  const offeringQuery = useGetOffering();
  const { data, isLoading } = offeringQuery;
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const offerings = data ? data[type] : [];
  const hasOfferings = offerings && offerings?.length > 0;

  console.debug('offerings', offerings);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[offeringQuery]} manual />}
      contentContainerStyle={styles.list}
    >
      <LoadingContainer loading={isLoading}>
        {hasOfferings ? (
          offerings?.map(item => (
            <Section key={item.code} style={styles.section}>
              <Text variant="subHeading" style={styles.subHeading}>
                {item?.name || item.code}
              </Text>
              <OverviewList>
                {item.degrees.map((degree, index) => (
                  <ListItem
                    containerStyle={styles.offeringListItem}
                    key={index}
                    title={degree?.name || degree.id}
                    accessibilityRole="button"
                    linkTo={{
                      screen: 'Degree',
                      params: {
                        id: degree.id,
                      },
                    }}
                  />
                ))}
              </OverviewList>
            </Section>
          ))
        ) : (
          <OverviewList style={styles.emptyMessage}>
            <EmptyState message={t('offeringScreen.emptyMessage')} />
          </OverviewList>
        )}
      </LoadingContainer>
    </ScrollView>
  );
};

const createStyles = ({ palettes, spacing, dark }: Theme) =>
  StyleSheet.create({
    subHeading: {
      marginHorizontal: spacing[4],
      color: dark ? palettes.info['400'] : palettes.info['700'],
    },
    emptyMessage: {
      marginTop: spacing[4],
    },
    offeringListItem: {
      paddingVertical: spacing[1],
      minHeight: 45,
    },
    loadingIndicator: {
      marginVertical: spacing[8],
    },
    section: {
      paddingTop: spacing[2],
    },
    list: {
      paddingBottom: spacing[8],
    },
  });
