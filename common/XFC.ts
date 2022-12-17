//
//  XFC.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { FC } from "react";

/**
 * Extended Function Component with optional className for Tailwind
 */
export type XFC<P = {}> = FC<P & { className?: string }>;

/**
 * Infer props type for any function component
 */
export type InferProps<T> = T extends XFC<infer P>
  ? P
  : T extends FC<infer P>
  ? P
  : T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never;
