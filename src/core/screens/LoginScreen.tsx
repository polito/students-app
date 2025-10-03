import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { faEye, faEyeSlash } from '@fortawesome/free-regular-svg-icons';
import { CtaButton } from '@lib/ui/components/CtaButton';
import { IconButton } from '@lib/ui/components/IconButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Row } from '@lib/ui/components/Row';
import { Section } from '@lib/ui/components/Section';
import { Text } from '@lib/ui/components/Text';
import { TextField } from '@lib/ui/components/TextField';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';

import { PolitoLogo } from '~/core/components/Logo.tsx';
import { useAuth } from '~/core/hooks/useAuth.ts';

export const LoginScreen = () => {
  const { t } = useTranslation();
  const { colors, fontSizes } = useTheme();
  const styles = useStylesheet(createStyles);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const canLogin = username?.length && password?.length;
  const { handleBasicLogin, handleSSO, viewChpass, isLoading } = useAuth();

  const handleLogin = () => handleBasicLogin(username, password);

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.logoContainer}>
        <PolitoLogo width="100%" height="100%" />
      </View>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <Section style={styles.section}>
          <Text variant="title" role="heading" style={styles.title}>
            {t('loginScreen.title')}
          </Text>
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
          <TouchableOpacity style={styles.link} onPress={() => viewChpass()}>
            <Text variant="link" style={styles.textLink}>
              {t('loginScreen.forgotYourPassword')}
            </Text>
          </TouchableOpacity>
          <CtaButton
            absolute={false}
            title={t('loginScreen.cta')}
            action={handleLogin}
            loading={isLoading}
            disabled={!canLogin}
          />
          <TouchableOpacity
            style={styles.linkToSSO}
            onPress={() => handleSSO()}
          >
            <Text variant="link" style={styles.textLink}>
              {t('loginScreen.SSO')}
            </Text>
          </TouchableOpacity>
        </Section>
      </TouchableWithoutFeedback>
    </ScrollView>
  );
};

const createStyles = ({ spacing, fontSizes }: Theme) =>
  StyleSheet.create({
    logoContainer: {
      width: '30%',
      aspectRatio: 120 / 168,
      alignSelf: 'center',
      marginTop: spacing[24],
    },
    section: {
      marginTop: spacing[8],
    },
    sectionList: {
      paddingBottom: Platform.select({ android: spacing[4] }),
    },
    title: {
      textAlign: 'center',
      fontSize: fontSizes.lg,
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
      marginBottom: spacing[8],
    },
    linkToSSO: {
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
    passwordToggle: {
      marginRight: spacing[2],
    },
    textLink: { textDecorationLine: 'underline' },
  });
