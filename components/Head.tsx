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
      <meta property="og:image" content="https://dexclaimation.com/me.png" />
      <link rel="icon" href="https://dexclaimation.com/favicon.ico" />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="https://dexclaimation.com/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="https://dexclaimation.com/favicon-16x16.png"
      />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="https://dexclaimation.com/apple-touch-icon.png"
      />
      <link rel="manifest" href="https://dexclaimation.com/site.webmanifest" />
      <meta property="description" content={description ?? title} />
      <meta property="og:description" content={description ?? title} />
      <title>{title}</title>
    </NextHead>
  );
};

export default Head;
