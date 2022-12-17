//
//  Array.ts
//  d-exclaimation
//
//  Created by d-exclaimation on 13 Dec 2022
//

/**
 * Function to smartly typed for the [] syntax
 * @param args Element of the array
 * @returns A typed array
 */
export const of = <T>(...args: T[]) => args;

/**
 * Generate a list with size using a function
 * @param count The size of the array
 * @param generate A function to generate each item of the array
 * @returns An array of the specified size and with the generated items
 */
export const fill = <T>(count: number, generate: (i: number) => T) =>
  [...new Array(count).fill(null)].map((_, i) => generate(i));
