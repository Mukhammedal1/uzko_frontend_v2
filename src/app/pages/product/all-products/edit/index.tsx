import { ProductBulkEdit } from "@/features/product/ProductBulkEdit";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <ProductBulkEdit />;

Page.getLayout = getDefaultLayout;

export default Page;
