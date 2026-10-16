import { HomeRedirect } from "@/features/home/HomeRedirect";
import { getDefaultLayout } from "@/layouts/DefaultLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const HomePage: NextPageWithLayout = () => <HomeRedirect />;

HomePage.getLayout = getDefaultLayout;

export default HomePage;
