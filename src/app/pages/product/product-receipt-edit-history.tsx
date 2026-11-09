import { PurchaseEditHistory } from "@/features/purchase/PurchaseEditHistory";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <PurchaseEditHistory />;

Page.getLayout = getDefaultLayout;

export default Page;
