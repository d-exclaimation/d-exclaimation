import type { AppProps } from "next/app";
import Head from "next/head";
import type { FC } from "react";
import Navigation from "../components/navigation/Navigation";
import "../styles/globals.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
      </Head>
      <div className="w-screen h-screen bg-white text-black">
        <Navigation />
        <Component {...pageProps} />
      </div>
    </>
  );
};

export default App;
