import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Keyboard,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { UnsupportedUserTypeError } from '../errors/UnsupportedUserTypeError';
import { useDeviceLanguage } from '../hooks/useDeviceLanguage';
import { useLogin } from '../queries/authHooks';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const { mutateAsync: login, isLoading } = useLogin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const canLogin = username?.length && password?.length;
  const language = useDeviceLanguage();

  const handleLogin = () =>
    login({
      username,
      password,
      preferences: { language },
    }).catch(e => {
      if (e instanceof UnsupportedUserTypeError) {
        Alert.alert(t('common.error'), t('loginScreen.unsupportedUserType'));
      } else {
        Alert.alert(
          t('loginScreen.authnError'),
          t('loginScreen.authnErrorDescription'),
        );
      }
    });

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Section style={styles.section}>
          <ScreenTitle title={t('loginScreen.title')} style={styles.title} />
          <OverviewList style={styles.sectionList} accessible={false}>
            <TextField
              accessible={true}
              textContentType="username"
              label={t('loginScreen.usernameLabel')}
              value={username}
              accessibilityLabel={t('loginScreen.usernameLabelAccessibility')}
              onChangeText={text => setUsername(text.trim())}
              editable={!isLoading}
              returnKeyType="next"
              onSubmitEditing={() => {
                passwordRef.current?.focus();
              }}
              style={styles.textFieldInput}
            />
            <Row align="center">
              <TextField
                accessible={true}
                inputRef={passwordRef}
                textContentType="password"
                type="password"
                label={t('loginScreen.passwordLabel')}
                accessibilityLabel={t('loginScreen.passwordLabelAccessibility')}
                onChangeText={setPassword}
                value={password}
                returnKeyType="done"
                secureTextEntry={!passwordVisible}
                onSubmitEditing={() => {
                  Keyboard.dismiss();
                  if (canLogin) {
                    handleLogin();
                  }
                }}
                editable={!isLoading}
                style={styles.textFieldInput}
              />
              <IconButton
                size={fontSizes.xl}
                icon={passwordVisible ? faEyeSlash : faEye}
                accessibilityLabel={t(
                  passwordVisible
                    ? 'loginScreen.hidePassword'
                    : 'loginScreen.showPassword',
                )}
                color={colors.secondaryText}
                style={styles.passwordToggle}
                onPress={() => setPasswordVisible(old => !old)}
              />
            </Row>
          </OverviewList>
          <CtaButton
            absolute={false}
            title={t('loginScreen.cta')}
            action={handleLogin}
            loading={isLoading}
            disabled={!canLogin}
          />
          <TouchableOpacity
            style={styles.link}
            onPress={() => {
              Linking.openURL(
                'https://idp.polito.it/Chpass/chpassservlet/main.htm?p_reset=Y',
              );
            }}
          >
            <Text variant="link">{t('loginScreen.forgotYourPassword')}</Text>
          </TouchableOpacity>
        </Section>
      </TouchableWithoutFeedback>
    </ScrollView>
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
    textFieldInput: {
      flex: 1,
      paddingHorizontal: Platform.select({
        android: spacing[4],
      }),
    },
    link: {
      alignItems: 'flex-end',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
    passwordToggle: {
      marginRight: spacing[2],
    },
  });
