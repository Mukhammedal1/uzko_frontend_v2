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
  label?: string;
  toggleable?: boolean;
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
  columnVisibility?: Record<string, boolean>;
  columnsLabel?: string;
  onColumnVisibilityChange?: (key: string, checked: boolean) => void;
};

export type BaseColumnsMenuItem = {
  key: string;
  label: string;
};

export type ColumnVisibility = Record<string, boolean>;

export type ExportTable = {
  title: string;
  fileName: string;
  headers: string[];
  rows: string[][];
};

export type BaseTabItem = {
  key: string;
  label: string;
  active: boolean;
};

export type BaseAutocompleteOption = {
  value: string;
  label: string;
  description?: string;
};
