import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useStylesheet } from '../hooks/useStylesheet';
import { RadioButtonOption } from '../types/Input';
import { Theme } from '../types/Theme';
import { Badge } from './Badge';
import { Col } from './Col';
import { ListItem } from './ListItem';

interface Props<T> {
  options: RadioButtonOption<T>[];
  value: T;
  setValue: (value: T) => void;
}

export const RadioButtons = <T,>({ options, value, setValue }: Props<T>) => {
  const styles = useStylesheet(createStyles);
  const { t } = useTranslation();
  return (
    <Col style={{ gap: 16 }}>
      {options.map((radioDefinition, index) => {
        const isSelected = radioDefinition.key === value;
        const badge =
          radioDefinition.key === 'toothpic' ? (
            <Badge
              text={t('mfaScreen.experimental')}
              foregroundColor={styles.badge.color}
              backgroundColor={styles.badge.backgroundColor}
            />
          ) : undefined;
        return (
          <ListItem
            key={index}
            title={radioDefinition.title}
            subtitle={radioDefinition.description}
            style={[styles.listItem, isSelected && styles.listItemSelected]}
            onPress={() => setValue(radioDefinition.key)}
            titleStyle={[styles.radioText, { flex: 0 }]}
            subtitleStyle={styles.radioDescription}
            badge={badge}
            trailingItem={
              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioSelectedInner} />}
              </View>
            }
          />
        );
      })}
    </Col>
  );
};

const createStyles = ({
  colors,
  spacing,
  fontSizes,
  palettes,
  fontWeights,
}: Theme) =>
  StyleSheet.create({
    listItem: {
      backgroundColor: colors.white,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.surface,
    },
    listItemSelected: {
      backgroundColor: colors.white,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: palettes.lightBlue[600],
    },
    radio: {
      width: fontSizes.xl,
      height: fontSizes.xl,
      borderRadius: fontSizes.xl / 2,
      backgroundColor: colors.surface,
      borderColor: palettes.gray[500],
      borderWidth: 2,
    },
    radioText: {
      color: palettes.primary[600],
      fontWeight: fontWeights.semibold,
    },
    radioDescription: {
      marginTop: spacing[1],
      color: palettes.gray[400],
    },
    radioSelected: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: fontSizes.xl / 2,
      borderColor: palettes.info[700],
    },
    radioSelectedInner: {
      width: fontSizes.xl / 2.5,
      height: fontSizes.xl / 2.5,
      borderRadius: fontSizes.xl / 5,
      backgroundColor: colors.white,
      position: 'absolute',
    },
    badge: {
      color: palettes.lightBlue[600],
      backgroundColor: palettes.lightBlue[100],
    },
  });
