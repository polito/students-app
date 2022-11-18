import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, TextInput, View } from 'react-native';
import * as Keychain from 'react-native-keychain';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CtaButton } from '@lib/ui/components/CtaButton';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { useApiContext } from '../contexts/ApiContext';
import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { mutate: handleLogin, isLoading, isSuccess, data } = useLogin();
  const { colors, spacing } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { refreshContext } = useApiContext();
  console.log('data', data);
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

  const passwordRef = useRef<TextInput>();

  return (
    <SafeAreaView
      style={{
        display: 'flex',
        alignItems: 'center',
        paddingHorizontal: spacing['5'],
      }}
    >
      <Image
        source={require('../../../assets/images/logo.png')}
        resizeMode="contain"
        style={{
          width: 250,
        }}
      />
      <Text
        variant="title"
        style={{ color: colors.heading, marginBottom: spacing[5] }}
      >
        Accedi con le tue credenziali polito.it
      </Text>
      <View
        style={{
          width: '100%',
        }}
      >
        <TextField
          label={t('loginScreen.usernameLabel')}
          value={username}
          onChangeText={setUsername}
          placeholder="s300000"
          editable={!isLoading}
          returnKeyType="next"
          onSubmitEditing={() => {
            passwordRef.current.focus();
          }}
        />
        <TextField
          inputRef={passwordRef}
          type="password"
          label={t('loginScreen.passwordLabel')}
          onChangeText={setPassword}
          value={password}
          editable={!isLoading}
        />
        <CtaButton
          title={t('loginScreen.cta')}
          onPress={onLoginButtonPressed}
          loading={isLoading}
          success={isSuccess}
        />
      </View>
    </SafeAreaView>
  );
};
