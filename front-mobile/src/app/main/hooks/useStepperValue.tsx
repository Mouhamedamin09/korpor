import { useState } from "react";

export const MIN_STEPPER_VALUE = 50;

const clampValue = (val: number, min: number, max: number) =>
  Math.min(Math.max(val, min), max);

export function useStepperValue({
  initialValue = 250,
  minValue = MIN_STEPPER_VALUE,
  maxValue = 5999,
}: {
  initialValue?: number;
  minValue?: number;
  maxValue?: number;
}) {
  const [value, setValue] = useState(() =>
    clampValue(initialValue, minValue, maxValue)
  );

  const increase = () =>
    setValue((prev) => clampValue(prev + 10, minValue, maxValue));
  const decrease = () =>
    setValue((prev) => clampValue(prev - 10, minValue, maxValue));
  const changeManually = (input: string) => {
    const num = parseInt(input, 10);
    if (!isNaN(num)) setValue(clampValue(num, minValue, maxValue));
    else if (input === "") setValue(minValue); // Optional: reset to min if empty
  };

  return {
    value,
    setValue,
    increase,
    decrease,
    changeManually,
  };
}
