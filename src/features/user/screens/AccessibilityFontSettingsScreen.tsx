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
              {/* <CustomFontListItem
                t={t}
                value={accessibility?.fontFamily}
                onUpdate={e => {
                  if (
                    e === 'default' ||
                    e === 'open-dyslexic' ||
                    e === 'dyslexie' ||
                    e === 'easy-reading' ||
                    e === 'sylexiad'
                  ) {
                    return updatePreference('accessibility', {
                      ...accessibility,
                      fontFamily: e,
                    });
                  }
                }}
              /> */}
              {/* <CustomFontPlacementListItem
                t={t}
                value={accessibility?.fontPlacement}
                onUpdate={e => {
                  if (e === 'none' || e === 'all-text' || e === 'long-text')
                    return updatePreference('accessibility', {
                      ...accessibility,
                      fontPlacement: e,
                    });
                }}
              /> */}
              {/* <CustomFontSizeListItem
                t={t}
                value={accessibility?.fontSize?.toString()}
                onUpdate={e => {
                  if (
                    Number(e) === 100 ||
                    Number(e) === 125 ||
                    Number(e) === 150 ||
                    Number(e) === 175 ||
                    Number(e) === 200
                  )
                    return updatePreference('accessibility', {
                      ...accessibility,
                      fontSize: e,
                    });
                }}
              /> */}
              <SwitchListItem
                title={t('accessibilitySettingsScreen.lineHeightTitle')}
                subtitle={t('accessibilitySettingsScreen.lineHeightSubtitle', {
                  height:
                    accessibility?.lineHeight === true
                      ? t('common.less')
                      : t('common.more'),
                })}
                value={
                  (accessibility?.lineHeight &&
                    accessibility?.fontPlacement === 'long-text') ??
                  false
                }
                onChange={value => {
                  return updatePreference('accessibility', {
                    ...accessibility,
                    fontPlacement: 'long-text',
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
                value={
                  (accessibility?.paragraphSpacing &&
                    accessibility?.fontPlacement === 'long-text') ??
                  false
                }
                onChange={value => {
                  return updatePreference('accessibility', {
                    ...accessibility,
                    fontPlacement: 'long-text',
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
                value={
                  (accessibility?.wordSpacing &&
                    accessibility?.fontPlacement === 'long-text') ??
                  false
                }
                onChange={value => {
                  return updatePreference('accessibility', {
                    ...accessibility,
                    fontPlacement: 'long-text',
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
          {/* <Section>
            <SectionHeader
              title={t('accessibilitySettingsScreen.customThemeSectionTitle')}
            />
            <OverviewList indented>
              <SwitchListItem
                title={t('accessibilitySettingsScreen.highContrastTitle')}
                value={accessibility?.highContrast ?? true}
                onChange={value => {
                  // TODO
                }}
              />
              <SwitchListItem
                title={t('accessibilitySettingsScreen.greyscaleTitle')}
                value={accessibility?.grayscale ?? false}
                onChange={value => {
                  // TODO
                }}
              />
            </OverviewList>
          </Section> */}
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

// const CustomFontListItem = ({ t, value, onUpdate }: AccessibilityItemProps) => {
//   const choices = useMemo(() => {
//     return [
//       {
//         label: 'Montserrat (default)',
//         value: 'default',
//       },
//       {
//         label: 'Open Dyslexic',
//         value: 'open-dyslexic',
//       },
//       {
//         label: 'Dyslexie',
//         value: 'dyslexie',
//       },
//       {
//         label: 'EasyReading',
//         value: 'easy-reading',
//       },
//       {
//         label: 'Sylexiad',
//         value: 'sylexiad',
//       },
//     ];
//   }, []);

//   const effectiveValue = useMemo(() => {
//     return value || 'default';
//   }, [value]);

//   const effectiveLabel = useMemo(() => {
//     return effectiveValue.replace('-', ' ');
//   }, [effectiveValue]);

//   const actions: MenuAction[] = useMemo(() => {
//     return choices.map(cc => {
//       const actionValue = cc.value.endsWith('(default)') ? 'default' : cc.value;
//       return {
//         id: actionValue,
//         title: cc.label,
//         state: actionValue === effectiveValue ? 'on' : undefined,
//       };
//     });
//   }, [effectiveValue, choices]);
//   return (
//     <MenuView
//       title={t(`accessibilitySettingsScreen.customFontAction`)}
//       actions={actions}
//       onPressAction={({ nativeEvent: { event } }) => {
//         onUpdate(event);
//       }}
//     >
//       <ListItem
//         isAction
//         title={t(`accessibilitySettingsScreen.customFontTitle`)}
//         subtitle={effectiveLabel}
//         // // subtitleProps={{ capitalize: true }}
//         /* TODO accessibilityLabel={`${t('common.language')}: ${t(
//           `common.${language}`,
//         )}. ${t('settingsScreen.openLanguageMenu')}`}*/
//       />
//     </MenuView>
//   );
// };
// const CustomFontSizeListItem = ({
//   t,
//   value,
//   onUpdate,
// }: AccessibilityItemProps) => {
//   const choices = useMemo(() => {
//     return [
//       {
//         label: '100%',
//         value: 100,
//       },
//       {
//         label: '125%',
//         value: 125,
//       },
//       {
//         label: '150%',
//         value: 150,
//       },
//       {
//         label: '175%',
//         value: 175,
//       },
//       {
//         label: '200%',
//         value: 200,
//       },
//     ];
//   }, []);

//   const effectiveValue = useMemo(() => {
//     return value || '100';
//   }, [value]);

//   const effectiveLabel = useMemo(() => {
//     return effectiveValue + '%';
//   }, [effectiveValue]);

//   const actions: MenuAction[] = useMemo(() => {
//     return choices.map(cc => {
//       const actionValue = cc.value === 100 ? '100' : cc.value.toString();
//       return {
//         id: actionValue,
//         title: cc.label,
//         state: actionValue === effectiveValue ? 'on' : undefined,
//       };
//     });
//   }, [effectiveValue, choices]);
//   return (
//     <MenuView
//       title={t(`accessibilitySettingsScreen.customFontSizeTitle`)}
//       actions={actions}
//       onPressAction={({ nativeEvent: { event } }) => {
//         onUpdate(event);
//       }}
//     >
//       <ListItem
//         isAction
//         title={t(`accessibilitySettingsScreen.customFontSizeTitle`)}
//         subtitle={effectiveLabel}
//         // // subtitleProps={{ capitalize: true }}
//         /* TODO accessibilityLabel={`${t('common.language')}: ${t(
//           `common.${language}`,
//         )}. ${t('settingsScreen.openLanguageMenu')}`}*/
//       />
//     </MenuView>
//   );
// };
