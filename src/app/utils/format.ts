const numberFormatter = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 2,
});

export const formatNumber = (value: number) => numberFormatter.format(value);

export const formatPercent = (value: number) => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
};

const dateTimeFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "short",
  timeStyle: "short",
});

export const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dateTimeFormatter.format(date);
};
