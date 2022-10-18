import { ScrollView, StyleSheet, TouchableHighlight, View } from 'react-native';
import DocumentPicker, { isInProgress } from 'react-native-document-picker';
import { launchCamera } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';

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
        title={'Carica un file'}
        subtitle={'sul tuo dispositivo o dal cloud'}
        iconName="document-attach-outline"
        onPress={() => {
          DocumentPicker.pickSingle({
            copyTo: 'cachesDirectory',
          })
            .then(response => {
              console.log(response);
              handlePickedFile(response.fileCopyUri);
            })
            .catch(e => {
              if (DocumentPicker.isCancel(e) || isInProgress(e)) return;
              console.error(e);
            });
        }}
      />
      <AssignmentUploadAction
        title={'Scatta una foto'}
        subtitle={'con la fotocamera del telefono'}
        iconName="camera-outline"
        onPress={() => {
          launchCamera({
            mediaType: 'photo',
          }).then(response => {
            if (response.didCancel) return;
            if (response.errorCode) {
              console.error(response.errorMessage);
              return;
            }
            handlePickedFile(response.assets[0].uri);
          });
        }}
      />
      <AssignmentUploadAction
        title={'Scansiona un documento'}
        subtitle={'crea un file pdf'}
        iconName="scan-outline"
        onPress={() => {}}
      />
    </ScrollView>
  );
};

interface ActionProps {
  title: string;
  subtitle: string;
  iconName: string;
  onPress: () => void;
}

const AssignmentUploadAction = ({
  title,
  subtitle,
  iconName,
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
          name={iconName}
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
