import { API_BASE_PATH } from '@env';
import {
  BASE_PATH,
  Configuration,
  ConfigurationParameters,
} from '@polito/api-client';
import { DefaultConfig } from '@polito/api-client/runtime';

export const createApiConfiguration = (token?: string) => {
  const basePath = API_BASE_PATH ?? BASE_PATH;
  console.debug(`Expecting a running API at ${basePath}`);

  const configurationParameters: ConfigurationParameters = {
    basePath,
  };

  if (token) {
    configurationParameters.accessToken = token;
  }

  DefaultConfig.config = new Configuration(configurationParameters);
};
