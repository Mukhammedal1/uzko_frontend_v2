import { PurchaseCreate } from "@/features/purchase/PurchaseCreate";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <PurchaseCreate />;

Page.getLayout = getDefaultLayout;

export default Page;
