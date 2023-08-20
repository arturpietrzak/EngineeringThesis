import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ThemeManager } from "~/components/ThemeManager";
import { Layout } from "~/components/Layout";
import Head from "next/head";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <>
      <Head>
        <title>Knowhow</title>
      </Head>
      <SessionProvider session={session}>
        <ThemeManager>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ThemeManager>
      </SessionProvider>
    </>
  );
};

export default api.withTRPC(MyApp);
