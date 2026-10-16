import { LoginForm } from "@/features/login/LoginForm";
import { getAuthLayout } from "@/layouts/AuthLayout";
import type { NextPageWithLayout } from "@/types/page.types";

const LoginPage: NextPageWithLayout = () => <LoginForm />;

LoginPage.getLayout = getAuthLayout;

export default LoginPage;
