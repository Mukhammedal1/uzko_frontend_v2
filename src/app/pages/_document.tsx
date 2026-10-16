import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="uz" className="h-full antialiased">
      <Head>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className="min-h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
