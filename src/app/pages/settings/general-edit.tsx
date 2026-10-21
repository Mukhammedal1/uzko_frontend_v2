import { SettingsGeneral } from "@/features/settings/SettingsGeneral";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const Page: NextPageWithLayout = () => <SettingsGeneral />;

Page.getLayout = getDefaultLayout;

export default Page;
