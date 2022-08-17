import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { AgendaCard } from '../../../../lib/ui/components/AgendaCard';
import { ListItem } from '../../../../lib/ui/components/ListItem';
import { MetricCard } from '../../../../lib/ui/components/MetricCard';
import { SectionHeader } from '../../../../lib/ui/components/SectionHeader';
import { SectionList } from '../../../../lib/ui/components/SectionList';
import { useStylesheet } from '../../../../lib/ui/hooks/useStylesheet';
import { Theme } from '../../../../lib/ui/types/theme';
import { useCollapsingHeader } from '../../../core/hooks/useCollapsingHeader';

export const TeachingScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { scrollViewProps } = useCollapsingHeader();

  return (
    <ScrollView {...scrollViewProps}>
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Teaching' }} />
          <SectionList>
            <ListItem
              title="Test"
              subtitle="Test subtitle"
              linkTo={{ screen: 'Teaching' }}
            />
            <ListItem title="Test" subtitle="Test subtitle" />
            <ListItem title="Test" subtitle="Test subtitle" />
            <ListItem title="Test" subtitle="Test subtitle" />
          </SectionList>
        </View>
        <View style={styles.section}>
          <SectionHeader title={t('Exams')} linkTo={{ screen: 'Teaching' }} />
          <View style={{ padding: 18 }}>
            <View style={{ flexDirection: 'row', marginBottom: 18 }}>
              <MetricCard
                name="Title"
                value="Metric"
                style={{ marginRight: 18 }}
              />
              <MetricCard name="Title" value="Metric" />
            </View>
            <View style={{ flexDirection: 'row' }}>
              <MetricCard
                name="Title"
                value="Metric"
                style={{ marginRight: 18 }}
              />
              <MetricCard name="Title" value="Metric" />
            </View>
          </View>
        </View>
        <View style={styles.section}>
          <SectionHeader
            title={t('Transcript')}
            linkTo={{ screen: 'Teaching' }}
          />
          <AgendaCard
            title="Physics 1"
            style={{ margin: 18 }}
            time="08:30"
            subtitle="Lesson"
          >
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Atque
            libero maxime quia ratione suscipit.
          </AgendaCard>
        </View>
        <View style={{ height: 2000 }}></View>
      </View>
    </ScrollView>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionsContainer: {
      display: 'flex',
      paddingVertical: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
  });
