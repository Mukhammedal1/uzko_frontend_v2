import { PurchaseEdit } from "@/features/purchase/PurchaseEdit";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <PurchaseEdit />;

Page.getLayout = getDefaultLayout;

export default Page;
