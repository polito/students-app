import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { faFrown } from '@fortawesome/free-solid-svg-icons';
import { EmptyState } from '@lib/ui/components/EmptyState';
import { ListItem } from '@lib/ui/components/ListItem';
import { LoadingContainer } from '@lib/ui/components/LoadingContainer';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { RefreshControl } from '@lib/ui/components/RefreshControl';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/Theme';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { useOfflineDisabled } from '../../../core/hooks/useOfflineDisabled';
import { useGetOffering } from '../../../core/queries/offeringHooks';

export const Offerings = ({ type }: { type: 'master' | 'bachelor' }) => {
  const offeringQuery = useGetOffering();
  const { data, isLoading } = offeringQuery;
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  const isOffline = useOfflineDisabled();

  const offerings = data ? data[type] : [];

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      refreshControl={<RefreshControl queries={[offeringQuery]} manual />}
      contentContainerStyle={styles.container}
    >
      <LoadingContainer loading={isLoading}>
        {!!offerings && offerings?.length > 0 ? (
          offerings?.map(item => (
            <Section key={item.code} style={styles.section}>
              <Text variant="subHeading" style={styles.offeringClass}>
                {item?.name || item.code}
              </Text>
              <OverviewList>
                {item?.degrees.map((degree, index) => (
                  <ListItem
                    containerStyle={styles.offeringListItem}
                    key={index}
                    title={degree?.name || degree.id}
                    titleProps={{
                      ellipsizeMode: undefined,
                      numberOfLines: undefined,
                    }}
                    accessibilityRole="button"
                    linkTo={{
                      screen: 'Degree',
                      params: {
                        id: degree.id,
                      },
                    }}
                    disabled={isOffline}
                  />
                ))}
              </OverviewList>
            </Section>
          ))
        ) : (
          <OverviewList style={styles.emptyMessage}>
            <EmptyState
              message={t('offeringScreen.emptyMessage')}
              icon={faFrown}
            />
          </OverviewList>
        )}
      </LoadingContainer>
      <BottomBarSpacer />
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    container: {
      paddingVertical: spacing[5],
    },
    offeringClass: {
      marginHorizontal: spacing[4],
    },
    emptyMessage: {
      marginTop: spacing[4],
    },
    offeringListItem: {
      minHeight: 45,
    },
    section: {
      marginBottom: spacing[2],
    },
  });
