import { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
} from 'react-native';

import { BottomBarSpacer } from '../../../src/core/components/BottomBarSpacer';

export const ScreenContainer = ({ children }: PropsWithChildren) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="always"
          keyboardShouldPersistTaps="handled"
        >
          {children}
          <BottomBarSpacer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
