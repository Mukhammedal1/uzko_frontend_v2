import { AllCustomers } from "@/features/customer/AllCustomers";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <AllCustomers />;

Page.getLayout = getDefaultLayout;

export default Page;
