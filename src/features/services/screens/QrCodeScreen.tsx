import { useState } from 'react';
import { View } from 'react-native';
import {
  Camera,
  CodeType,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';

import { Text } from '@lib/ui/components/Text';

export const QrCodeScreen = () => {
  const { hasPermission, requestPermission } = useCameraPermission();
  const [codeValue, setCodeValue] = useState('');

  const device = useCameraDevice('back');
  const codeTypes: CodeType[] = [
    'code-128',
    'code-39',
    'code-93',
    'codabar',
    'ean-13',
    'ean-8',
    'itf',
    'upc-e',
    'upc-a',
    'qr',
    'pdf-417',
    'aztec',
    'data-matrix',
  ];
  const codeScanner = useCodeScanner({
    codeTypes: codeTypes,
    onCodeScanned: code => {
      if (code && code[0].value) setCodeValue(code[0].value);
    },
  });

  if (!hasPermission) requestPermission();
  if (device == null) {
    return (
      <View>
        <Text weight="medium">device error</Text>
      </View>
    );
  }
  return (
    <View>
      {hasPermission && (
        <>
          <Camera
            device={device}
            isActive={true}
            codeScanner={codeScanner}
            photoQualityBalance="speed"
            style={{ width: 500, height: 500 }}
          />
          <Text weight="medium">{codeValue}</Text>
        </>
      )}
    </View>
  );
};
