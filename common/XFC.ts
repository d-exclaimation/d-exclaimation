//
//  XFC.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { FC } from "react";

export type XFC<P = {}> = FC<P & { className?: string }>;

export type InferProps<T> = T extends XFC<infer P>
  ? P
  : T extends (...args: any[]) => any
  ? Parameters<T>[0]
  : never;
