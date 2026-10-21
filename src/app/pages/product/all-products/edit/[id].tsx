import { ProductEdit } from "@/features/product/ProductEdit";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <ProductEdit />;

Page.getLayout = getDefaultLayout;

export default Page;
