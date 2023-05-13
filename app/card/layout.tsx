//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 08 May 2023
//

import { layout, meta } from "@d-exclaimation/next";
import { Fragment } from "react";

const Layout = layout(({ children }) => {
  return <Fragment>{children}</Fragment>;
});

export const metadata = meta({
  title: "Business card | d-exclaimation",
  description: "Email, domain, and socials",
});

export default Layout;
