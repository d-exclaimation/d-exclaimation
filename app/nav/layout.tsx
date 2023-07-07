//
//  layout.tsx
//  d-exclaimation
//
//  Created by d-exclaimation on 07 Jul 2023
//

import { layout } from "@d-exclaimation/next";
import { Fragment } from "react";

const Layout = layout(({ children }) => {
  return <Fragment>{children}</Fragment>;
});

export default Layout;
