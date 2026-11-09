import { AllSuppliers } from "@/features/supplier/AllSuppliers";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <AllSuppliers />;

Page.getLayout = getDefaultLayout;

export default Page;
