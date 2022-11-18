import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableHighlight,
  View,
  ViewToken,
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
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

export const CourseAssignmentPdfCreationScreen = ({
  navigation,
  route,
}: Props) => {
  const { courseId, firstImageUri } = route.params;

  const [imageUris, setImageUris] = useState<string[]>([firstImageUri]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);

  const pageSliderRef = useRef<FlatList>();

  useEffect(() => {
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
        setImageUris(oldUris => [...oldUris, image.path]);
      })
      .catch(e => {
        console.log(e);
      });
  };

  const deletePage = () => {
    cleanSingle(imageUris[currentPageIndex])
      .then(() => {
        const currentPageCount = imageUris.length;
        if (currentPageCount === 1) {
          navigation.goBack();
          return;
        }

        setImageUris(oldUris => {
          return oldUris.filter((uri, index) => index !== currentPageIndex);
        });

        if (currentPageCount - 1 === currentPageIndex) {
          pageSliderRef.current.scrollToIndex({
            animated: true,
            index: currentPageIndex - 1,
          });
        }
      })
      .catch(e => {
        console.error(e);
      });
  };

  const createPdf = async () => {
    const pages = imageUris.map(
      uri =>
        `<img style='width: 100vw; height: 100vh; object-fit: contain' src='${uri}'/>`,
    );

    RNHTMLtoPDF.convert({
      fileName: 'assignment',
      html: pages.join(''),
    }).then(pdf => {
      navigation.navigate('CourseAssignmentUploadConfirmation', {
        courseId,
        fileUri: pdf.filePath,
      });
    });
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
      <Text variant="secondaryText" style={styles.pageNumber}>
        {t('courseAssignmentPdfCreationScreen.pageNumber', {
          index: currentPageIndex + 1,
          count: imageUris.length,
        })}
      </Text>
      <Animated.FlatList
        ref={pageSliderRef}
        data={imageUris}
        horizontal
        pagingEnabled
        keyExtractor={item => item}
        onViewableItemsChanged={onViewableItemsChanged.current}
        renderItem={({ item }) => (
          <View style={styles.page}>
            <Image
              resizeMode="contain"
              source={{ uri: item }}
              style={styles.pageImage}
            />
          </View>
        )}
        contentContainerStyle={styles.sliderContentContainer}
        extraData={imageUris}
      />
      <View style={styles.actionsContainer}>
        <Action
          iconName="add"
          label={t('courseAssignmentPdfCreationScreen.ctaAddPage')}
          onPress={addPage}
        />
        <Action
          iconName="trash"
          label={t('courseAssignmentPdfCreationScreen.ctaDeletePage')}
          onPress={deletePage}
        />
        <Action
          iconName="checkmark-outline"
          label={t('courseAssignmentPdfCreationScreen.ctaConfirm')}
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
    sliderContentContainer: {
      alignItems: 'center',
    },
    page: {
      width: windowDimensions.width - PAGE_MARGIN * 2,
      height: (windowDimensions.width - PAGE_MARGIN * 2) * 1.42,
      marginHorizontal: PAGE_MARGIN,
      backgroundColor: '#ffffff',
      padding: 10,
    },
    pageImage: {
      flexGrow: 1,
    },
    pageNumber: {
      position: 'absolute',
      top: 20,
      left: 20,
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
