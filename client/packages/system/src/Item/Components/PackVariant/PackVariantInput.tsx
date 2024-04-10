import React, { ReactElement, useEffect, useState } from 'react';
import {
  Select,
  NumericTextInput,
  useDebounceCallback,
  Box,
  useTranslation,
} from '@openmsupply-client/common';
import { usePackVariant } from '../../context';

const ENTER_PACK_SIZE = -1;

// This field displays a packSize number input and unit pack drop down if unit
// pack variants exist

export const PackVariantInput = ({
  itemId,
  unitName,
  isDisabled,
  packSize: initialPackSize,
  onChange,
}: {
  packSize: number;
  itemId: string;
  unitName: string | null;
  isDisabled?: boolean;
  onChange: (packSize: number) => void;
}): ReactElement => {
  const { variantsControl } = usePackVariant(itemId, unitName);
  const t = useTranslation();
  const [isEnterPackSize, setIsEnterPackSize] = useState(false);
  const [shouldFocusInput, setShouldFocusInput] = useState(false);

  const [packSize, setPackSize] = useState(
    initialPackSize !== 0
      ? initialPackSize
      : // If pack size is 0 on load, set it to most used variant or 1 (ideally
        // should be default item pack)
        variantsControl?.activeVariant?.packSize || 1
  );

  // Make sure manual pack size is auto selected on load if packSize does not
  // match variant
  useEffect(() => {
    setIsEnterPackSize(
      !variantsControl?.variants.some(v => v.packSize === packSize)
    );
  }, []);

  const updater = useDebounceCallback(onChange, [onChange], 250);
  const disabled = isDisabled || false;

  // This is shared between input with drop down and without drop down
  const numberInput = () => {
    return (
      <NumericTextInput
        focusOnRender={shouldFocusInput}
        value={packSize}
        onChange={newValue => {
          setPackSize(newValue || 1);
          updater(newValue || 1);
        }}
        disabled={disabled}
      />
    );
  };

  if (!variantsControl) {
    // If no variants exist, then default to just pack size entry
    return numberInput();
  }

  const { variants } = variantsControl;

  const options = [
    ...variants.map(v => ({
      label: v.shortName,
      value: v.packSize,
    })),
    {
      label: t('label.custom'),
      value: ENTER_PACK_SIZE,
    },
  ];
  return (
    <Box display="flex" flexDirection="row">
      <Select
        options={options}
        value={isEnterPackSize ? ENTER_PACK_SIZE : packSize}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const newValue = Number(e.target.value);

          // When manually entered pack size is selected, turn on manual entry
          // and set pack size to 1
          const isEnterPackSizeSelected = newValue === ENTER_PACK_SIZE;
          const newPackSize = isEnterPackSizeSelected ? 1 : newValue;

          setPackSize(newPackSize);
          setIsEnterPackSize(isEnterPackSizeSelected);
          setShouldFocusInput(isEnterPackSizeSelected);
          updater(newPackSize);
        }}
        disabled={disabled}
      />

      <Box padding="4px 8px">{'/'}</Box>

      {
        /* Allow input only when manually entering pack size */
        isEnterPackSize ? (
          numberInput()
        ) : (
          <Box padding="4px 8px">{String(packSize)}</Box>
        )
      }
    </Box>
  );
};
