//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 07 Jul 2023
//

import { layout, meta } from "@d-exclaimation/next";
import { Fragment } from "react";

const Layout = layout(({ children }) => {
  return <Fragment>{children}</Fragment>;
});

export const metadata = meta({
  title: "Projects | d-exclaimation",
  description: "Things I proud of",
});

export default Layout;
