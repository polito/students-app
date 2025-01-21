import { API_BASE_PATH } from '@env';
import {
  BASE_PATH,
  Configuration,
  ConfigurationParameters,
} from '@polito/api-client';
import { DefaultConfig } from '@polito/api-client/runtime';

/**
 * Updates the global API configuration used by all clients
 */
export const updateGlobalApiConfiguration = ({
  /**
   * Bearer token
   */
  token,
  /**
   * Preferred language
   */
  language = 'en',
}: {
  token?: string;
  language?: string;
}) => {
  const basePath = API_BASE_PATH ?? BASE_PATH;
  console.debug(`Expecting a running API at ${basePath}`);

  const configurationParameters: ConfigurationParameters = {
    basePath,
    headers: {
      // This currently has no effect but makes sure we don't hit the device
      // http cache, getting results in the wrong language
      // eslint-disable-next-line @typescript-eslint/naming-convention
      'Accept-Language': language,
    },
  };

  if (token) {
    configurationParameters.accessToken = token;
  }

  DefaultConfig.config = new Configuration(configurationParameters);
};
