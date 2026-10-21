import {
  BaseTableBody,
  BaseTableCell,
  BaseTableHead,
  BaseTableHeadCell,
  BaseTableRoot,
  BaseTableRow,
} from "@/component/base/table/BaseTableParts";
import { cn } from "@/lib/utils";
import type { BaseTableProps } from "@/types/common.types";

export function BaseTable<T>({
  columns,
  rows,
  getRowKey,
  emptyLabel,
  loading = false,
  minWidthClassName = "min-w-md",
  className,
}: BaseTableProps<T>) {
  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-auto rounded-xl border",
        className,
      )}
    >
      <BaseTableRoot className={cn("w-full text-sm", minWidthClassName)}>
        <BaseTableHead className="sticky top-0 bg-muted/60">
          <BaseTableRow className="border-b text-left">
            {columns.map((column) => (
              <BaseTableHeadCell
                key={column.key}
                className={cn("px-4 py-3 font-medium", column.headerClassName)}
              >
                {column.header}
              </BaseTableHeadCell>
            ))}
          </BaseTableRow>
        </BaseTableHead>
        <BaseTableBody>
          {rows.map((row) => (
            <BaseTableRow key={getRowKey(row)} className="border-b last:border-b-0">
              {columns.map((column) => (
                <BaseTableCell
                  key={column.key}
                  className={cn("px-4 py-2", column.cellClassName)}
                >
                  {column.cell(row)}
                </BaseTableCell>
              ))}
            </BaseTableRow>
          ))}
          {!loading && rows.length === 0 && emptyLabel ? (
            <BaseTableRow>
              <BaseTableCell
                colSpan={columns.length}
                className="px-4 py-8 text-center text-muted-foreground"
              >
                {emptyLabel}
              </BaseTableCell>
            </BaseTableRow>
          ) : null}
        </BaseTableBody>
      </BaseTableRoot>
    </div>
  );
}
