//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { Fragment, type ReactNode } from "react";
import type { Metadata } from "next";

function Layout({ children }: { children: ReactNode }) {
  return <Fragment>{children}</Fragment>;
}

export const metadata: Metadata = {
  title: "Business card | d-exclaimation",
  description: "Email, domain, and socials",
};

export default Layout;
