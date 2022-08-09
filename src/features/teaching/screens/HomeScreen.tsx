import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../../../core/components/SectionHeader';

export const HomeScreen = () => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Courses' }} />
          <Text>Lorem ipsum dolor sit amet</Text>
        </View>
        <View style={styles.section}>
          <SectionHeader title={t('Exams')} linkTo={{ screen: 'Exams' }} />
          <Text>Lorem ipsum dolor sit amet</Text>
        </View>
        <View style={styles.section}>
          <SectionHeader
            title={t('Transcript')}
            linkTo={{ screen: 'Grades' }}
          />
          <Text>Lorem ipsum dolor sit amet</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionsContainer: {
    display: 'flex',
    paddingVertical: 18,
  },
  section: {
    marginBottom: 24,
  },
});
