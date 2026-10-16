import { PageStub } from "@/features/stub/PageStub";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <PageStub pageKey="product-state" />;

Page.getLayout = getDefaultLayout;

export default Page;
