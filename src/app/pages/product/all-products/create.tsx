import { ProductCreate } from "@/features/product/ProductCreate";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <ProductCreate />;

Page.getLayout = getDefaultLayout;

export default Page;
