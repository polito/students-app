import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Pdf } from 'react-native-pdf-light';

import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FullWidthPicture } from '@lib/ui/components/FullWidthPicture';
import { IconButton } from '@lib/ui/components/IconButton';
import { TextButton } from '@lib/ui/components/TextButton';
import { TranslucentTextField } from '@lib/ui/components/TranslucentTextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useFeedbackContext } from '../../../core/contexts/FeedbackContext';
import { useUploadAssignment } from '../../../core/queries/courseHooks';
import { TeachingStackParamList } from '../../teaching/components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentUploadConfirmation'
>;

const toolbarHeight = 46;

export const CourseAssignmentUploadConfirmationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId, file } = route.params;
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const { mutateAsync: requestUpload } = useUploadAssignment(courseId);
  const styles = useStylesheet(createStyles);
  const { setFeedback } = useFeedbackContext();

  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(() => {
    if (!description) {
      setFeedback({
        text: t(
          'courseAssignmentUploadConfirmationScreen.emptyDescriptionError',
        ),
        isError: true,
      });
      return;
    }

    setIsUploading(true);

    requestUpload({
      courseId,
      description,
      file: file as any as Blob,
    })
      .then(() => {
        setFeedback({
          text: t('courseAssignmentUploadConfirmationScreen.successFeedback'),
        });

        let isAssignmentsScreenReached = false;

        // Count how many screens to pop
        let popCount = 0;

        navigation.getState().routes.forEach(r => {
          if (isAssignmentsScreenReached) {
            popCount++;
          }
          if (r.name === 'Course') {
            isAssignmentsScreenReached = true;
          }
          return;
        });

        // Reset navigation stack to the assignments screen
        navigation.pop(popCount);
      })
      .catch((e: Error) => {
        setFeedback({ text: e.message, isError: true });
      })
      .finally(() => setIsUploading(false));
  }, [courseId, description, file, navigation, requestUpload, setFeedback, t]);

  useEffect(() => {
    const iconButton = (
      <IconButton
        icon={faPaperPlane}
        size={fontSizes.xl}
        color={colors.heading}
        onPress={uploadFile}
        disabled={isUploading}
        loading={isUploading}
        accessibilityLabel={t(
          'courseAssignmentUploadConfirmationScreen.ctaUpload',
        )}
      />
    );

    navigation.setOptions({
      headerRight: () =>
        Platform.select({
          android: iconButton,
          ios: isUploading ? (
            iconButton
          ) : (
            <TextButton onPress={uploadFile}>
              {t('courseAssignmentUploadConfirmationScreen.ctaUpload')}
            </TextButton>
          ),
        }),
    });
  }, [colors.heading, fontSizes.xl, isUploading, navigation, t, uploadFile]);

  return (
    <>
      <View
        style={[
          {
            height: toolbarHeight,
          },
          styles.toolbar,
        ]}
      >
        <TranslucentTextField
          autoFocus={true}
          label={t('courseAssignmentUploadConfirmationScreen.descriptionLabel')}
          autoCorrect={false}
          value={description}
          onChangeText={value => setDescription(value)}
          autoCapitalize="sentences"
        />
      </View>

      {file.uri!.endsWith('pdf') && <Pdf source={file.uri} />}
      {/\.jpe?g|gif|png|heic$/i.test(file.uri) && (
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          automaticallyAdjustKeyboardInsets
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.imageScrollContainer}
        >
          <FullWidthPicture source={{ uri: file.uri }} />
        </ScrollView>
      )}
    </>
  );
};
const createStyles = ({ colors, spacing }: Theme) =>
  StyleSheet.create({
    imageScrollContainer: {
      paddingVertical: spacing[5],
    },
    toolbar: {
      justifyContent: 'space-between',
      backgroundColor: Platform.select({
        ios: colors.headersBackground,
        android: colors.surface,
      }),
      borderBottomWidth: Platform.select({
        ios: StyleSheet.hairlineWidth,
      }),
      borderBottomColor: colors.divider,
      elevation: 3,
    },
  });
