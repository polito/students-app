import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, StyleSheet, TextInput, View } from 'react-native';
import * as Keychain from 'react-native-keychain';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SectionList } from '@lib/ui/components/SectionList';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/theme';
import { useHeaderHeight } from '@react-navigation/elements';

import { useApiContext } from '../contexts/ApiContext';
import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { fontSizes, spacing } = useTheme();
  const styles = useStylesheet(createStyles);
  const { mutate: handleLogin, isLoading, isSuccess, data } = useLogin();
  const headerHeight = useHeaderHeight();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef<TextInput>();
  const { refreshContext } = useApiContext();

  const onLoginButtonPressed = () => {
    handleLogin({ username, password });
  };

  const onSuccessfulLogin = async (clientId: string, token: string) => {
    await Keychain.setGenericPassword(clientId, token);
    refreshContext(token);
  };

  useEffect(() => {
    if (data?.data.token) {
      onSuccessfulLogin(data.data.clientId, data.data.token).catch(e => {
        // TODO handle error
      });
    }
  }, [data]);

  return (
    <View
      style={{
        flex: 1,
        marginTop: '30%',
        paddingTop: headerHeight,
      }}
    >
      <Section>
        <SectionHeader
          title={t('loginScreen.title')}
          titleStyle={{
            fontSize: fontSizes['3xl'],
            marginBottom: spacing[8],
          }}
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
      </Section>
      <CtaButton
        absolute={false}
        adjustInsets={Platform.OS === 'ios'}
        title={t('loginScreen.cta')}
        onPress={onLoginButtonPressed}
        loading={isLoading}
        success={isSuccess}
        successMessage={t('loginScreen.ctaSuccessMessage')}
      />
    </View>
  );
};

const createStyles = ({ spacing }: Theme) =>
  StyleSheet.create({
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
    textField: {
      paddingHorizontal: Platform.select({
        android: spacing[4],
      }),
    },
  });
