import { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
