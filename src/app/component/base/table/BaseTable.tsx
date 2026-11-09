import { BaseTableColumnsMenu } from "@/component/base/table/BaseTableColumnsMenu";
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
  columnVisibility,
  columnsLabel,
  onColumnVisibilityChange,
}: BaseTableProps<T>) {
  const visibleColumns = columns.filter(
    (column) =>
      column.toggleable === false || columnVisibility?.[column.key] !== false,
  );

  const menuItems = columns
    .filter((column) => column.toggleable !== false)
    .map((column) => ({
      key: column.key,
      label: column.label ?? String(column.header ?? column.key),
    }));

  const showMenu =
    Boolean(columnVisibility && onColumnVisibilityChange) &&
    menuItems.length > 0;

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
            {visibleColumns.map((column, index) => (
              <BaseTableHeadCell
                key={column.key}
                className={cn("px-4 py-3 font-medium", column.headerClassName)}
              >
                {showMenu && index === visibleColumns.length - 1 ? (
                  <span
                    className={cn(
                      "flex items-center gap-1",
                      column.headerClassName?.includes("text-center")
                        ? "justify-center"
                        : "justify-between",
                    )}
                  >
                    <span className="min-w-0 truncate">{column.header}</span>
                    <BaseTableColumnsMenu
                      items={menuItems}
                      visibility={columnVisibility ?? {}}
                      label={columnsLabel ?? ""}
                      onChange={(key, checked) =>
                        onColumnVisibilityChange?.(key, checked)
                      }
                    />
                  </span>
                ) : (
                  column.header
                )}
              </BaseTableHeadCell>
            ))}
          </BaseTableRow>
        </BaseTableHead>
        <BaseTableBody>
          {rows.map((row) => (
            <BaseTableRow
              key={getRowKey(row)}
              className="border-b last:border-b-0"
            >
              {visibleColumns.map((column) => (
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
                colSpan={visibleColumns.length}
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
