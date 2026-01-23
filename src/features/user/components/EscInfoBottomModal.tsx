import { PropsWithChildren, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View, ViewProps } from 'react-native';

import { faBan, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { Card } from '@lib/ui/components/Card.tsx';
import { Col } from '@lib/ui/components/Col.tsx';
import { CtaButton } from '@lib/ui/components/CtaButton.tsx';
import { Icon } from '@lib/ui/components/Icon.tsx';
import { ModalContent } from '@lib/ui/components/ModalContent.tsx';
import { Row } from '@lib/ui/components/Row.tsx';
import { Text } from '@lib/ui/components/Text.tsx';
import { useStylesheet } from '@lib/ui/hooks/useStylesheet.ts';
import { useTheme } from '@lib/ui/hooks/useTheme.ts';
import { Theme } from '@lib/ui/types/Theme.ts';

import { useConfirmationDialog } from '~/core/hooks/useConfirmationDialog.ts';
import { useDeviceOrientation } from '~/core/hooks/useDeviceOrientation.ts';
import { useDeleteEsc } from '~/core/queries/escHooks.ts';

type Props = PropsWithChildren<
  ViewProps & {
    onClose: () => void;
    scrollTo: (_index: number, _valInterval: number) => void;
  }
>;

export const EscInfoBottomModal = ({ onClose, scrollTo, ...rest }: Props) => {
  const { t } = useTranslation();
  const { palettes, dark } = useTheme();
  const style = useStylesheet(createStyle);
  const deviceOrientation = useDeviceOrientation();
  const { mutateAsync: deleteEsc, isPending: mutationsLoading } =
    useDeleteEsc();

  const handleBackCloseModal = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (deviceOrientation === 'landscape') {
      handleBackCloseModal();
    }
  }, [deviceOrientation, handleBackCloseModal]);

  const confirm = useConfirmationDialog({
    message: t('escModalInfo.revokeConfirm'),
  });

  const onPressEvent = async () => {
    if (await confirm()) {
      deleteEsc()
        .then(() => {
          handleBackCloseModal();
          scrollTo(0, 100);
        })
        .catch(async e => {
          if (e.response && e.response.status === 500) {
            const { message } = (await e.response.json()) as {
              message?: string;
            };
            Alert.alert(
              t('common.error'),
              message && e.response.careerId
                ? message + ' on ' + e.response.careerId
                : t('common.somethingWentWrong'),
            );
          }
        });
    }
  };

  return (
    <ModalContent title={t('escModalInfo.title')} close={onClose}>
      <Col pt={4} pb={8} ph={4} gap={2}>
        <Card rounded spaced translucent={false} style={style.card} {...rest}>
          <Row gap={2} style={style.firstRow}>
            <View style={style.iconContainer}>
              <Icon
                icon={faInfoCircle}
                color={palettes.orange[dark ? 400 : 600]}
                style={style.icon}
              />
            </View>
            <View style={style.textContainer}>
              <Text style={{ color: palettes.orange[dark ? 500 : 700] }}>
                {t('escModalInfo.text')}
              </Text>
            </View>
          </Row>
        </Card>
        <CtaButton
          tkey="escModalInfo.revoke"
          action={onPressEvent}
          absolute={false}
          destructive
          icon={faBan}
          loading={mutationsLoading}
        />
      </Col>
    </ModalContent>
  );
};

const createStyle = ({ palettes, dark }: Theme) =>
  StyleSheet.create({
    card: {
      borderStyle: 'solid',
      borderWidth: 1,
      borderColor: palettes.orange[dark ? 400 : 600],
      justifyContent: 'center',
    },
    firstRow: {
      padding: 10,
      justifyContent: 'center',
    },
    iconContainer: {
      padding: 10,
    },
    icon: {
      justifyContent: 'center',
      alignContent: 'center',
    },
    textContainer: {
      flex: 1,
    },
  });
