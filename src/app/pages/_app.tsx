import { Geist, Geist_Mono } from "next/font/google";
import App from "next/app";
import type { AppContext, AppProps } from "next/app";
import Head from "next/head";

import { I18nProvider } from "@/plugins/i18n";
import { ThemeProvider } from "@/plugins/next-themes";
import { ToastProvider } from "@/plugins/react-toastify";
import { QueryProvider } from "@/plugins/tanstack-query";
import type { AppLocale } from "@/types/i18n.types";
import type { NextPageWithLayout } from "@/types/page.types";
import { readLocaleFromCookie } from "@/utils/locale";

const geistSans = Geist({
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  subsets: ["latin", "cyrillic"],
});

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  locale: AppLocale;
};

export default function MyApp({
  Component,
  pageProps,
  locale,
}: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <>
      <Head>
        <title>UZKO</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <style
        dangerouslySetInnerHTML={{
          __html: `:root{--font-geist-sans:${geistSans.style.fontFamily};--font-geist-mono:${geistMono.style.fontFamily};}`,
        }}
      />
      <ThemeProvider>
        <I18nProvider locale={locale}>
          <ToastProvider>
            <QueryProvider>
              {getLayout(<Component {...pageProps} />)}
            </QueryProvider>
          </ToastProvider>
        </I18nProvider>
      </ThemeProvider>
    </>
  );
}

MyApp.getInitialProps = async (context: AppContext) => {
  const appProps = await App.getInitialProps(context);
  const cookieHeader =
    typeof window === "undefined"
      ? context.ctx.req?.headers.cookie
      : document.cookie;

  return { ...appProps, locale: readLocaleFromCookie(cookieHeader) };
};
