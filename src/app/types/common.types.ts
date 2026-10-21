import type { Key, ReactNode } from "react";

export type SelectOption = {
  value: string;
  label: string;
};

export type MutationToastKind = "created" | "updated" | "deleted";

export type NumericOptions = {
  decimals: number;
  allowNegative?: boolean;
  grouping?: boolean;
};

export type BaseTableColumn<T> = {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  headerClassName?: string;
  cellClassName?: string;
};

export type BaseTableProps<T> = {
  columns: BaseTableColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => Key;
  emptyLabel?: string;
  loading?: boolean;
  minWidthClassName?: string;
  className?: string;
};
