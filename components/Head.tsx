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

/**
 * Create a Next.js head with useful meta information
 * @param param0.title The meta title for this page
 * @param param0.description The meta description for this page
 */
const Head: XFC<Props> = ({ title, description }) => {
  return (
    <NextHead>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
      />
      <meta property="title" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:site_name" content="d-exclaimation" />
      <meta property="og:type" content="object" />
      <meta property="og:url" content="https://d-exclaimation.me/" />
      <meta property="og:image" content="/me.gif" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="600" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@dexclaimation" />
      <meta name="twitter:image" content="/me.gif" />
      <meta name="twitter:description" content={description} />
      <link rel="icon" href="/favicon.ico" />
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
        href="/d-exclaimation.me/apple-touch-icon.png"
      />
      <link rel="manifest" href="/site.webmanifest" />
      <meta property="description" content={description ?? title} />
      <meta property="og:description" content={description ?? title} />
      <title>{title}</title>
    </NextHead>
  );
};

export default Head;
