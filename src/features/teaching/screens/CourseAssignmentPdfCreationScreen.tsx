import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewToken,
} from 'react-native';
import { cleanSingle, openCamera } from 'react-native-image-crop-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { TeachingStackParamList } from '../components/TeachingNavigator';

type Props = NativeStackScreenProps<
  TeachingStackParamList,
  'CourseAssignmentPdfCreation'
>;

const windowDimensions = Dimensions.get('window');
const PAGE_MARGIN = 20;

interface CroppedImage {
  uri: string;
  width: number;
  height: number;
}

export const CourseAssignmentPdfCreationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId } = route.params;

  const [images, setImages] = useState<CroppedImage[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  useEffect(() => {
    if (!images.length) addPage();
    navigation.getParent()?.setOptions({
      tabBarStyle: {
        display: 'none',
      },
    });
    return () =>
      navigation.getParent()?.setOptions({
        tabBarStyle: {
          display: 'flex',
        },
      });
  }, []);

  const addPage = () => {
    openCamera({
      mediaType: 'photo',
      cropping: true,
      freeStyleCropEnabled: true,
    })
      .then(image => {
        setImages(oldUris => [
          ...oldUris,
          {
            width: image.width,
            height: image.height,
            uri: image.path,
          },
        ]);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deletePage = () => {
    cleanSingle(images[currentPageIndex].uri)
      .then(() => {
        console.log('image removed');
        setImages(oldUris => {
          return [...oldUris.splice(currentPageIndex, 1)];
        });
      })
      .catch(e => {
        console.error(e);
      });
  };

  const createPdf = async () => {
    /* const pages = images.map((image) => PDFPage
       .create()
       .setMediaBox(image.width, image.height)
       .drawImage(image.uri))

     // TODO REPLACE with cache dir
     const docsDir = await PDFLib.getDocumentsDirectory();
     const pdfPath = `${docsDir}/sample.pdf`;

     PDFDocument
       .create(pdfPath)
       .addPages(pages)
       .write()
       .then(fileUri => {
         console.log('PDF created at: ' + fileUri);
         navigation.navigate('CourseAssignmentUploadConfirmation', {
           courseId,
           fileUri,
         });
       });*/
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length === 1) {
        setCurrentPageIndex(viewableItems[0].index);
      }
    },
  );

  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);

  const { bottom: marginBottom } = useSafeAreaInsets();

  return (
    <View style={[styles.screen, { marginBottom }]}>
      <Animated.FlatList
        data={images}
        horizontal
        pagingEnabled
        keyExtractor={item => item.uri}
        onViewableItemsChanged={onViewableItemsChanged.current}
        renderItem={({ item }) => (
          <Image
            resizeMode="center"
            source={{ uri: item.uri }}
            style={styles.page}
          />
        )}
        contentContainerStyle={styles.sliderContentContainer}
        extraData={images}
      />
      <View style={styles.actionsContainer}>
        <Action iconName="add" label="Add page" onPress={addPage} />
        <Action iconName="trash" label="Delete page" onPress={deletePage} />
        <Action
          iconName="checkmark-outline"
          label="Confirm"
          onPress={createPdf}
        />
      </View>
    </View>
  );
};

interface ActionProps {
  iconName: string;
  label: string;
  onPress: () => void;
}

const Action = ({ iconName, label, onPress }: ActionProps) => {
  const styles = useStylesheet(createStyles);
  const { colors } = useTheme();
  return (
    <TouchableHighlight
      onPress={onPress}
      style={styles.actionHighlight}
      underlayColor={colors.touchableHighlight}
    >
      <View style={styles.action}>
        <Icon name={iconName} style={styles.actionIcon} />
        <Text>{label}</Text>
      </View>
    </TouchableHighlight>
  );
};
const createStyles = ({ colors, fontSizes, spacing }: Theme) =>
  StyleSheet.create({
    screen: {
      flex: 1,
    },
    slider: {},
    sliderContentContainer: {
      alignItems: 'center',
    },
    page: {
      width: windowDimensions.width - PAGE_MARGIN * 2,
      height: (windowDimensions.width - PAGE_MARGIN * 2) * 1.42,
      marginHorizontal: PAGE_MARGIN,
      backgroundColor: '#ffffff',
    },
    actionsContainer: {
      display: 'flex',
      flexDirection: 'row',
    },
    actionHighlight: {
      flexGrow: 1,
      paddingVertical: spacing[3],
    },
    action: {
      display: 'flex',
      alignItems: 'center',
    },
    actionIcon: {
      fontSize: fontSizes['2xl'],
      color: colors.secondary[600],
    },
  });
