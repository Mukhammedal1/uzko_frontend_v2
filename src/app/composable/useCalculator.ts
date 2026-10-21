"use client";

import { useCallback, useState } from "react";

import {
  CALCULATOR_ERROR,
  CALCULATOR_MAX_DIGITS,
} from "@/constants/layout/layout.constants";
import type { CalculatorOperator, CalculatorState } from "@/types/layout.types";

const INITIAL_STATE: CalculatorState = {
  display: "0",
  accumulator: null,
  operator: null,
  fresh: true,
};

const toText = (value: number) =>
  Number.isFinite(value) ? String(parseFloat(value.toPrecision(12))) : CALCULATOR_ERROR;

const apply = (left: number, operator: CalculatorOperator, right: number) => {
  switch (operator) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      return right === 0 ? Number.NaN : left / right;
  }
};

const base = (state: CalculatorState): CalculatorState =>
  state.display === CALCULATOR_ERROR ? INITIAL_STATE : state;

export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(INITIAL_STATE);

  const digit = useCallback((value: string) => {
    setState((previous) => {
      const current = base(previous);
      if (current.fresh) return { ...current, display: value, fresh: false };
      if (current.display.replace(/[-.]/g, "").length >= CALCULATOR_MAX_DIGITS) {
        return current;
      }
      return {
        ...current,
        display: current.display === "0" ? value : current.display + value,
      };
    });
  }, []);

  const dot = useCallback(() => {
    setState((previous) => {
      const current = base(previous);
      if (current.fresh) return { ...current, display: "0.", fresh: false };
      if (current.display.includes(".")) return current;
      return { ...current, display: `${current.display}.` };
    });
  }, []);

  const operator = useCallback((next: CalculatorOperator) => {
    setState((previous) => {
      const current = base(previous);

      if (current.operator && current.accumulator !== null && !current.fresh) {
        const result = apply(
          current.accumulator,
          current.operator,
          Number(current.display),
        );
        const display = toText(result);
        return {
          display,
          accumulator: display === CALCULATOR_ERROR ? null : result,
          operator: display === CALCULATOR_ERROR ? null : next,
          fresh: true,
        };
      }

      return {
        ...current,
        accumulator: current.operator ? current.accumulator : Number(current.display),
        operator: next,
        fresh: true,
      };
    });
  }, []);

  const equals = useCallback(() => {
    setState((previous) => {
      const current = base(previous);
      if (!current.operator || current.accumulator === null) return current;

      const result = apply(
        current.accumulator,
        current.operator,
        Number(current.display),
      );
      return {
        display: toText(result),
        accumulator: null,
        operator: null,
        fresh: true,
      };
    });
  }, []);

  const clear = useCallback(() => setState(INITIAL_STATE), []);

  const backspace = useCallback(() => {
    setState((previous) => {
      const current = base(previous);
      if (current.fresh) return current;

      const next = current.display.slice(0, -1);
      return {
        ...current,
        display: next === "" || next === "-" ? "0" : next,
      };
    });
  }, []);

  const toggleSign = useCallback(() => {
    setState((previous) => {
      const current = base(previous);
      if (current.display === "0") return current;
      return {
        ...current,
        display: current.display.startsWith("-")
          ? current.display.slice(1)
          : `-${current.display}`,
      };
    });
  }, []);

  const percent = useCallback(() => {
    setState((previous) => {
      const current = base(previous);
      return {
        ...current,
        display: toText(Number(current.display) / 100),
        fresh: true,
      };
    });
  }, []);

  return {
    state,
    digit,
    dot,
    operator,
    equals,
    clear,
    backspace,
    toggleSign,
    percent,
  };
}
