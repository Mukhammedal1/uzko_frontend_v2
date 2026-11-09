import { CustomerPaymentsHistory } from "@/features/customer/CustomerPaymentsHistory";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <CustomerPaymentsHistory />;

Page.getLayout = getDefaultLayout;

export default Page;
