import { v4 } from 'uuid';

export * from './formatters';
export * from './testing';
export * from './debounce';
export * from './dateFunctions';
export * from './arrays';

export type UUID = string;

export const generateUUID = (): UUID => v4();
