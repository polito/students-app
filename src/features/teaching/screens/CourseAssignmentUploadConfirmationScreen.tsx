import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { useUploadAssignment } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUploadConfirmation'
>;

export const CourseAssignmentUploadConfirmationScreen = ({ route }: Props) => {
  const { courseId, fileUri } = route.params;

  const uploadMutation = useUploadAssignment(courseId);

  const { t } = useTranslation();
  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);

  const [description, setDescription] = useState('');
  const uploadFile = () => {
    if (!description) return;

    fetch(fileUri)
      .then(response => response.blob())
      .then(file => {
        uploadMutation.mutate({
          courseId,
          description,
          file,
        });
      })
      .catch(e => console.log(e));
  };

  return (
    <View style={[bottomBarAwareStyles, styles.screen]}>
      <Section style={styles.formContainer}>
        <TextField
          label={t('courseAssignmentUploadConfirmationScreen.descriptionLabel')}
          value={description}
          onChangeText={setDescription}
          editable={!uploadMutation.isLoading}
          returnKeyType="send"
          onSubmitEditing={uploadFile}
        />
        <CtaButton
          title={t('courseAssignmentUploadConfirmationScreen.ctaUpload')}
          onPress={uploadFile}
          loading={uploadMutation.isLoading}
          success={uploadMutation.isSuccess}
        />
      </Section>
      {fileUri.endsWith('pdf') && (
        <Section style={styles.previewSection}>
          <SectionHeader
            title={t(
              'courseAssignmentUploadConfirmationScreen.previewSectionTitle',
            )}
          />
          <Pdf source={{ uri: fileUri }} style={styles.preview} />
        </Section>
      )}
      {/\.jpe?g|gif|png$/i.test(fileUri) && (
        <Section style={styles.previewSection}>
          <SectionHeader
            title={t(
              'courseAssignmentUploadConfirmationScreen.previewSectionTitle',
            )}
          />
          <Image
            source={{ uri: fileUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        </Section>
      )}
    </View>
  );
};
const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    formContainer: {
      paddingHorizontal: spacing[5],
    },
    screen: {
      paddingTop: spacing[5],
      flex: 1,
    },
    previewSection: {
      flex: 1,
      flexGrow: 1,
    },
    preview: {
      width: Dimensions.get('window').width,
      flexGrow: 1,
      marginTop: 5,
    },
  });
