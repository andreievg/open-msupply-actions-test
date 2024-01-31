import React, { FC, useState } from 'react';
import { StandardTextFieldProps } from '@common/components';
import { BasicTextInput } from './BasicTextInput';
import { NumUtils } from '@common/utils';
import { useFormatNumber, useCurrency } from '@common/intl';
export interface NumericTextInputProps
  extends Omit<StandardTextFieldProps, 'onChange'> {
  onChange?: (value: number | undefined) => void;
  width?: number | string;
  defaultValue?: number;
  allowNegative?: boolean;
  min?: number;
  max?: number;
  precision?: number;
  step?: number;
  multiplier?: number;
  value: number | undefined;
}

export const NumericTextInput: FC<NumericTextInputProps> = React.forwardRef(
  (
    {
      sx,
      InputProps,
      width = 75,
      onChange = () => {},
      defaultValue,
      allowNegative,
      min = allowNegative ? -NumUtils.MAX_SAFE_API_INTEGER : 0,
      max = NumUtils.MAX_SAFE_API_INTEGER,
      precision = 0,
      step = 1,
      multiplier = 10,
      value,
      ...props
    },
    ref
  ) => {
    const { format, parse } = useFormatNumber();
    const {
      options: { separator, decimal },
    } = useCurrency();
    const [textValue, setTextValue] = useState<string>(
      format((value as number) ?? defaultValue ?? '')
    );

    const inputRegex = new RegExp(
      `^-?\\d*${decimal === '.' ? '\\.' : decimal}?\\d*$`
    );

    return (
      <BasicTextInput
        ref={ref}
        sx={{
          '& .MuiInput-input': { textAlign: 'right', width: `${width}px` },
          ...sx,
        }}
        InputProps={InputProps}
        onChange={e => {
          const input = e.target.value
            // Remove separators
            .replace(separator, '')
            // Remove negative if not allowed
            .replace(min <= 0 ? '-' : '', '');

          if (input === '') {
            setTextValue('');
            onChange(undefined);
            return;
          }

          // Prevent illegal characters from being entered
          if (inputRegex.test(input)) setTextValue(input);
          else return;

          if (input.endsWith(decimal)) return;

          const parsed = parse(input);

          if (Number.isNaN(parsed)) return;

          const constrained = constrain(parsed, precision, min, max);

          setTextValue(format(constrained));
          onChange(constrained);
        }}
        onKeyDown={e => {
          if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;

          e.preventDefault();
          const change =
            (e.key === 'ArrowUp' ? step : -step) *
            (e.shiftKey ? multiplier : 1);

          const newNum = constrain(
            (value ?? Math.max(min, 0)) + change,
            precision,
            min,
            max
          );
          setTextValue(format(newNum));
          onChange(newNum);
        }}
        onFocus={e => e.target.select()}
        {...props}
        value={textValue}
      />
    );
  }
);

const constrain = (value: number, decimals: number, min: number, max: number) =>
  NumUtils.constrain(NumUtils.round(value, decimals), min, max);
