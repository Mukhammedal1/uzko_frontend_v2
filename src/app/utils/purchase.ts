import { PURCHASE_DEFAULT_QUANTITY } from "@/constants/purchase/purchase.constants";
import type {
  PurchaseCreateFormValues,
  PurchaseCreatePayload,
  PurchaseEditData,
  PurchaseHistoryRow,
  PurchaseUpdatePayload,
  PurchaseCurrencyTotal,
  PurchaseDetail,
  PurchaseFinishFormValues,
  PurchaseItemFormValues,
  PurchaseItemPayload,
  PurchasePaymentFormValues,
  PurchasePaymentPayload,
  PurchasePaymentMethod,
  PurchasePaymentProvider,
  PurchaseProductOption,
  PurchaseRow,
  PurchasesPage,
  PurchaseTotals,
} from "@/types/purchase.types";
import { parseNumber } from "@/utils/product-create";

type Raw = Record<string, unknown>;

const isRecord = (value: unknown): value is Raw =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const toText = (value: unknown) => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return "";
};

const toNumber = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const toAmount = (value: unknown) => {
  const parsed = toNumber(value);
  return parsed > 0 ? String(parsed) : "";
};

const toId = (id: unknown, nested: unknown) => {
  const direct = toNumber(id);
  if (direct > 0) return String(direct);

  const inner = isRecord(nested) ? toNumber(nested.id) : 0;
  return inner > 0 ? String(inner) : "";
};

