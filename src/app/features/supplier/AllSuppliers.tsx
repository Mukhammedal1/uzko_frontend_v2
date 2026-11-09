"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { BasePagination } from "@/component/base/pagination/BasePagination";
import { Button } from "@/component/ui/button";
import { useColumnVisibility } from "@/composable/useColumnVisibility";
import { useDebouncedValue } from "@/composable/useDebouncedValue";
import {
  SUPPLIER_EXPORT_FILE_NAME,
  SUPPLIERS_COLUMNS_STORAGE_KEY,
  SUPPLIERS_DEFAULT_COLUMNS,
  SUPPLIERS_DEFAULT_FILTERS,
  SUPPLIERS_DEFAULT_LIMIT,
  SUPPLIERS_DEFAULT_PAGE,
  SUPPLIERS_LIMIT_OPTIONS,
  SUPPLIERS_SEARCH_DEBOUNCE_MS,
  SUPPLIERS_SKELETON_ROWS,
  SUPPLIERS_STATS_PARAMS,
} from "@/constants/supplier/supplier.constants";
import { SupplierDeleteDialog } from "@/features/supplier/SupplierDeleteDialog";
import { SupplierExportDialog } from "@/features/supplier/SupplierExportDialog";
import { SupplierFormDialog } from "@/features/supplier/SupplierFormDialog";
import { SuppliersStats } from "@/features/supplier/SuppliersStats";
import { SuppliersTable } from "@/features/supplier/SuppliersTable";
import { SuppliersToolbar } from "@/features/supplier/SuppliersToolbar";
import {
  useCreateSupplierMutation,
  useDeleteSuppliersMutation,
  useSuppliersPageQuery,
  useUpdateSupplierMutation,
} from "@/rest/query/supplier/supplier.query";
import type {
  SupplierDeleteTarget,
  SupplierExportColumn,
  SupplierExportFormat,
  SupplierFilterKey,
  SupplierFilters,
  SupplierPayload,
  SupplierRow,
  SuppliersQueryParams,
} from "@/types/supplier.types";
import { buildSupplierExportRows, buildSupplierStats } from "@/utils/supplier";
import { downloadXlsx, printPdf } from "@/utils/table-export";

const toBool = (value: SupplierFilters["has_debt"]) =>
  value === "all" ? undefined : value === "yes";

