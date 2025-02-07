import { Dimensions, StyleSheet, View } from 'react-native';
import Pdf from 'react-native-pdf';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

type PdfStackParamList = {
  PdfViewer: {
    fileUrl: string; // Ensure this matches the expected type
  };
};

type Props = NativeStackScreenProps<PdfStackParamList, 'PdfViewer'>;
export const PdfViewerScreen = ({ route }: Props) => {
  const pdfUrl = route.params.fileUrl;

  return (
    <View style={styles.container}>
      <Pdf source={{ uri: pdfUrl }} style={styles.pdf} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 55,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 100,
  },
});
