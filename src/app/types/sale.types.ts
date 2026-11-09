export type SaleTableColumnKey =
  "cost" | "retail" | "wholesale" | "quantity" | "unit";

export type SaleColumnKey = SaleTableColumnKey | "margin";

export type SalePriceMode = "retail" | "wholesale";

export type SaleActionKey =
  "offerCustomers" | "repayDebt" | "online" | "returnGoods" | "oneTime";
