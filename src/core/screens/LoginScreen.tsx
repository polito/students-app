import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Platform,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import * as Keychain from 'react-native-keychain';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { useApiContext } from '../contexts/ApiContext';
import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { mutateAsync: login, isLoading, isSuccess, data } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>();
  const { refreshContext } = useApiContext();

  const onLoginButtonPressed = async () => {
    try {
      const {
        data: { clientId, token },
      } = await login({ username, password });
      await Keychain.setGenericPassword(clientId, token);
      refreshContext(token);
    } catch (e) {
      // TODO feedback
    }
  };

  return (
    <>
      <KeyboardAwareScrollView contentInsetAdjustmentBehavior="automatic">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Section style={styles.section}>
            <SectionHeader
              title={t('loginScreen.title')}
              titleStyle={styles.title}
              ellipsizeTitle={false}
            />
            <SectionList style={styles.sectionList}>
              <TextField
                label={t('loginScreen.usernameLabel')}
                value={username}
                onChangeText={setUsername}
                editable={!isLoading}
                returnKeyType="next"
                onSubmitEditing={() => {
                  passwordRef.current.focus();
                }}
                style={styles.textField}
              />
              <TextField
                inputRef={passwordRef}
                type="password"
                label={t('loginScreen.passwordLabel')}
                onChangeText={setPassword}
                value={password}
                returnKeyType="done"
                editable={!isLoading}
                style={styles.textField}
              />
            </SectionList>
            <CtaButton
              absolute={false}
              adjustInsets={Platform.OS === 'ios'}
              title={t('loginScreen.cta')}
              onPress={onLoginButtonPressed}
              loading={isLoading}
              success={isSuccess}
              successMessage={t('loginScreen.ctaSuccessMessage')}
            />
          </Section>
        </TouchableWithoutFeedback>
      </KeyboardAwareScrollView>
    </>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    section: {
      marginTop: spacing[32],
    },
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
    title: {
      fontSize: fontSizes['3xl'],
      marginBottom: spacing[8],
    },
    textField: {
      paddingHorizontal: Platform.select({
        android: spacing[4],
      }),
    },
  });
