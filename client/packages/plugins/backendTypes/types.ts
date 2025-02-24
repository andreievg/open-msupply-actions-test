import { PluginTypes } from './generated/PluginTypes';

export type BackendPlugins = {
  average_monthly_consumption?: (
    _: PluginTypes['average_monthly_consumption']['input']
  ) => PluginTypes['average_monthly_consumption']['output'];
  transform_requisition_lines?: (
    _: PluginTypes['transform_requisition_lines']['input']
  ) => PluginTypes['transform_requisition_lines']['output'];
};

declare global {
  var sql: (_: string) => [Record<string, any>];
  var log: (_: any) => void;
}
