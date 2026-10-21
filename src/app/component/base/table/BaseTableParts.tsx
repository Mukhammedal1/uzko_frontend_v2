import type { ComponentProps } from "react";

export function BaseTableRoot(props: ComponentProps<"table">) {
  return <table {...props} />;
}

export function BaseTableColGroup(props: ComponentProps<"colgroup">) {
  return <colgroup {...props} />;
}

export function BaseTableCol(props: ComponentProps<"col">) {
  return <col {...props} />;
}

export function BaseTableHead(props: ComponentProps<"thead">) {
  return <thead {...props} />;
}

export function BaseTableBody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
}

export function BaseTableRow(props: ComponentProps<"tr">) {
  return <tr {...props} />;
}

export function BaseTableHeadCell(props: ComponentProps<"th">) {
  return <th {...props} />;
}

export function BaseTableCell(props: ComponentProps<"td">) {
  return <td {...props} />;
}
