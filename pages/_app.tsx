import type { AppProps } from "next/app";
import type { FC } from "react";
import Navigation from "../components/navigation/Navigation";
import "../styles/globals.css";

const App: FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <div className="w-screen h-screen bg-white text-black">
      <Navigation />
      <Component {...pageProps} />
    </div>
  );
};

export default App;
