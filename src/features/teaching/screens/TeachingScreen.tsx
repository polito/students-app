import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../../../core/components/SectionHeader';

export const TeachingScreen = () => {
  const { t } = useTranslation();
  return (
    <View>
      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <SectionHeader title={t('Courses')} linkTo={{ screen: 'Teaching' }} />
          <Text>Lorem ipsum dolor sit amet</Text>
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
