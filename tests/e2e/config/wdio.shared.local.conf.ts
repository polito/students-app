import { config as baseConfig } from './wdio.shared.conf';

export const config: WebdriverIO.Config = {
  ...baseConfig,

  services: [...(baseConfig.services || []), ['appium', {}]],
};
