import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';
import { openCamera } from 'react-native-image-crop-picker';

import { faFilePdf, faUpload } from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import {
  isErrorWithCode,
  keepLocalCopy,
  pick,
} from '@react-native-documents/picker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';
import { pdfSizes } from '../constants';
import { Assignment } from '../types/Assignment';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUpload'
>;

export const CourseAssignmentUploadScreen = ({ navigation, route }: Props) => {
  const { courseId } = route.params;
  const { t } = useTranslation();
  const { fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);

  const takePicture = () =>
    openCamera({
      ...pdfSizes,
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
      includeBase64: true,
    });

  const handlePickedFile = (file: Assignment) => {
    navigation.navigate('CourseAssignmentUploadConfirmation', {
      courseId,
      file,
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={styles.screen}
    >
      <OverviewList indented>
        <ListItem
          isAction
          title={t('courseAssignmentUploadScreen.ctaUploadFile')}
          subtitle={t('courseAssignmentUploadScreen.ctaUploadFileSubtitle')}
          leadingItem={<Icon icon={faUpload} size={fontSizes.xl} />}
          onPress={async () => {
            try {
              const [response] = await pick();
              const [localCopy] = await keepLocalCopy({
                files: [
                  {
                    uri: response.uri,
                    fileName: response.name || '',
                  },
                ],
                destination: 'cachesDirectory',
              });
              if (localCopy.status !== 'success') {
                throw new Error('File upload failed');
              }
              handlePickedFile({
                uri: localCopy.localUri,
                name: response.name || '',
                size: response.size || 0,
                type: response.type || '',
              });
            } catch (e) {
              if (!isErrorWithCode(e)) {
                console.error(e);
              }
            }
          }}
        />
        <ListItem
          isAction
          title={t('courseAssignmentUploadScreen.ctaCreatePDF')}
          subtitle={t('courseAssignmentUploadScreen.ctaCreatePDFSubtitle')}
          leadingItem={<Icon icon={faFilePdf} size={fontSizes.xl} />}
          onPress={async () => {
            try {
              const image = await takePicture();
              navigation.navigate('CourseAssignmentPdfCreation', {
                courseId,
                firstImageUri: image.path,
              });
            } catch (e) {
              console.error(e);
            }
          }}
        />
      </OverviewList>
    </ScrollView>
  );
};

const createStyles = ({ colors, shapes, spacing }: Theme) =>
  StyleSheet.create({
    screen: {
      paddingTop: spacing[2],
    },
    uploadAction: {
      borderRadius: shapes.sm,
      backgroundColor: colors.surface,
      marginHorizontal: spacing[4],
      marginVertical: spacing[2],
      padding: spacing[4],
    },
    innerContainer: {
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  });
