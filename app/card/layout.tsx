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
