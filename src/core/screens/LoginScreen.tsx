import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
} from 'react-native';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { SectionList } from '@lib/ui/components/SectionList';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { Theme } from '@lib/ui/types/theme';

import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const styles = useStylesheet(createStyles);
  const { mutate: login, isLoading } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>();

  const handleLogin = () => login({ username, password });

  return (
    <>
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustKeyboardInsets
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Section style={styles.section}>
            <ScreenTitle title={t('loginScreen.title')} style={styles.title} />
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
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  handleLogin();
                }}
                editable={!isLoading}
                style={styles.textField}
              />
            </SectionList>
            <CtaButton
              absolute={false}
              title={t('loginScreen.cta')}
              action={handleLogin}
              loading={isLoading}
              successMessage={t('loginScreen.ctaSuccessMessage')}
              disabled={!username?.length || !password?.length}
            />
          </Section>
        </TouchableWithoutFeedback>
      </ScrollView>
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
      marginBottom: spacing[3],
      marginHorizontal: spacing[5],
    },
    textField: {
      paddingHorizontal: Platform.select({
        android: spacing[4],
      }),
    },
  });
