import { CreateSale } from "@/features/sale/CreateSale";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <CreateSale />;

Page.getLayout = getDefaultLayout;

export default Page;
