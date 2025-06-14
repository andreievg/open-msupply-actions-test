// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { SyncMessageRowStatus } from './SyncMessageRowStatus';
import type { SyncMessageRowType } from './SyncMessageRowType';

export type SyncMessageRow = {
  id: string;
  to_store_id: string | null;
  from_store_id: string | null;
  body: string;
  created_datetime: string;
  status: SyncMessageRowStatus;
  type: SyncMessageRowType;
  error_message: string | null;
};
