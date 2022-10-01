import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Image, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as SecureStore from 'expo-secure-store';

import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useTheme } from '@lib/ui/hooks/useTheme';

import { SECURE_STORE_TOKEN_KEY, useApiContext } from '../contexts/ApiContext';
import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { mutate: handleLogin, isLoading, data } = useLogin();
  const { colors, spacing } = useTheme();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { refreshContext } = useApiContext();

  const onLoginButtonPressed = () => {
    handleLogin({ username, password });
  };

  const onSuccessfulLogin = async token => {
    await SecureStore.setItemAsync(SECURE_STORE_TOKEN_KEY, token);
    refreshContext(token);
  };

  useEffect(() => {
    if (data?.data.token) {
      onSuccessfulLogin(data.data.token).catch(e => {
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
          label={t('Matricola')}
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
          label={t('Password')}
          onChangeText={setPassword}
          value={password}
          editable={!isLoading}
        />
        <Button
          title={t('Login')}
          color={colors.heading}
          disabled={isLoading}
          onPress={onLoginButtonPressed}
        />
      </View>
    </SafeAreaView>
  );
};
