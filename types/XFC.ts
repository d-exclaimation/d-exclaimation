//
//  XFC.ts
//  dexclaimation
//
//  Created by d-exclaimation on 11 Dec 2022
//

import type { FC } from "react";

export type XFC<P = {}> = FC<P & { className?: string }>;
