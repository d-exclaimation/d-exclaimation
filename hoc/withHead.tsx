//
//  WithHead.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 16 Dec 2022
//

import type { FC } from "react";
import type { InferProps } from "../common/XFC";
import Head from "../components/Head";

/**
 * Wrapped a component with a head with useful meta information
 * @param Component Component to wrapped with
 * @param param1.title The meta title to be added to the head
 * @param param1.description The meta description to be added to the head
 */
export function withHead<P extends object>(
  Component: FC<P>,
  { title, description }: InferProps<typeof Head>
): FC<P> {
  return (props) => (
    <>
      <Head {...{ title, description }} />
      <Component {...props} />
    </>
  );
}
