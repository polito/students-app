import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, TouchableHighlight, View } from 'react-native';
import DocumentPicker, { isInProgress } from 'react-native-document-picker';
import { openCamera } from 'react-native-image-crop-picker';

import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faCamera,
  faFilePdf,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { Icon } from '@lib/ui/components/Icon';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useBottomBarAwareStyles } from '../../../core/hooks/useBottomBarAwareStyles';
import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUpload'
>;

export const CourseAssignmentUploadScreen = ({ navigation, route }: Props) => {
  const { courseId } = route.params;

  const bottomBarAwareStyles = useBottomBarAwareStyles();
  const styles = useStylesheet(createStyles);

  const { t } = useTranslation();

  const takePicture = () =>
    openCamera({
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
    });

  const handlePickedFile = (fileUri: string) => {
    navigation.navigate('CourseAssignmentUploadConfirmation', {
      courseId,
      fileUri,
    });
  };

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      style={[bottomBarAwareStyles, styles.screen]}
    >
      <AssignmentUploadAction
        title={t('courseAssignmentUploadScreen.ctaUploadFile')}
        subtitle={t('courseAssignmentUploadScreen.ctaUploadFileSubtitle')}
        icon={faUpload}
        onPress={() => {
          DocumentPicker.pickSingle({
            copyTo: 'cachesDirectory',
          })
            .then(response => {
              handlePickedFile(response.fileCopyUri);
            })
            .catch(e => {
              if (DocumentPicker.isCancel(e) || isInProgress(e)) return;
              console.error(e);
            });
        }}
      />
      <AssignmentUploadAction
        title={t('courseAssignmentUploadScreen.ctaTakePicture')}
        subtitle={t('courseAssignmentUploadScreen.ctaTakePictureSubtitle')}
        icon={faCamera}
        onPress={() => {
          takePicture()
            .then(image => {
              handlePickedFile(image.path);
            })
            .catch(e => {
              console.log(e);
            });
        }}
      />
      <AssignmentUploadAction
        title={t('courseAssignmentUploadScreen.ctaCreatePDF')}
        subtitle={t('courseAssignmentUploadScreen.ctaCreatePDFSubtitle')}
        icon={faFilePdf}
        onPress={() => {
          takePicture()
            .then(image => {
              navigation.navigate('CourseAssignmentPdfCreation', {
                courseId,
                firstImageUri: image.path,
              });
            })
            .catch(e => {
              console.log(e);
            });
        }}
      />
    </ScrollView>
  );
};

interface ActionProps {
  title: string;
  subtitle: string;
  icon: IconDefinition;
  onPress: () => void;
}

const AssignmentUploadAction = ({
  title,
  subtitle,
  icon,
  onPress,
}: ActionProps) => {
  const styles = useStylesheet(createStyles);
  const { colors, fontSizes } = useTheme();
  return (
    <TouchableHighlight
      style={styles.uploadAction}
      underlayColor={colors.touchableHighlight}
      onPress={onPress}
    >
      <View style={styles.innerContainer}>
        <View>
          <Text variant="title">{title}</Text>
          <Text variant="secondaryText">{subtitle}</Text>
        </View>
        <Icon
          icon={icon}
          size={fontSizes['3xl']}
          color={colors.secondary[600]}
        />
      </View>
    </TouchableHighlight>
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
