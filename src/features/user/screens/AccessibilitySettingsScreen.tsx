import { useMemo } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import { SafeAreaView, ScrollView } from 'react-native';

import { Col } from '@lib/ui/components/Col';
import { ListItem } from '@lib/ui/components/ListItem';
import { OverviewList } from '@lib/ui/components/OverviewList';
import { Section } from '@lib/ui/components/Section';
import { SectionHeader } from '@lib/ui/components/SectionHeader';
import { SwitchListItem } from '@lib/ui/components/SwitchListItem';
import { MenuAction, MenuView } from '@react-native-menu/menu';

import { BottomBarSpacer } from '../../../core/components/BottomBarSpacer';
import { usePreferencesContext } from '../../../core/contexts/PreferencesContext';

interface AccessibilityItemProps {
  t: TFunction;
  value?: string;
  // onUpdate: (value: string) => void;
}

export const AccessibilitySettingsScreen = () => {
  const { t } = useTranslation();
  const { accessibility } = usePreferencesContext();

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic">
      <SafeAreaView>
        <Col pv={5}>
          <Section>
            <SectionHeader
              title={t('accessibilitySettingsScreen.customFontSectionTitle')}
            />
            <OverviewList indented>
              <CustomFontListItem t={t} value={accessibility?.fontFamily} />
              <CustomFontPlacementListItem
                t={t}
                value={accessibility?.fontPlacement}
              />
            </OverviewList>
          </Section>
          <Section>
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
          </Section>
        </Col>
        <BottomBarSpacer />
      </SafeAreaView>
    </ScrollView>
  );
};

const CustomFontListItem = ({ t, value }: AccessibilityItemProps) => {
  const choices = useMemo(() => {
    return [
      'Montserrat (default)',
      'Open Dyslexic',
      'Dyslexie',
      'EasyReading',
      'Sylexiad',
    ];
  }, []);

  const effectiveValue = useMemo(() => {
    return value || 'default';
  }, [value]);

  const actions: MenuAction[] = useMemo(() => {
    return choices.map(cc => {
      const actionValue = cc.endsWith('(default)') ? 'default' : cc;
      return {
        id: actionValue,
        title: cc,
        state: actionValue === effectiveValue ? 'on' : undefined,
      };
    });
  }, [effectiveValue, choices]);

  return (
    <MenuView
      title={t(`accessibilitySettingsScreen.customFontAction`)}
      actions={actions}
      onPressAction={({ nativeEvent: { event } }) => {
        // onUpdate(effectiveValue);
      }}
    >
      <ListItem
        isAction
        title={t(`accessibilitySettingsScreen.customFontTitle`)}
        subtitle="Montserrat (default)"
        /* TODO accessibilityLabel={`${t('common.language')}: ${t(
          `common.${language}`,
        )}. ${t('settingsScreen.openLanguageMenu')}`}*/
      />
    </MenuView>
  );
};

const CustomFontPlacementListItem = ({ t, value }: AccessibilityItemProps) => {
  const choices = useMemo(() => {
    // places in which to use the custom font for accessibility
    return ['None', 'Long text', 'All text'];
  }, []);

  const effectiveValue = useMemo(() => {
    return value || 'none';
  }, [value]);

  const effectiveLabel = useMemo(() => {
    return effectiveValue.replace('-', ' ');
  }, [effectiveValue]);

  const actions: MenuAction[] = useMemo(() => {
    return choices.map(cc => {
      const choiceId = cc.toLowerCase().replace(' ', '-');
      return {
        id: choiceId,
        title: cc,
        state: choiceId === effectiveValue ? 'on' : undefined,
      };
    });
  }, [effectiveValue, choices]);

  return (
    <MenuView
      title={t(`accessibilitySettingsScreen.customFontPlacement`)}
      actions={actions}
      onPressAction={({ nativeEvent: { event } }) => {
        // onUpdate(effectiveValue);
      }}
    >
      <ListItem
        isAction
        title={t(`accessibilitySettingsScreen.customFontPlacement`)}
        subtitle={effectiveLabel}
        subtitleProps={{ capitalize: true }}
        /* TODO accessibilityLabel={`${t('common.language')}: ${t(
          `common.${language}`,
        )}. ${t('settingsScreen.openLanguageMenu')}`}*/
      />
    </MenuView>
  );
};
