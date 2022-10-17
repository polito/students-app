import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Pdf from 'react-native-pdf';

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
    <ScrollView style={[bottomBarAwareStyles, styles.screen]}>
      <Section>
        <SectionHeader title={t('Confirm upload')} />
        <View style={styles.formContainer}>
          <TextField
            label={t('Assignment description')}
            value={description}
            onChangeText={setDescription}
            editable={!uploadMutation.isLoading}
            returnKeyType="send"
            onSubmitEditing={uploadFile}
          />
          <Button title="Upload assignment" onPress={uploadFile} />
        </View>
      </Section>
      {fileUri.endsWith('pdf') && (
        <Section>
          <SectionHeader title={t('File preview')} />
          <Pdf source={{ uri: fileUri }} style={styles.preview} />
        </Section>
      )}
      {/\.jpe?g|gif|png$/i.test(fileUri) && (
        <Section>
          <SectionHeader title={t('File preview')} />
          <Image
            source={{ uri: fileUri }}
            style={styles.preview}
            resizeMode="contain"
          />
        </Section>
      )}
    </ScrollView>
  );
};
const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    formContainer: {
      paddingHorizontal: spacing[5],
    },
    screen: {
      paddingTop: spacing[5],
    },
    preview: {
      flex: 1,
      width: Dimensions.get('window').width,
      height: 300,
    },
  });
