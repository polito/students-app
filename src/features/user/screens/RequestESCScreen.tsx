import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native';

import { Card } from '@lib/ui/components/Card.tsx';
import { CtaButton, CtaButtonSpacer } from '@lib/ui/components/CtaButton';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { ScreenTitle } from '@lib/ui/components/ScreenTitle';
import { Text } from '@lib/ui/components/Text';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet';
import { useTheme } from '@lib/ui/hooks/useTheme';
import { Theme } from '@lib/ui/types/Theme';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useRequestEsc } from '../../../core/queries/escHooks.ts';
import { UserStackParamList } from '../components/UserNavigator.tsx';

type Props = NativeStackScreenProps<UserStackParamList, 'RequestESC'> &
  PropsWithChildren<ViewProps>;

export const RequestESCScreen = ({ navigation, ...rest }: Props) => {
  const styles = useStylesheet(createStyles);
  const { spacing } = useTheme();
  const { t } = useTranslation();
  const { mutateAsync: requestEsc, isLoading: mutationsLoading } =
    useRequestEsc();

  const onSubmit = async () => {
    requestEsc()
      .then(() => {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'Profile',
              params: {
                firstRequest: true,
              },
            },
          ],
        });
      })
      .catch(_ => {
        Alert.alert(t('common.error'), t('common.somethingWentWrong'));
      });
  };

  const itemList = [
    t('escRequestScreen.secondSectionList.first'),
    t('escRequestScreen.secondSectionList.second'),
    t('escRequestScreen.secondSectionList.third'),
    t('escRequestScreen.secondSectionList.fourth'),
  ];

  const itemListCard = [
    t('escRequestScreen.cardRequest.firstName'),
    t('escRequestScreen.cardRequest.lastName'),
    t('escRequestScreen.cardRequest.id'),
    t('escRequestScreen.cardRequest.mail'),
    t('escRequestScreen.cardRequest.studyProgram'),
  ];

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <View style={styles.container}>
          <ScreenTitle
            style={{ marginVertical: spacing[2] }}
            title={t('escRequestScreen.firstTitle')}
          />
          <OverviewList style={styles.overviewList}>
            <Text style={{ padding: spacing[5] }}>
              {t('escRequestScreen.firstSection')}
            </Text>
          </OverviewList>
          <ScreenTitle
            style={{ marginVertical: spacing[3] }}
            title={t('escRequestScreen.secondTitle')}
          />
          <OverviewList style={styles.overviewList}>
            <View style={{ padding: spacing[5] }}>
              <Text>{t('escRequestScreen.secondSection')}</Text>
              <View style={{ paddingLeft: spacing[2] }}>
                {itemList.map((text, index) => (
                  <View style={styles.listItem} key={index}>
                    <Text>{`\u2022`} </Text>
                    <View style={styles.text}>
                      <Text
                        accessibilityLabel={text}
                        style={{ flexWrap: 'wrap' }}
                      >
                        {text}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </OverviewList>
          <Card
            accessible={Platform.select({ android: true, ios: false })}
            rounded
            spaced={false}
            translucent={false}
            style={styles.card}
            {...rest}
          >
            <View style={{ padding: spacing[5] }}>
              <Text style={styles.cardText}>
                {t('escRequestScreen.cardRequest.firstSectionNormalText')}{' '}
                <Text style={[styles.listItemBold, styles.cardText]}>
                  {t('escRequestScreen.cardRequest.sectionBoldText')}{' '}
                </Text>
                {t('escRequestScreen.cardRequest.secondSectionNormalText')}
              </Text>
              <View style={{ paddingLeft: spacing[3] }}>
                {itemListCard.map((text, index) => (
                  <View style={styles.listItem} key={index}>
                    <Text style={styles.cardText}>{`\u2022`} </Text>
                    <View style={styles.text}>
                      <Text
                        accessibilityLabel={text}
                        style={[{ flexWrap: 'wrap' }, styles.cardText]}
                      >
                        {text}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>
        </View>
        <CtaButton
          title={t('escRequestScreen.authorize')}
          action={onSubmit}
          absolute={false}
          containerStyle={{ paddingBottom: spacing[1.5] }}
          loading={mutationsLoading}
        />
        <CtaButton
          title={t('common.cancel')}
          action={() => navigation.pop()}
          absolute={false}
          variant="outlined"
        />
        <CtaButtonSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const createStyles = ({ dark, palettes, spacing, fontWeights }: Theme) =>
  StyleSheet.create({
    container: {
      padding: spacing[5],
    },
    card: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: palettes.orange[dark ? 500 : 600],
      justifyContent: 'center',
    },
    cardText: {
      color: palettes.orange[dark ? 500 : 700],
    },
    screenTitle: {
      marginBottom: spacing[7],
    },
    overviewList: {
      marginHorizontal: 0,
      borderRadius: 8,
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    listItemBold: {
      fontWeight: fontWeights.bold,
    },
    text: {
      flexDirection: 'column',
      marginRight: spacing[2.5],
    },
  });
