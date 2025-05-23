import { useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { Text } from '@lib/ui/components/Text';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';

export const AccessibilitySettingsScreen = () => {
  const { t } = useTranslation();
  const { accessibility, updatePreference } = usePreferencesContext();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Col pv={5}>
          <Section>
            <SectionHeader
              title={t('accessibilitySettingsScreen.customFontSectionTitle')}
            />
            <OverviewList indented>
              <SwitchListItem
                title={t('accessibilitySettingsScreen.lineHeightTitle')}
                subtitle={t('accessibilitySettingsScreen.lineHeightSubtitle', {
                  height:
                    accessibility?.lineHeight === true
                      ? t('common.less')
                      : t('common.more'),
                })}
                value={accessibility?.lineHeight ?? false}
                onChange={value => {
                  updatePreference('accessibility', {
                    ...accessibility,
                    lineHeight: value,
                  });
                }}
              />
              <SwitchListItem
                title={t('accessibilitySettingsScreen.paragraphSpacingTitle')}
                subtitle={t(
                  'accessibilitySettingsScreen.paragraphSpacingSubtitle',
                  {
                    height:
                      accessibility?.paragraphSpacing === true
                        ? t('common.less')
                        : t('common.more'),
                  },
                )}
                value={accessibility?.paragraphSpacing ?? false}
                onChange={value => {
                  updatePreference('accessibility', {
                    ...accessibility,
                    paragraphSpacing: value,
                  });
                }}
              />
              <SwitchListItem
                title={t('accessibilitySettingsScreen.wordSpacingTitle')}
                subtitle={t('accessibilitySettingsScreen.wordSpacingSubtitle', {
                  height:
                    accessibility?.wordSpacing === true
                      ? t('common.less')
                      : t('common.more'),
                })}
                value={accessibility?.wordSpacing ?? false}
                onChange={value => {
                  updatePreference('accessibility', {
                    ...accessibility,
                    wordSpacing: value,
                  });
                }}
              />
            </OverviewList>
          </Section>
          <Section>
            <SectionHeader
              title={t('accessibilitySettingsScreen.exampleText')}
            />
            <Text
              variant="longProse"
              style={{ marginTop: 10, paddingHorizontal: 16 }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat
            </Text>
            <Text
              variant="longProse"
              style={{ marginTop: 10, paddingHorizontal: 16 }}
            >
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat
            </Text>
          </Section>
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};
