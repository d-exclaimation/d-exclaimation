//
//  WithHead.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 16 Dec 2022
//

import type { FC } from "react";
import type { InferProps } from "../common/XFC";
import Head from "../components/Head";

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
