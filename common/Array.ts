//
//  Array.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

export const of = <T>(...args: T[]) => args;

export const fill = <T>(count: number, generate: (i: number) => T) =>
  [...new Array(count).fill(null)].map((_, i) => generate(i));
