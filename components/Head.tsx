//
//  Head.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 16 Dec 2022
//

import { default as NextHead } from "next/head";
import type { XFC } from "../common/XFC";

type Props = {
  title: string;
  description?: string;
};

const Head: XFC<Props> = ({ title, description }) => {
  return (
    <NextHead>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      />
      <meta property="title" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://dexclaimation.com/" />
      <meta property="og:image" content="/me.png" />
      <link rel="icon" href="/images/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta property="description" content={description ?? title} />
      <meta property="og:description" content={description ?? title} />
      <title>{title}</title>
    </NextHead>
  );
};

export default Head;
