//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { Fragment, type ReactNode } from "react";
import { head } from "~/next/metadata";
import { rc } from "~/next/rc";

const Layout = rc<{ children: ReactNode }>(({ children }) => {
  return <Fragment>{children}</Fragment>;
});

export const metadata = head({
  title: "Business card | d-exclaimation",
  description: "Email, domain, and socials",
});

export default Layout;
