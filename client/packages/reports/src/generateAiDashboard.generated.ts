import * as Types from '@openmsupply-client/common';

import { GraphQLClient, RequestOptions } from 'graphql-request';
import gql from 'graphql-tag';
type GraphQLClientRequestHeaders = RequestOptions['requestHeaders'];
export type GenerateGrafanaDashboardMutationVariables = Types.Exact<{
  name: Types.Scalars['String']['input'];
  description: Types.Scalars['String']['input'];
}>;

export type GenerateGrafanaDashboardMutation = {
  __typename: 'Mutations';
  generateGrafanaDashboard: string;
};

export const GenerateGrafanaDashboardDocument = gql`
  mutation GenerateGrafanaDashboard($name: String!, $description: String!) {
    generateGrafanaDashboard(dashboardName: $name, prompt: $description)
  }
`;

export type SdkFunctionWrapper = <T>(
  action: (requestHeaders?: Record<string, string>) => Promise<T>,
  operationName: string,
  operationType?: string,
  variables?: any
) => Promise<T>;

const defaultWrapper: SdkFunctionWrapper = (
  action,
  _operationName,
  _operationType,
  _variables
) => action();

export function getSdk(
  client: GraphQLClient,
  withWrapper: SdkFunctionWrapper = defaultWrapper
) {
  return {
    GenerateGrafanaDashboard(
      variables: GenerateGrafanaDashboardMutationVariables,
      requestHeaders?: GraphQLClientRequestHeaders
    ): Promise<GenerateGrafanaDashboardMutation> {
      return withWrapper(
        wrappedRequestHeaders =>
          client.request<GenerateGrafanaDashboardMutation>(
            GenerateGrafanaDashboardDocument,
            variables,
            { ...requestHeaders, ...wrappedRequestHeaders }
          ),
        'GenerateGrafanaDashboard',
        'mutation',
        variables
      );
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
