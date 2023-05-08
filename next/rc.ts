import type { FC, ReactElement, ValidationMap, WeakValidationMap } from "react";

/**
 * React Server Component
 */
export interface RSC<P = {}> {
  (props: P, context?: any): Promise<ReactElement<any, any> | null>;
  propTypes?: WeakValidationMap<P> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

/**
 * React Client Component
 */
export type RCC<P = {}> = FC<P>;

/**
 * Create a new component either server or client
 */
export function rc<P = {}>(component: RSC<P> | RCC<P>): RCC<P> {
  return component as RCC<P>;
}
