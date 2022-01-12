import { SupportedLocales } from '@common/intl';

export type GroupByItem = {
  outboundShipment?: boolean;
  inboundShipment?: boolean;
};
export type LocalStorageRecord = {
  '/appdrawer/open': boolean;
  '/detailpanel/open': boolean;
  '/localisation/locale': SupportedLocales;
  '/groupbyitem': GroupByItem;
};

export type LocalStorageKey = keyof LocalStorageRecord;
