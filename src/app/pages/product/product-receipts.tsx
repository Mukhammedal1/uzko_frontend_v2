import { AllPurchases } from "@/features/purchase/AllPurchases";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <AllPurchases />;

Page.getLayout = getDefaultLayout;

export default Page;