const findList = (raw: unknown): unknown[] => {
  if (Array.isArray(raw)) return raw;
  if (!isRecord(raw)) return [];

  for (const key of ["rows", "data", "items", "results"]) {
    const value = raw[key];
    if (Array.isArray(value)) return value;
    if (isRecord(value)) {
      const nested = findList(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
};

const toUserName = (user: unknown) => {
  if (!isRecord(user)) return "";

  const employee = isRecord(user.business_employee)
    ? user.business_employee
    : {};
  const name = [toText(employee.first_name), toText(employee.last_name)]
    .filter(Boolean)
    .join(" ");

  return name || toText(user.email);
};

export const normalizePurchaseDetail = (raw: unknown): PurchaseDetail => {
  const items =
    isRecord(raw) && Array.isArray(raw.purchase_items)
      ? raw.purchase_items
      : [];
  const stocks = new Set<string>();
  const totals = new Map<string, number>();
  let remainingQuantity: number | null = null;

  items.filter(isRecord).forEach((item) => {
    if (
      item.remaining_quantity !== undefined &&
      item.remaining_quantity !== null
    )
      remainingQuantity =
        (remainingQuantity ?? 0) + toNumber(item.remaining_quantity);

    const stock = isRecord(item.stock) ? toText(item.stock.name) : "";
    if (stock) stocks.add(stock);

    const currency = isRecord(item.purchase_price_currency)
      ? toText(item.purchase_price_currency.name)
      : "";
    totals.set(
      currency,
      round((totals.get(currency) ?? 0) + toNumber(item.total_price)),
    );
  });

  return {
    stocks: [...stocks],
    currencies: [...totals.keys()].filter(Boolean),
    totals: [...totals.entries()].map(([currency, amount]) => ({
      currency,
      amount,
    })),
    remainingQuantity,
  };
};

const toPurchase = (raw: Raw): PurchaseRow => ({
  id: toNumber(raw.id),
  createdAt: toText(raw.created_at),
  updatedAt: toText(raw.updated_at),
  supplier: isRecord(raw.supplier) ? toText(raw.supplier.fullname) : "",
  user: toUserName(raw.user),
  totalPrice: toNumber(raw.total_price),
  paidAmount: toNumber(raw.paid_amount),
  paymentMethod: toText(raw.payment_method),
  note: toText(raw.note),
});

export const normalizePurchasesPage = (
  raw: unknown,
  { page, limit }: { page: number; limit: number },
): PurchasesPage => {
  const items = findList(raw).filter(isRecord).map(toPurchase);
  const root = isRecord(raw) ? raw : {};
  const total = toNumber(root.total, items.length);
  const pageSize = toNumber(root.limit, limit);

  return {
    items,
    total,
    page: toNumber(root.page, page),
    limit: pageSize,
    totalPages: Math.max(
      1,
      toNumber(root.totalPages, Math.ceil(total / Math.max(pageSize, 1))),
    ),
  };
};

const toProductOption = (
  product: Raw,
  variant: Raw,
  showVariantName: boolean,
): PurchaseProductOption => {
  const productName = toText(product.name);
  const variantName = toText(variant.name);

  return {
    key: `${toNumber(product.id)}:${toNumber(variant.id)}`,
    productId: toNumber(product.id),
    variantId: toNumber(variant.id),
    label:
      showVariantName && variantName && variantName !== productName
        ? `${productName} — ${variantName}`
        : productName || variantName,
    article: toText(variant.artikul ?? variant.article ?? variant.sku),
    purchasePrice: toAmount(variant.purchase_price),
    purchaseCurrencyId: toId(
      variant.purchase_price_currency_id,
      variant.purchase_price_currency,
    ),
    wholesalePrice: toAmount(variant.wholesale_price),
    wholesaleCurrencyId: toId(
      variant.wholesale_price_currency_id,
      variant.wholesale_price_currency,
    ),
    wholesalePercent: toAmount(variant.wholesale_price_percentage),
    retailPrice: toAmount(variant.retail_price),
    retailCurrencyId: toId(
      variant.retail_price_currency_id,
      variant.retail_price_currency,
    ),
    retailPercent: toAmount(variant.retail_price_percentage),
    stockId: toId(variant.stock_id, variant.stock),
    shelfId: toId(variant.shelf_number_id, variant.shelf_number),
  };
};

export const normalizePurchaseProducts = (
  raw: unknown,
): PurchaseProductOption[] =>
  findList(raw)
    .filter(isRecord)
    .flatMap((product) => {
      const rawVariants =
        product.variants ?? product.product_variants ?? product.productVariants;
      const variants = Array.isArray(rawVariants)
        ? rawVariants.filter(isRecord)
        : "purchase_price" in product
          ? [product]
          : [];

      return variants.map((variant) =>
        toProductOption(product, variant, variants.length > 1),
      );
    });

export const createEmptyPurchaseItem = (
  stockId = "",
  shelfId = "",
  supplierId = "",
): PurchaseItemFormValues => ({
  itemId: null,
  supplierId,
  productId: null,
  variantId: null,
  productName: "",
  quantity: "",
  purchasePrice: "",
  purchaseCurrencyId: "",
  wholesalePrice: "",
  wholesaleCurrencyId: "",
  wholesalePercent: "",
  retailPrice: "",
  retailCurrencyId: "",
  retailPercent: "",
  stockId,
  shelfId,
});

export const applyProductToItem = (
  item: PurchaseItemFormValues,
  option: PurchaseProductOption,
): PurchaseItemFormValues => ({
  ...item,
  productId: option.productId,
  variantId: option.variantId,
  productName: option.label,
  quantity:
    item.quantity.trim() === "" ? PURCHASE_DEFAULT_QUANTITY : item.quantity,
  purchasePrice: option.purchasePrice,
  purchaseCurrencyId: option.purchaseCurrencyId,
  wholesalePrice: option.wholesalePrice,
  wholesaleCurrencyId: option.wholesaleCurrencyId,
  wholesalePercent: option.wholesalePercent,
  retailPrice: option.retailPrice,
  retailCurrencyId: option.retailCurrencyId,
  retailPercent: option.retailPercent,
  stockId: option.stockId || item.stockId,
  shelfId: option.shelfId || item.shelfId,
});

const round = (value: number) => Math.round(value * 100) / 100;

const optionalAmount = (value: string) => {
  const parsed = parseNumber(value);
  return value.trim() !== "" && parsed > 0 ? round(parsed) : undefined;
};

const toItemPayload = (
  item: PurchaseItemFormValues,
  defaultCurrencyId: number,
): PurchaseItemPayload => {
  const wholesale = optionalAmount(item.wholesalePrice);
  const wholesalePercent = optionalAmount(item.wholesalePercent);
  const retailPercent = optionalAmount(item.retailPercent);
  const shelfId = Number(item.shelfId);

  return {
    ...(item.itemId ? { id: item.itemId } : {}),
    product_id: item.productId ?? 0,
    product_variant_id: item.variantId ?? 0,
    stock_id: Number(item.stockId),
    ...(shelfId > 0 ? { shelf_number_id: shelfId } : {}),
    quantity: round(parseNumber(item.quantity)),
    purchase_price: round(parseNumber(item.purchasePrice)),
    purchase_price_currency_id:
      Number(item.purchaseCurrencyId) || defaultCurrencyId,
    retail_price: round(parseNumber(item.retailPrice)),
    retail_price_currency_id:
      Number(item.retailCurrencyId) || defaultCurrencyId,
    ...(retailPercent !== undefined
      ? { retail_price_percentage: retailPercent }
      : {}),
    ...(wholesale !== undefined
      ? {
          wholesale_price: wholesale,
          wholesale_price_currency_id:
            Number(item.wholesaleCurrencyId) || defaultCurrencyId,
        }
      : {}),
    ...(wholesalePercent !== undefined
      ? { wholesale_price_percentage: wholesalePercent }
      : {}),
  };
};

export const calcPurchaseTotals = (
  values: PurchaseCreateFormValues,
  defaultCurrencyId: string,
): PurchaseTotals => {
  const [first] = values.items;
  const sums = new Map<string, number>();

  values.items.forEach((item) => {
    const currencyId = item.purchaseCurrencyId || defaultCurrencyId;
    const line = round(
      parseNumber(item.quantity) * parseNumber(item.purchasePrice),
    );
    sums.set(currencyId, round((sums.get(currencyId) ?? 0) + line));
  });

  return {
    count: values.items.length,
    firstName: first?.productName ?? "",
    firstQuantity: first ? parseNumber(first.quantity) : 0,
    byCurrency: [...sums.entries()].map(([currencyId, amount]) => ({
      currencyId,
      amount,
    })),
  };
};

export const emptyPaymentRow = (
  currencyId: string,
): PurchasePaymentFormValues => ({ currencyId, amount: "" });

export const calcPurchaseDebts = (
  totals: PurchaseCurrencyTotal[],
  payments: PurchasePaymentFormValues[],
  defaultCurrencyId: string,
): PurchaseCurrencyTotal[] =>
  totals.flatMap((total) => {
    const paid = payments
      .filter(
        (payment) =>
          (payment.currencyId || defaultCurrencyId) === total.currencyId,
      )
      .reduce((sum, payment) => sum + parseNumber(payment.amount), 0);
    const debt = round(total.amount - paid);

    return debt > 0 ? [{ currencyId: total.currencyId, amount: debt }] : [];
  });

const toPaymentPayloads = (
  payments: PurchasePaymentFormValues[],
  defaultCurrencyId: number,
): PurchasePaymentPayload[] =>
  payments.flatMap((payment) => {
    const amount = optionalAmount(payment.amount);

    return amount === undefined
      ? []
      : [
          {
            currency_id: Number(payment.currencyId) || defaultCurrencyId,
            amount,
          },
        ];
  });

export const normalizePurchaseHistory = (raw: unknown): PurchaseHistoryRow[] =>
  (Array.isArray(raw) ? raw : []).filter(isRecord).map((row) => {
    const business = isRecord(row.business_currency)
      ? row.business_currency
      : {};
    const currency = isRecord(business.currency) ? business.currency : {};

    return {
      id: toNumber(row.id),
      purchaseId: toNumber(row.purchase_id),
      createdAt: toText(row.created_at),
      user: toUserName(row.user),
      note: toText(row.note),
      debtDelta: toNumber(row.debt_delta),
      paidDelta: toNumber(row.paid_delta),
      currency: toText(currency.name),
    };
  });

export const buildPurchaseUpdatePayload = (
  values: PurchaseCreateFormValues,
  finish: PurchaseFinishFormValues,
  defaultCurrencyId: number,
): PurchaseUpdatePayload => {
  const reason = finish.editReason.trim();

  return {
    ...buildPurchasePayload(values, finish, defaultCurrencyId),
    ...(reason ? { edit_reason: reason } : {}),
  };
};

export const purchaseProductIds = (raw: unknown): number[] => {
  const items =
    isRecord(raw) && Array.isArray(raw.purchase_items)
      ? raw.purchase_items
      : [];

  return [
    ...new Set(
      items
        .filter(isRecord)
        .map((item) => toNumber(item.product_id))
        .filter((id) => id > 0),
    ),
  ];
};

export const normalizePurchaseEdit = (
  raw: unknown,
  products: { id: number; raw: unknown }[],
  defaultCurrencyId: string,
): PurchaseEditData => {
  const root = isRecord(raw) ? raw : {};
  const rawItems = Array.isArray(root.purchase_items)
    ? root.purchase_items.filter(isRecord)
    : [];
  const supplierId = toId(root.supplier_id, root.supplier);

  const names = new Map<number, { name: string; variants: number }>();
  products.forEach(({ id, raw: product }) => {
    if (!isRecord(product)) return;
    names.set(id, {
      name: toText(product.name),
      variants: Array.isArray(product.variants) ? product.variants.length : 1,
    });
  });

  const items = rawItems.map((item): PurchaseItemFormValues => {
    const variant = isRecord(item.variant) ? item.variant : {};
    const productId = toNumber(item.product_id);
    const product = names.get(productId);
    const variantName = toText(variant.name);
    const productName = product?.name ?? "";
    const label =
      product &&
      product.variants > 1 &&
      variantName &&
      variantName !== productName
        ? `${productName} — ${variantName}`
        : productName || variantName;

    return {
      itemId: toNumber(item.id) || null,
      supplierId,
      productId,
      variantId: toNumber(item.product_variant_id),
      productName: label,
      quantity: toAmount(item.quantity),
      purchasePrice: toAmount(item.purchase_price),
      purchaseCurrencyId: toId(
        item.purchase_price_currency_id,
        item.purchase_price_currency,
      ),
      wholesalePrice: toAmount(item.wholesale_price),
      wholesaleCurrencyId: toId(
        item.wholesale_price_currency_id,
        item.wholesale_price_currency,
      ),
      wholesalePercent: toAmount(item.wholesale_price_percentage),
      retailPrice: toAmount(item.retail_price),
      retailCurrencyId: toId(
        item.retail_price_currency_id,
        item.retail_price_currency,
      ),
      retailPercent: toAmount(item.retail_price_percentage),
      stockId: toId(item.stock_id, item.stock),
      shelfId: toId(item.shelf_number_id, item.shelf_number),
    };
  });

  return {
    id: toNumber(root.id),
    items,
    finish: {
      paymentMethod: toText(root.payment_method) || "CASH",
      paymentProvider: toText(root.payment_provider),
      paidAmounts: [
        { currencyId: defaultCurrencyId, amount: toAmount(root.paid_amount) },
      ],
      note: toText(root.note),
      editReason: "",
    },
  };
};

export const buildPurchasePayload = (
  values: PurchaseCreateFormValues,
  finish: PurchaseFinishFormValues,
  defaultCurrencyId: number,
): PurchaseCreatePayload => {
  const paid = toPaymentPayloads(finish.paidAmounts, defaultCurrencyId);
  const note = finish.note.trim();

  return {
    supplier_id: Number(values.items[0]?.supplierId),
    payment_method: finish.paymentMethod as PurchasePaymentMethod,
    ...(finish.paymentProvider
      ? { payment_provider: finish.paymentProvider as PurchasePaymentProvider }
      : {}),
    ...(paid.length > 0 ? { paid_amounts: paid } : {}),
    ...(note ? { note } : {}),
    purchase_items: values.items.map((item) =>
      toItemPayload(item, defaultCurrencyId),
    ),
  };
};
