//
//  link.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 17 May 2023
//

import { default as NextLink } from "next/link";
import { type ReactNode } from "react";

type Props = {
  className?: string;
  href: string;
  external?: boolean;
  children: ReactNode;
};

function Link({ className, href, external, children }: Props) {
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
}

export default Link;
