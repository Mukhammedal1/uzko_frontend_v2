import { PageStub } from "@/features/stub/PageStub";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <PageStub pageKey="sale-analytics" />;

Page.getLayout = getDefaultLayout;

export default Page;
