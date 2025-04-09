import { Sdk } from './operations.generated';

export type logContentsByFileNameParams = { fileName: string };

export const getServerLogQueries = (sdk: Sdk) => ({
  get: {
    logLevel: async () => {
      const response = await sdk.logLevel();
      return response?.logLevel;
    },
    logContentsByFileName: async ({
      fileName,
    }: logContentsByFileNameParams) => {
      const response = await sdk.logContentsByFileName({ fileName });
      return response?.logContents;
    },
  },
});