export function AllSuppliers() {
  const t = useTranslations("supplier");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(SUPPLIERS_DEFAULT_PAGE);
  const [limit, setLimit] = useState(SUPPLIERS_DEFAULT_LIMIT);
  const [filters, setFilters] = useState<SupplierFilters>(
    SUPPLIERS_DEFAULT_FILTERS,
  );
  const { visibility, setColumn } = useColumnVisibility(
    SUPPLIERS_COLUMNS_STORAGE_KEY,
    SUPPLIERS_DEFAULT_COLUMNS,
  );
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SupplierDeleteTarget | null>(
    null,
  );

  const debouncedSearch = useDebouncedValue(
    search.trim(),
    SUPPLIERS_SEARCH_DEBOUNCE_MS,
  );

  const params = useMemo<SuppliersQueryParams>(
    () => ({
      page,
      limit,
      search: debouncedSearch || undefined,
      has_debt: toBool(filters.has_debt),
      has_payment: toBool(filters.has_payment),
      has_image: toBool(filters.has_image),
    }),
    [page, limit, debouncedSearch, filters],
  );

  const suppliers = useSuppliersPageQuery(params);
  const totals = useSuppliersPageQuery(SUPPLIERS_STATS_PARAMS);
  const createSupplier = useCreateSupplierMutation();
  const updateSupplier = useUpdateSupplierMutation();
  const deleteSuppliers = useDeleteSuppliersMutation();

  const items = useMemo(() => suppliers.data?.items ?? [], [suppliers.data]);

  const stats = useMemo(
    () =>
      buildSupplierStats(totals.data?.summary ?? [], totals.data?.total ?? 0),
    [totals.data],
  );

  const resetPage = () => {
    setPage(SUPPLIERS_DEFAULT_PAGE);
    setSelected(new Set());
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    resetPage();
  };

  const handleFilter = (key: SupplierFilterKey, value: string) => {
    setFilters((current) => ({ ...current, [key]: value }) as SupplierFilters);
    resetPage();
  };

  const handleFiltersReset = () => {
    setFilters(SUPPLIERS_DEFAULT_FILTERS);
    resetPage();
  };

  const handleLimit = (value: number) => {
    setLimit(value);
    resetPage();
  };

  const handleToggle = (id: number) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleToggleAll = (checked: boolean) =>
    setSelected(checked ? new Set(items.map((item) => item.id)) : new Set());

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (supplier: SupplierRow) => {
    setEditing(supplier);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    createSupplier.reset();
    updateSupplier.reset();
    setFormOpen(false);
  };

  const handleSubmit = (payload: SupplierPayload) => {
    const options = { onSuccess: handleCloseForm };

    if (editing) {
      updateSupplier.mutate({ id: editing.id, payload }, options);
      return;
    }
    createSupplier.mutate(payload, options);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    deleteSuppliers.mutate(deleteTarget.ids, {
      onSuccess: () => {
        setSelected(new Set());
        setDeleteTarget(null);
      },
    });
  };

  const handleExport = (
    format: SupplierExportFormat,
    columns: SupplierExportColumn[],
  ) => {
    const rows = buildSupplierExportRows(
      items.filter((item) => selected.has(item.id)),
      columns.map((column) => column.key),
    );
    const table = {
      title: t("export.title"),
      fileName: `${SUPPLIER_EXPORT_FILE_NAME}-${new Date().toISOString().slice(0, 10)}`,
      headers: columns.map((column) => column.label),
      rows,
    };

    if (format === "xlsx") downloadXlsx(table);
    else printPdf(table);
    setExportOpen(false);
  };

  const handleCloseDelete = () => {
    deleteSuppliers.reset();
    setDeleteTarget(null);
  };

  const isInitialLoading = suppliers.isPending && !suppliers.data;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card">
        <SuppliersStats stats={stats} />

        <SuppliersToolbar
          search={search}
          filters={filters}
          selectedCount={selected.size}
          onSearchChange={handleSearch}
          onFilterChange={handleFilter}
          onFiltersReset={handleFiltersReset}
          onExport={() => setExportOpen(true)}
          onAdd={handleAdd}
        />

        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          aria-busy={suppliers.isFetching}
        >
          {suppliers.isError && !suppliers.data ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-muted-foreground">{t("loadError")}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => suppliers.refetch()}
              >
                {t("retry")}
              </Button>
            </div>
          ) : isInitialLoading ? (
            <ul className="flex flex-col gap-px p-3" aria-label={t("loading")}>
              {Array.from({ length: SUPPLIERS_SKELETON_ROWS }, (_, index) => (
                <li
                  key={index}
                  className="h-14 animate-pulse rounded-md bg-muted/60"
                />
              ))}
            </ul>
          ) : items.length === 0 ? (
            <div className="flex h-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              {t("empty")}
            </div>
          ) : (
            <SuppliersTable
              suppliers={items}
              selected={selected}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              visibility={visibility}
              onColumnChange={setColumn}
              onEdit={handleEdit}
              onDelete={(supplier) =>
                setDeleteTarget({ ids: [supplier.id], name: supplier.fullname })
              }
            />
          )}
        </div>

        <div className="shrink-0 border-t px-2 py-1">
          <BasePagination
            page={suppliers.data?.page ?? page}
            totalPages={suppliers.data?.totalPages ?? 1}
            limit={limit}
            limitOptions={SUPPLIERS_LIMIT_OPTIONS}
            limitLabel={t("limit")}
            previousLabel={t("previous")}
            nextLabel={t("next")}
            pageLabel={t("page")}
            disabled={suppliers.isFetching}
            onPageChange={(value) => {
              setPage(value);
              setSelected(new Set());
            }}
            onLimitChange={handleLimit}
          />
        </div>
      </section>

      <SupplierFormDialog
        open={formOpen}
        supplier={editing}
        pending={createSupplier.isPending || updateSupplier.isPending}
        onSubmit={handleSubmit}
        onClose={handleCloseForm}
      />

      <SupplierExportDialog
        open={exportOpen}
        count={selected.size}
        onConfirm={handleExport}
        onClose={() => setExportOpen(false)}
      />

      <SupplierDeleteDialog
        target={deleteTarget}
        pending={deleteSuppliers.isPending}
        failed={deleteSuppliers.isError}
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
