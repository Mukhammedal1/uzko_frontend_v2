import { AllProducts } from "@/features/product/AllProducts";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <AllProducts />;

Page.getLayout = getDefaultLayout;

export default Page;
