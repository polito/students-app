import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { ListItem } from '../../../../lib/ui/components/ListItem';
import { SectionHeader } from '../../../../lib/ui/components/SectionHeader';
import { SectionList } from '../../../../lib/ui/components/SectionList';
import { useStylesheet } from '../../../../lib/ui/hooks/useStylesheet';
import { Theme } from '../../../../lib/ui/types/theme';
import { useCollapsingHeader } from '../../../core/hooks/useCollapsingHeader';

export const TeachingScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const headerHeight = useHeaderHeight();
  const [count, setCount] = useState(0);
  const [initialHeaderHeight, setInitialHeaderHeight] = useState(headerHeight);
  const scrollViewProps = useCollapsingHeader();

  useEffect(() => {
    if (count < 2) {
      setInitialHeaderHeight(headerHeight);
      setCount(c => c + 1);
    }
  }, [headerHeight]);

  return (
    <ScrollView
      style={{ paddingTop: initialHeaderHeight }}
      {...scrollViewProps}
    >
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Teaching' }} />
          <SectionList>
            <ListItem title="Test" subtitle="Test subtitle" />
            <ListItem title="Test" subtitle="Test subtitle" />
            <ListItem title="Test" subtitle="Test subtitle" />
            <ListItem title="Test" subtitle="Test subtitle" />
          </SectionList>
        </View>
        <View style={styles.section}>
          <SectionHeader title={t('Exams')} linkTo={{ screen: 'Teaching' }} />
          <Text>Lorem ipsum dolor sit amet</Text>
        </View>
        <View style={styles.section}>
          <SectionHeader
            title={t('Transcript')}
            linkTo={{ screen: 'Teaching' }}
          />
          <Text>Lorem ipsum dolor sit amet</Text>
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
