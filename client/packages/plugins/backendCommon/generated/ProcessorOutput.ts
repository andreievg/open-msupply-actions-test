// This file was generated by [ts-rs](https://github.com/Aleph-Alpha/ts-rs). Do not edit this file manually.
import type { ChangelogFilter } from './ChangelogFilter';

export type ProcessorOutput =
  | { t: 'SkipOnError'; v: boolean }
  | { t: 'Filter'; v: ChangelogFilter }
  | { t: 'Process'; v: string | null };
