import React from 'react';
import { Autocomplete, useBufferState } from '@openmsupply-client/common';
import { useColdStorageTypes } from '../../api/hooks/useColdStorageTypes';
import { ColdStorageTypeFragment } from '../../api';

export interface ColdStorageTypeInputProps {
  onChange: (name: ColdStorageTypeFragment) => void;
  onInputChange?: (
    event: React.SyntheticEvent,
    value: string,
    reason: string
  ) => void;
  width?: number;
  value: ColdStorageTypeFragment | null;
  disabled?: boolean;
  clearable?: boolean;
}

export const ColdStorageTypeInput = ({
  onChange,
  width = 250,
  value,
  disabled = false,
}: ColdStorageTypeInputProps) => {
  const { data, isLoading } = useColdStorageTypes();
  const [buffer, setBuffer] = useBufferState(value);

  return (
    <Autocomplete
      disabled={disabled}
      clearable={false}
      value={buffer && { ...buffer, label: buffer.name }}
      loading={isLoading}
      onChange={(_, name) => {
        setBuffer(name);
        name && onChange(name);
      }}
      options={data?.coldStorageTypes.nodes ?? []}
      getOptionLabel={option => option.name}
      width={`${width}px`}
      popperMinWidth={width}
      isOptionEqualToValue={(option, value) => option?.id === value?.id}
    />
  );
};
