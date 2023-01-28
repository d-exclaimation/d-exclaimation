import type { AppProps } from "next/app";
import { FC, useEffect } from "react";
import Navigation from "../components/navigation/Navigation";
import "../styles/globals.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  useEffect(() => {
    // Do not keep scroll after reload
    window.history.scrollRestoration = "manual";
  }, []);

  return (
    <div className="w-screen min-h-screen h-max bg-gradient-to-t from-neutral-600 to-white text-black">
      <Navigation />
      <Component {...pageProps} />
    </div>
  );
};

export default App;
