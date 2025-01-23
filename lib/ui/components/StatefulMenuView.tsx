import { useCallback, useMemo } from 'react';

import { MenuAction, MenuView } from '@react-native-menu/menu';
import { MenuComponentProps } from '@react-native-menu/menu/src/types';

import { IS_ANDROID } from '../../../src/core/constants';

export const StatefulMenuView = ({
  actions,
  children,
  ...props
}: MenuComponentProps) => {
  const mapAction = useCallback((action: MenuAction) => {
    if (action.state === 'on') {
      return {
        ...action,
        state: undefined,
        title: `✓ ${action.title}`,
      };
    }
    return action;
  }, []);

  const effectiveActions = useMemo(() => {
    if (!IS_ANDROID) return actions;

    return actions.map(action => {
      if (action.subactions) {
        return {
          ...action,
          subactions: action.subactions.map(mapAction),
        };
      }
      return mapAction(action);
    });
  }, [actions, mapAction]);
  return (
    <MenuView actions={effectiveActions} {...props}>
      {children}
    </MenuView>
  );
};
