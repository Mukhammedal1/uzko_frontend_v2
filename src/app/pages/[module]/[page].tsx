import { useRouter } from "next/router";

import { PageStub } from "@/features/stub/PageStub";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => {
  const { query } = useRouter();
  const key = typeof query.page === "string" ? query.page : "";

  return <PageStub pageKey={key} />;
};

Page.getLayout = getDefaultLayout;

export default Page;
