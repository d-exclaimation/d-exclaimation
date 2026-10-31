//
//  selection.tsx
//  d-exclaimation
//
//  The selected look, a solid face lifted off a hatched block. It shows while `selected`, or while a `group` around it is hovered or focused
//

import type { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  selected?: boolean;
  /** The ink of the face and its hatching. */
  color?: string;
};

function Selection({ children, selected, color = "#141414" }: Props) {
  return (
    <span
      data-selected={selected}
      className="relative inline-block"
      style={{ "--selection": color } as CSSProperties}
    >
      <span className="absolute inset-0 border-[1.5px] border-(--selection) bg-[repeating-linear-gradient(130deg,var(--selection)_0_1px,transparent_1px_3.5px)] opacity-0 transition-opacity duration-100 selected:opacity-100" />
      <span className="relative block px-3 py-1 transition-[translate,background-color,color] duration-100 selected:-translate-x-[5px] selected:-translate-y-[6px] selected:bg-(--selection) selected:text-[#f4f3ef] group-active:translate-x-0! group-active:translate-y-0!">
        {children}
      </span>
    </span>
  );
}

export default Selection;
