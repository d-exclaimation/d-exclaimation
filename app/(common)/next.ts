//
//  next.ts
//  d-exclaimation
//
//  Local, React 19 compatible stand-in for `@d-exclaimation/next`
//

import type { Metadata } from "next";
import type { FunctionComponent, ReactNode } from "react";

/**
 * Declare a React component (client or async server component).
 */
export function rc<P = {}>(fn: FunctionComponent<P>): FunctionComponent<P> {
  return fn;
}

/**
 * Declare a Next.js App router page component.
 */
export function page(fn: FunctionComponent<{}>): FunctionComponent<{}> {
  return fn;
}

/**
 * Declare a Next.js App router layout component.
 */
export function layout(
  fn: FunctionComponent<{ children: ReactNode }>
): FunctionComponent<{ children: ReactNode }> {
  return fn;
}

/**
 * Declare the metadata of a page or layout.
 */
export function meta(meta: Metadata): Metadata {
  return meta;
}
