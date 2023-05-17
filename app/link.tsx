//
//  link.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 17 May 2023
//

import { rc } from "@d-exclaimation/next";
import { default as NextLink } from "next/link";
import { type ReactNode } from "react";

type Props = {
  className?: string;
  href: string;
  external?: boolean;
  children: ReactNode;
};

const Link = rc<Props>(({ className, href, external, children }) => {
  if (external) {
    return (
      <a className={className} href={href} target="_blank">
        {children}
      </a>
    );
  }
  return (
    <NextLink className={className} href={href}>
      {children}
    </NextLink>
  );
});

export default Link;
